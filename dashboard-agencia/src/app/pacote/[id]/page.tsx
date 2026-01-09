'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { useParams } from 'next/navigation'
import {
    Plane, MapPin, Calendar, Check, Play, Image as ImageIcon,
    ArrowLeft, Send, Star, Clock, Coffee, Languages,
    Hotel, CheckCircle2, XCircle, ChevronRight, Users,
    Lock, ArrowRight, MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export default function PackageDetailsPage() {
    const { id } = useParams()
    const [pkg, setPkg] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeImg, setActiveImg] = useState('')

    useEffect(() => {
        const fetchPackage = async () => {
            const { data } = await supabase
                .from('packages')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setPkg(data)
                if (data.images?.[0]) setActiveImg(data.images[0])
            }
            setLoading(false)
        }
        if (id) fetchPackage()
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
                <PublicHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </main>
                <PublicFooter />
            </div>
        )
    }

    if (!pkg) {
        return (
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-[#0d171c] dark:text-white">
                <PublicHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <Plane className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold">Pacote não encontrado</h2>
                    <Link href="/destinos" className="mt-4 text-primary font-bold hover:underline">Voltar para Destinos</Link>
                </main>
                <PublicFooter />
            </div>
        )
    }

    const shareOnWhatsApp = () => {
        const message = `Olá! Tenho interesse no pacote: ${pkg.title}. Gostaria de mais informações!`
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display antialiased text-[#0d171c] dark:text-gray-100">
            <PublicHeader />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Link href="/" className="hover:text-primary transition-colors">Início</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/destinos" className="hover:text-primary transition-colors">Destinos</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{pkg.title}</span>
                </nav>

                {/* Gallery Grid */}
                <div className="mb-8 grid h-[400px] w-full gap-4 sm:h-[500px] grid-cols-1 md:grid-cols-4 md:grid-rows-2 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                    {/* Main Image */}
                    <div className="relative md:col-span-2 md:row-span-2 group overflow-hidden cursor-pointer">
                        <img
                            src={activeImg || (pkg.images?.[0])}
                            alt={pkg.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Secondary Images - Showing up to 4 more */}
                    {pkg.images?.slice(1, 5).map((img: string, i: number) => (
                        <div key={i} className="relative group overflow-hidden cursor-pointer hidden md:block" onClick={() => setActiveImg(img)}>
                            <img
                                src={img}
                                alt={`Gallery ${i}`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {i === 3 && pkg.images.length > 5 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                    <span className="font-bold text-white text-lg">+ {pkg.images.length - 5} Fotos</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Placeholder if not enough images */}
                    {(!pkg.images || pkg.images.length < 5) && Array.from({ length: 4 - (pkg.images?.length - 1 || 0) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 hidden md:flex">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
                    {/* Left Column: Details */}
                    <div className="flex flex-col gap-10">
                        {/* Header Info */}
                        <div className="space-y-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{pkg.title}</h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <MapPin className="text-primary w-4 h-4" />
                                            Pernambuco, Brasil
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Clock className="text-primary w-4 h-4" />
                                            7 Dias / 6 Noites
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <Star className="text-yellow-400 w-5 h-5 fill-current" />
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">4.9</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">(128 avaliações)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chips */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-primary/20 transition-colors">
                                    <Plane className="text-primary w-4 h-4" />
                                    Aéreo Incluso
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-primary/20 transition-colors">
                                    <Hotel className="text-primary w-4 h-4" />
                                    Hospedagem Premium
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-primary/20 transition-colors">
                                    <Coffee className="text-primary w-4 h-4" />
                                    Café da Manhã
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-primary/20 transition-colors">
                                    <Languages className="text-primary w-4 h-4" />
                                    Guia Bilíngue
                                </div>
                            </div>
                        </div>

                        {/* Overview */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                Visão Geral da Experiência
                            </h2>
                            <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-lg whitespace-pre-wrap">
                                {pkg.description}
                            </p>
                        </section>

                        {/* Itinerary Timeline (Placeholder logic for design) */}
                        <section className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15232d] p-8 shadow-sm">
                            <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Itinerário Detalhado</h2>
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-10 pl-8">
                                <div className="relative group">
                                    <span className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-[3px] border-white dark:border-[#15232d] bg-primary shadow-lg scale-110"></span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dia 1: Chegada e Recepção</h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Recepção privativa no aeroporto e transfer VIP para sua hospedagem. À tarde, reunião de boas-vindas e introdução ao roteiro.</p>
                                </div>
                                <div className="relative group">
                                    <span className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-[3px] border-white dark:border-[#15232d] bg-slate-300 dark:bg-slate-600 group-hover:bg-primary transition-all group-hover:scale-110"></span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dia 2: Explorando o Paraíso</h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Passeio panorâmico pelos principais pontos turísticos, com paradas estratégicas para fotos e banhos de mar inesquecíveis.</p>
                                </div>
                                <div className="relative group">
                                    <span className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-[3px] border-white dark:border-[#15232d] bg-slate-300 dark:bg-slate-600 group-hover:bg-primary transition-all group-hover:scale-110"></span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dias 3-6: Atividades e Lazer</h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Dias dedicados à atividades exclusivas, trilhas guiadas e momentos de relaxamento total nas melhores áreas do destino.</p>
                                </div>
                                <div className="relative group">
                                    <span className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-[3px] border-white dark:border-[#15232d] bg-slate-300 dark:bg-slate-600 group-hover:bg-primary transition-all group-hover:scale-110"></span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dia 7: Retorno</h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Café da manhã especial de despedida, tempo livre para últimas recordações e transfer exclusivo para o aeroporto.</p>
                                </div>
                            </div>
                        </section>

                        {/* Inclusions / Exclusions */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">O que está incluído</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4 rounded-3xl bg-green-50 dark:bg-green-900/10 p-6 border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Incluso no Pacote
                                    </h4>
                                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <li className="flex gap-2">Passagens aéreas ida e volta</li>
                                        <li className="flex gap-2">Hospedagem em hotel selecionado</li>
                                        <li className="flex gap-2">Translados privativos</li>
                                        <li className="flex gap-2">Seguro viagem completo</li>
                                        <li className="flex gap-2">Guias locais certificados</li>
                                    </ul>
                                </div>
                                <div className="space-y-4 rounded-3xl bg-red-50 dark:bg-red-900/10 p-6 border border-red-100 dark:border-red-900/20">
                                    <h4 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        Não Incluso
                                    </h4>
                                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <li className="flex gap-2">Almoços e jantares extras</li>
                                        <li className="flex gap-2">Taxas governamentais locais</li>
                                        <li className="flex gap-2">Bebidas e despesas pessoais</li>
                                        <li className="flex gap-2">Passeios opcionais não citados</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Videos Section */}
                        {pkg.videos && pkg.videos.length > 0 && (
                            <section className="space-y-8">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Play className="w-6 h-6 text-red-500 fill-current" />
                                    Vídeos do Destino
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {pkg.videos.map((url: string, idx: number) => (
                                        <div key={idx} className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl group border border-slate-200 dark:border-slate-800">
                                            <video
                                                src={url}
                                                controls
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="relative">
                        <div className="sticky top-28 space-y-6">
                            <div className="rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15232d] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-primary/5">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Preço por pessoa a partir de</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tight text-primary">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                                        <span className="text-sm text-slate-400 line-through">R$ {(pkg.price * 1.2).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-orange/10 px-3 py-1.5 text-xs font-bold text-accent-orange border border-accent-orange/20">
                                        <Tag className="w-3.5 h-3.5" />
                                        Oferta de Inauguração do Site
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Próximos Grupos</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <select className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-12 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                                                <option>Outubro 2024</option>
                                                <option>Dezembro 2024</option>
                                                <option>Janeiro 2025</option>
                                                <option>Março 2025</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Viajantes</label>
                                        <div className="relative group">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <select className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-12 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                                                <option>1 Adulto</option>
                                                <option selected>2 Adultos</option>
                                                <option>2 Adultos + 1 Criança</option>
                                                <option>Grupo (4+ pessoas)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-4">
                                        <button
                                            onClick={shareOnWhatsApp}
                                            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-orange px-6 py-5 text-lg font-black text-white shadow-xl shadow-accent-orange/30 transition-all hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0"
                                        >
                                            Reservar Agora
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                        <button
                                            onClick={shareOnWhatsApp}
                                            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                                        >
                                            <MessageCircle className="w-5 h-5 text-green-500" />
                                            Dúvidas? Fale Conosco
                                        </button>
                                    </div>

                                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Lock className="w-3 h-3" />
                                        Pagamento Digital 100% Seguro
                                    </div>
                                </div>
                            </div>

                            {/* Promo Card */}
                            <div className="rounded-[32px] bg-gradient-to-br from-primary to-blue-600 p-8 text-white shadow-xl border border-white/10 group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Parcele sua viagem</h3>
                                        <p className="text-sm text-blue-100/80 leading-relaxed font-medium">Pague em até 10x sem juros no cartão ou via PIX com desconto especial.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}

// Internal icons helper for missing lucide ones
function Tag(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" />
        </svg>
    )
}

function CreditCard(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
