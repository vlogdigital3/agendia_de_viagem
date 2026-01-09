'use client'

import { useState, useEffect } from 'react'
import { X, Image as ImageIcon, Video, Plus, Trash2, Save, Upload, Check, MapPin, Calendar, Plane, Bus, CheckCircle2, ListOrdered, GripVertical } from 'lucide-react'
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
    featured: boolean
    transport_type?: string
    duration_days?: number
    duration_nights?: number
    destination_city?: string
    destination_state?: string
    inclusions?: string[]
    exclusions?: string[]
    itinerary?: { day: number; title: string; description: string }[]
    category?: string
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
    const [featured, setFeatured] = useState(false)
    const [transportType, setTransportType] = useState('Aéreo')
    const [durationDays, setDurationDays] = useState('1')
    const [durationNights, setDurationNights] = useState('0')
    const [destinationCity, setDestinationCity] = useState('')
    const [destinationState, setDestinationState] = useState('')
    const [inclusions, setInclusions] = useState<string[]>([])
    const [exclusions, setExclusions] = useState<string[]>([])
    const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([])
    const [category, setCategory] = useState('Geral')

    const [newInclusion, setNewInclusion] = useState('')
    const [newExclusion, setNewExclusion] = useState('')

    // Reset or populate form
    useEffect(() => {
        if (isOpen) {
            if (item) {
                setTitle(item.title)
                setDescription(item.description || '')
                setPrice(item.price?.toString() || '')
                setImages(item.images || [])
                setVideos(item.videos || [])
                setFeatured(item.featured || false)
                setTransportType(item.transport_type || 'Aéreo')
                setDurationDays(item.duration_days?.toString() || '1')
                setDurationNights(item.duration_nights?.toString() || '0')
                setDestinationCity(item.destination_city || '')
                setDestinationState(item.destination_state || '')
                setInclusions(item.inclusions || [])
                setExclusions(item.exclusions || [])
                setItinerary(item.itinerary || [])
                setCategory(item.category || 'Geral')
            } else {
                setTitle('')
                setDescription('')
                setPrice('')
                setImages([])
                setVideos([])
                setFeatured(false)
                setTransportType('Aéreo')
                setDurationDays('1')
                setDurationNights('0')
                setDestinationCity('')
                setDestinationState('')
                setInclusions([])
                setExclusions([])
                setItinerary([])
                setCategory('Geral')
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
                price: parseFloat(price.replace(',', '.')) || 0,
                images,
                videos,
                active: true,
                featured,
                transport_type: transportType,
                duration_days: parseInt(durationDays) || 1,
                duration_nights: parseInt(durationNights) || 0,
                destination_city: destinationCity,
                destination_state: destinationState,
                inclusions,
                exclusions,
                itinerary,
                category
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
        } catch (error: any) {
            console.error('Error saving package:', error)
            alert(`Erro ao salvar pacote: ${error.message || 'Verifique os dados.'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleAddInclusion = () => {
        if (newInclusion.trim()) {
            setInclusions([...inclusions, newInclusion.trim()])
            setNewInclusion('')
        }
    }

    const handleAddExclusion = () => {
        if (newExclusion.trim()) {
            setExclusions([...exclusions, newExclusion.trim()])
            setNewExclusion('')
        }
    }

    const handleAddItineraryDay = () => {
        const nextDay = itinerary.length + 1
        setItinerary([...itinerary, { day: nextDay, title: '', description: '' }])
    }

    const handleUpdateItinerary = (index: number, field: 'title' | 'description', value: string) => {
        const updated = [...itinerary]
        updated[index] = { ...updated[index], [field]: value }
        setItinerary(updated)
    }

    const handleRemoveItineraryDay = (index: number) => {
        const updated = itinerary.filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, day: i + 1 }))
        setItinerary(updated)
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Pacote</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Jericoacoara - Aventura & Charme"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            >
                                <option value="Geral">Geral</option>
                                <option value="Aventura">Aventura</option>
                                <option value="Luxo">Luxo</option>
                                <option value="Passeio">Passeio</option>
                                <option value="Internacional">Internacional</option>
                                <option value="Nacional">Nacional</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço por Pessoa (R$)</label>
                            <input
                                required
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transporte</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTransportType('Aéreo')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${transportType === 'Aéreo' ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 dark:border-gray-700 dark:text-gray-400'}`}
                                >
                                    <Plane className="w-4 h-4" /> Aéreo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransportType('Rodoviário')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${transportType === 'Rodoviário' ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 dark:border-gray-700 dark:text-gray-400'}`}
                                >
                                    <Bus className="w-4 h-4" /> Rodoviário
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duração</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(e.target.value)}
                                    placeholder="Dias"
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-center"
                                />
                                <span className="text-gray-400">/</span>
                                <input
                                    type="number"
                                    value={durationNights}
                                    onChange={(e) => setDurationNights(e.target.value)}
                                    placeholder="Noites"
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-center"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> Destino (Cidade)
                            </label>
                            <input
                                type="text"
                                value={destinationCity}
                                onChange={(e) => setDestinationCity(e.target.value)}
                                placeholder="Ex: Jericoacoara"
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-primary">Descrição Geral (Chamada para IA)</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Destaque as principais atrações deste pacote..."
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                            />
                        </div>

                        {/* Inclusions & Exclusions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-3">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> O que está INCLUSO
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newInclusion}
                                        onChange={(e) => setNewInclusion(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclusion())}
                                        placeholder="Add inclusão..."
                                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 outline-none dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddInclusion}
                                        className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {inclusions.map((inc, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                            <span className="text-sm text-green-700 dark:text-green-300">{inc}</span>
                                            <button type="button" onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))} className="text-green-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <X className="w-4 h-4" /> O que NÃO está incluso
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newExclusion}
                                        onChange={(e) => setNewExclusion(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExclusion())}
                                        placeholder="Add exclusão..."
                                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 outline-none dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddExclusion}
                                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {exclusions.map((exc, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                            <span className="text-sm text-red-700 dark:text-red-300">{exc}</span>
                                            <button type="button" onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Itinerary */}
                        <div className="md:col-span-3 space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <ListOrdered className="w-4 h-4 text-primary" /> Itinerário Detalhado
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddItineraryDay}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 flex items-center gap-2 transition-all"
                                >
                                    <Plus className="w-3 h-3" /> Adicionar Dia
                                </button>
                            </div>

                            <div className="space-y-4">
                                {itinerary.map((day, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">
                                                {day.day}
                                            </span>
                                            <input
                                                type="text"
                                                value={day.title}
                                                onChange={(e) => handleUpdateItinerary(idx, 'title', e.target.value)}
                                                placeholder="Título do Dia (Ex: Chegada em Jeri)"
                                                className="flex-1 bg-transparent font-bold text-gray-900 dark:text-white outline-none border-b border-dashed border-gray-300 focus:border-primary px-1"
                                            />
                                            <button type="button" onClick={() => handleRemoveItineraryDay(idx)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <textarea
                                            value={day.description}
                                            onChange={(e) => handleUpdateItinerary(idx, 'description', e.target.value)}
                                            placeholder="O que vai acontecer neste dia?"
                                            rows={2}
                                            className="w-full bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 outline-none border border-transparent focus:border-primary/30 resize-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-primary/10 md:col-span-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Destaque na Página Inicial</p>
                                    <p className="text-xs text-gray-500">Exibir este pacote na seção de "Ofertas Especiais" do site.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeatured(!featured)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${featured ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${featured ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
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
