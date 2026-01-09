'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { Package, Plus, Image as ImageIcon, Video, MoreHorizontal, Edit, Trash2, Star, Plane, Bus, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PackageModal from '@/components/PackageModal'

export default function PackagesPage() {
    const [packages, setPackages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<any | null>(null)

    const fetchPackages = async () => {
        setLoading(true)
        const { data } = await supabase.from('packages').select('*').order('created_at', { ascending: false })
        if (data) setPackages(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este pacote?')) {
            await supabase.from('packages').delete().eq('id', id)
            fetchPackages()
        }
    }

    useEffect(() => {
        fetchPackages()
    }, [])

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary" />
                        Pacotes de Viagem
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cadastre destinos e conteúdos para a IA utilizar.</p>
                </div>

                <button
                    onClick={() => { setSelectedPackage(null); setIsModalOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-all shadow-lg shadow-primary/30"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Pacote</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="group bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            {/* Image Preview (First Image) */}
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                {pkg.images && pkg.images.length > 0 && pkg.images[0] ? (
                                    <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <ImageIcon className="w-10 h-10 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                    <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                                        R$ {pkg.price}
                                    </div>
                                    {pkg.featured && (
                                        <div className="bg-accent-orange text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            Destaque
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{pkg.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                                    {pkg.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                        {pkg.transport_type === 'Rodoviário' ? <Bus className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                                        {pkg.transport_type || 'Aéreo'}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                        <Clock className="w-3 h-3" />
                                        {pkg.duration_days}D/{pkg.duration_nights}N
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-500 text-[10px] font-bold">
                                        <ImageIcon className="w-3 h-3" />
                                        {pkg.images?.length || 0}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs text-gray-400">Criado em {new Date(pkg.created_at).toLocaleDateString('pt-BR')}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedPackage(pkg); setIsModalOpen(true) }}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-primary transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Empty State Card if list is empty */}
                    {packages.length === 0 && (
                        <div
                            onClick={() => { setSelectedPackage(null); setIsModalOpen(true) }}
                            className="bg-gray-50 dark:bg-surface-dark border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center h-[400px] cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-600 dark:text-gray-300">Cadastrar Primeiro Pacote</h3>
                            <p className="text-sm text-gray-400 mt-2">Clique para começar</p>
                        </div>
                    )}
                </div>
            )}

            <PackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPackages}
                item={selectedPackage}
            />
        </div>
    )
}
