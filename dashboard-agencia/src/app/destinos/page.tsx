'use client'

export const runtime = 'edge'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, ArrowUpRight, Plane, Star, ChevronLeft, ChevronRight, Heart, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function DestinosPageContent() {
    const [packages, setPackages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [priceRange, setPriceRange] = useState(10000)
    const [sortBy, setSortBy] = useState('Recomendados')
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    useEffect(() => {
        const fetchPackages = async () => {
            const { data } = await supabase
                .from('packages')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false })

            if (data) setPackages(data)
            setLoading(false)
        }
        fetchPackages()
    }, [])

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPrice = pkg.price <= priceRange
        return matchesSearch && matchesPrice
    })

    // Sorting logic
    const sortedPackages = [...filteredPackages].sort((a, b) => {
        if (sortBy === 'Menor Preço') return a.price - b.price
        if (sortBy === 'Maior Preço') return b.price - a.price
        return 0 // Default to 'Recomendados' (original order)
    })

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display antialiased text-[#0d171c] dark:text-gray-100 overflow-x-hidden">
            <PublicHeader />

            {/* Page Header (Full Width Hero) */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 motion-safe:animate-slow-zoom"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(16, 28, 34, 0.6) 0%, rgba(16, 28, 34, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDzpg0Q_Ie2i08zeN3S24et0ejRzAryPNCDlzA0ZPG2noiZ1M-VdSbquHQzj_H3JHR9kqbfHfmm66kClIp_fubdbFzSaYlzJQtJsTiqK_m67utLenkJxEQydtKDI43wRnTz7KrOVJxp2TCSkc-bhQ2Rd8D2MYd_WQvRFJCU_GcV7QyXmEyUHH6pvJQb2CHPRxV-dHfyBwdS8j0n3e7Le9CNVE27jhlG4s_aAmSht76nRIpIS1EH8u_htqZ-bB_1AM7bNzytALu2ZgXu")'
                    }}
                ></div>
                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <span className="bg-primary/20 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 inline-block">Mundo Afora</span>
                    <h1 className="text-white text-4xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl uppercase">Descubra seu <span className="text-primary">Destino</span></h1>
                    <p className="text-gray-200 text-lg md:text-2xl font-medium max-w-2xl mx-auto drop-shadow-md">Curadoria exclusiva das melhores experiências nacionais e internacionais.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="layout-container flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full px-4 sm:px-10 py-16 gap-12 relative">

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-sm">{sortedPackages.length} destinos encontrados</span>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtros
                    </button>
                </div>

                {/* Sidebar Filters (Desktop & Mobile Drawer) */}
                <AnimatePresence>
                    {(isFilterOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                        <motion.aside
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`fixed inset-0 z-[110] lg:relative lg:inset-auto lg:z-0 lg:w-[320px] lg:block flex-shrink-0 ${isFilterOpen ? 'flex' : 'hidden md:hidden'}`}
                        >
                            {/* Backdrop Mobile */}
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                                onClick={() => setIsFilterOpen(false)}
                            />

                            <div className="relative w-4/5 max-w-[320px] lg:w-full h-full lg:h-auto bg-white dark:bg-[#15232b] lg:bg-transparent p-8 lg:p-0 flex flex-col shadow-2xl lg:shadow-none">
                                <div className="flex items-center justify-between mb-8 lg:mb-6">
                                    <h3 className="text-2xl font-black text-[#0d171c] dark:text-white">Filtros</h3>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="lg:hidden p-2 text-gray-400"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 lg:sticky lg:top-28">
                                    {/* Search within filters */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-2">Buscar Destino</label>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                            <input
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-primary text-[#0d171c] dark:text-white transition-all"
                                                placeholder="Cidade ou país..."
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between ml-2">
                                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block">Preço Máximo</label>
                                            <button
                                                onClick={() => setPriceRange(10000)}
                                                className="text-[10px] font-black uppercase tracking-[.1em] text-primary"
                                            >
                                                Limpar
                                            </button>
                                        </div>
                                        <div className="px-2">
                                            <span className="text-3xl font-black text-primary block mb-6 tracking-tighter">R$ {priceRange.toLocaleString('pt-BR')}</span>
                                            <input
                                                className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                                max="20000"
                                                min="500"
                                                step="500"
                                                type="range"
                                                value={priceRange}
                                                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl text-sm transition-all shadow-xl shadow-primary/20 uppercase tracking-[.2em] hover:scale-[1.02] active:scale-95"
                                    >
                                        Filtrar Resultados
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Grid Section */}
                <section className="flex-1 flex flex-col">
                    {/* Sorting and Results Count Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <p className="hidden md:block text-lg text-gray-500 dark:text-gray-400 font-medium">
                            Encontramos <span className="font-black text-[#0d171c] dark:text-white underline decoration-primary/30 decoration-4">{sortedPackages.length}</span> destinos únicos para você
                        </p>
                        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark px-6 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm self-end sm:self-auto">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">Ordenar:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-black text-[#0d171c] dark:text-white rounded-lg py-1 pl-1 pr-6 cursor-pointer outline-none focus:ring-0"
                            >
                                <option>Recomendados</option>
                                <option>Menor Preço</option>
                                <option>Maior Preço</option>
                            </select>
                        </div>
                    </div>

                    {/* Chips (Quick Filters) */}
                    <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                        {['Todos', 'Em Oferta', 'Nacionais', 'Internacionais', 'Europa', 'América do Sul'].map((label, i) => (
                            <button
                                key={i}
                                className={`flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all shadow-sm ${i === 0
                                    ? 'bg-primary text-white shadow-primary/20'
                                    : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-400 hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {label}
                                {label === 'Em Oferta' && <span className="flex h-2 w-2 rounded-full bg-accent-orange animate-pulse"></span>}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-surface-dark rounded-[40px] h-[450px] shadow-sm"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                            {sortedPackages.map((pkg) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={pkg.id}
                                    className="group flex flex-col bg-white dark:bg-surface-dark rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 dark:border-gray-800"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute top-5 left-5 z-20 flex gap-2">
                                            {pkg.featured && (
                                                <div className="bg-accent-orange text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl backdrop-blur-md">Destaque</div>
                                            )}
                                        </div>
                                        <button className="absolute top-5 right-5 z-20 p-2.5 bg-white/90 dark:bg-black/50 rounded-full hover:bg-primary text-gray-400 hover:text-white transition-all shadow-xl group/fav">
                                            <Heart className="w-5 h-5 group-hover/fav:fill-current" />
                                        </button>
                                        {pkg.images?.[0] ? (
                                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={pkg.title} src={pkg.images[0]} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-200">
                                                <Plane className="w-14 h-14" />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 text-white z-10">
                                            <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-xs font-black">4.9 Excepcional</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1 p-8">
                                        <h3 className="text-2xl font-black text-[#0d171c] dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{pkg.title}</h3>

                                        <div className="flex items-center gap-2 text-primary font-bold mb-6 text-xs uppercase tracking-widest">
                                            <MapPin className="w-4 h-4" />
                                            {pkg.destination || 'Pacote Exclusivo'}
                                        </div>

                                        <p className="text-base text-gray-500 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed h-[3rem] overflow-hidden">{pkg.description}</p>

                                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">A partir de</span>
                                                <span className="text-3xl font-black text-primary tracking-tighter">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                                            </div>
                                            <Link
                                                href={`/pacote/${pkg.id}`}
                                                className="bg-gray-50 dark:bg-gray-800 hover:bg-primary text-[#0d171c] dark:text-white hover:text-white size-14 rounded-2xl flex items-center justify-center transition-all shadow-sm hover:shadow-primary/30"
                                            >
                                                <ArrowUpRight className="w-7 h-7" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && sortedPackages.length === 0 && (
                        <div className="py-32 text-center bg-white dark:bg-surface-dark rounded-[50px] shadow-sm border border-dashed border-gray-200 dark:border-gray-800">
                            <Plane className="w-20 h-20 text-gray-200 mx-auto mb-8" />
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Nenhum destino encontrado</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto mb-10">Tente ajustar seus filtros ou buscar por outro termo para encontrar a viagem perfeita.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setPriceRange(10000); }}
                                className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && sortedPackages.length > 0 && (
                        <div className="mt-24 flex justify-center">
                            <nav className="flex items-center gap-3">
                                <button className="flex items-center justify-center size-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button className="flex items-center justify-center size-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 scale-110">1</button>
                                <button className="flex items-center justify-center size-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 font-bold hover:border-primary hover:text-primary transition-all shadow-sm">2</button>
                                <button className="flex items-center justify-center size-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 font-bold hover:border-primary hover:text-primary transition-all shadow-sm">3</button>
                                <span className="text-gray-400 px-2 font-black">...</span>
                                <button className="flex items-center justify-center size-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </nav>
                        </div>
                    )}
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}

export default function DestinosPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
            <DestinosPageContent />
        </Suspense>
    )
}
