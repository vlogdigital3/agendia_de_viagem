'use client'

import { useState, useEffect } from 'react'
import { X, Image as ImageIcon, Video, Plus, Trash2, Save, Upload, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type Package = {
    id?: string
    title: string
    description: string
    price: number
    images: string[]
    videos: string[]
    active: boolean
}

interface PackageModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    item?: Package | null
}

export default function PackageModal({ isOpen, onClose, onSuccess, item }: PackageModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [videos, setVideos] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    // Reset or populate form
    useEffect(() => {
        if (isOpen) {
            if (item) {
                setTitle(item.title)
                setDescription(item.description || '')
                setPrice(item.price.toString())
                setImages(item.images || [])
                setVideos(item.videos || [])
            } else {
                setTitle('')
                setDescription('')
                setPrice('')
                setImages([])
                setVideos([])
            }
        }
    }, [isOpen, item])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (!e.target.files || e.target.files.length === 0) return

        setIsUploading(true)
        const files = Array.from(e.target.files)
        const newUrls: string[] = []

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${type}s/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('package-media')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('package-media')
                    .getPublicUrl(filePath)

                newUrls.push(publicUrl)
            }

            if (type === 'image') setImages([...images, ...newUrls])
            else setVideos([...videos, ...newUrls])

        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Erro ao fazer upload da imagem.')
        } finally {
            setIsUploading(false)
            // Clear input
            e.target.value = ''
        }
    }

    const handleRemoveMedia = (type: 'image' | 'video', index: number) => {
        if (type === 'image') {
            setImages(images.filter((_, i) => i !== index))
        } else {
            setVideos(videos.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title,
                description,
                price: parseFloat(price.replace(',', '.')),
                images,
                videos,
                active: true
            }

            let error;
            if (item?.id) {
                const { error: updateError } = await supabase.from('packages').update(payload).eq('id', item.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase.from('packages').insert([payload])
                error = insertError
            }

            if (error) throw error
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error saving package:', error)
            alert('Erro ao salvar pacote. Verifique os dados.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {item ? 'Editar Pacote' : 'Novo Pacote de Viagem'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Pacote</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Férias em Paris 7 Dias"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
                            <input
                                required
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição Impactante (Para IA)</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Descreva os detalhes, pontos turísticos e benefícios do pacote..."
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    {/* Media Section - Images (File Upload) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-accent-blue" />
                                Galeria de Imagens (JPG/PNG)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button type="button" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 flex items-center gap-2 transition-colors">
                                    {isUploading ? <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" /> : <Upload className="w-3 h-3" />}
                                    Fazer Upload
                                </button>
                            </div>
                        </div>

                        {/* Image Grid Preview */}
                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia('image', idx)}
                                                className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                                <span className="text-sm">Nenhuma imagem selecionada</span>
                            </div>
                        )}
                    </div>

                    {/* Media Section - Videos (File Upload) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Video className="w-4 h-4 text-accent-red" />
                                Galeria de Vídeos (MP4)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*"
                                    onChange={(e) => handleFileUpload(e, 'video')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button type="button" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors">
                                    {isUploading ? <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full" /> : <Upload className="w-3 h-3" />}
                                    Fazer Upload
                                </button>
                            </div>
                        </div>

                        {/* Video List Preview */}
                        {videos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {videos.map((url, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 flex-shrink-0">
                                                <Video className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{url.split('/').pop()}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedia('video', idx)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400">
                                <Video className="w-8 h-8 opacity-20 mb-2" />
                                <span className="text-sm">Nenhum vídeo selecionado</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium shadow-lg shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Salvar Pacote
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
