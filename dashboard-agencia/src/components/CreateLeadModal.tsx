'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Mail, MapPin, Save, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateLeadModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        destination_interest: '',
        status: 'new'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('leads')
                .insert([
                    {
                        ...formData,
                        ai_summary: 'Inserido manualmente pelo agente.'
                    }
                ])

            if (error) throw error

            onSuccess()
            onClose()
            setFormData({ name: '', phone: '', email: '', destination_interest: '', status: 'new' })
        } catch (error) {
            console.error('Error creating lead:', error)
            alert('Erro ao criar lead.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-800/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" />
                            Novo Lead
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="5511999999999"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Destino</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        name="destination_interest"
                                        required
                                        value={formData.destination_interest}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Ex: Paris"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold">Email (Opcional)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="joao@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold">Fase Inicial</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                            >
                                <option value="new" className="bg-gray-900">Novo Lead</option>
                                <option value="qualified" className="bg-gray-900">Qualificado</option>
                                <option value="negotiation" className="bg-gray-900">Em Negociação</option>
                                <option value="payment_pending" className="bg-gray-900">Aguardando Pagto</option>
                                <option value="won" className="bg-gray-900">Venda Realizada</option>
                                <option value="lost" className="bg-gray-900">Perdido</option>
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Salvando...' : 'Criar Lead'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
