'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { Search, MapPin, Calendar, Headset, Tag, ShieldCheck, ArrowRight, ArrowUpRight, Plane, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
    const [featuredPackages, setFeaturedPackages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeatured = async () => {
            // First attempt to fetch explicitly featured packages
            const { data: featuredData } = await supabase
                .from('packages')
                .select('*')
                .eq('featured', true)
                .eq('active', true)
                .order('created_at', { ascending: false })

            if (featuredData && featuredData.length > 0) {
                setFeaturedPackages(featuredData)
            } else {
                // If none are featured, show the 3 most recent active packages as fallback
                const { data: recentData } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('active', true)
                    .order('created_at', { ascending: false })
                    .limit(3)

                if (recentData) setFeaturedPackages(recentData)
            }
            setLoading(false)
        }
        fetchFeatured()
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <PublicHeader />

            <main className="flex-1">
                {/* HeroSection */}
                <section className="relative flex min-h-[700px] flex-col justify-center items-center p-6 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 z-0 scale-105">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background-light dark:to-background-dark z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center transition-all duration-1000 transform scale-110 motion-safe:animate-slow-zoom"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")' }}
                        ></div>
                    </div>

                    <div className="relative z-20 flex flex-col items-center text-center max-w-screen-xl mx-auto gap-8 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <span className="bg-primary/20 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl">
                                Explore o extraordinário
                            </span>
                            <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter drop-shadow-2xl">
                                Sua próxima aventura<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">começa agora</span>
                            </h1>
                            <p className="text-white/90 text-lg md:text-2xl font-medium max-w-3xl drop-shadow-md leading-relaxed">
                                Explore o Brasil e o mundo com as melhores ofertas e o atendimento personalizado que você merece.
                            </p>
                        </motion.div>

                        {/* Search Widget */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full max-w-4xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3 border border-white/20"
                        >
                            <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary transition-all">
                                <MapPin className="text-primary w-5 h-5 mr-3" />
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-text-main dark:text-white placeholder:text-gray-400 text-sm md:text-base font-semibold outline-none"
                                    placeholder="Para onde você quer ir?"
                                />
                            </div>
                            <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary transition-all">
                                <Calendar className="text-primary w-5 h-5 mr-3" />
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-text-main dark:text-white placeholder:text-gray-400 text-sm md:text-base font-semibold outline-none"
                                    placeholder="Quando?"
                                    type="text"
                                    onFocus={(e) => (e.target.type = 'date')}
                                />
                            </div>
                            <button className="h-14 md:h-auto md:px-10 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 group">
                                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Pesquisar
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24 bg-background-light dark:bg-background-dark">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { icon: Headset, title: 'Atendimento 24h', desc: 'Suporte completo durante toda a sua viagem, a qualquer hora.', color: 'bg-primary' },
                                { icon: Tag, title: 'Melhores Preços', desc: 'Garantia de tarifas exclusivas e condições especiais de pagamento.', color: 'bg-orange-500' },
                                { icon: ShieldCheck, title: 'Compra Segura', desc: 'Transações protegidas e agência certificada para sua tranquilidade.', color: 'bg-green-600' }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-10 bg-white dark:bg-surface-dark rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                                    <div className={`size-20 rounded-[28px] ${feature.color}/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500 relative`}>
                                        <feature.icon className={`w-10 h-10 ${feature.color.replace('bg-', 'text-')}`} />
                                        <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-10 rounded-[28px] transition-opacity`}></div>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 dark:text-white">{feature.title}</h3>
                                    <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Packages (Ofertas Especiais) */}
                <section className="py-24 bg-white dark:bg-[#0d171c]">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-6">
                            <div className="text-center md:text-left">
                                <span className="text-primary font-black tracking-widest uppercase text-xs mb-3 block">Exploração Ilimitada</span>
                                <h2 className="text-4xl md:text-6xl font-black text-text-main dark:text-white mb-4">Escolhas da Semana</h2>
                                <p className="text-text-secondary dark:text-gray-400 text-lg md:text-xl max-w-2xl">Pacotes com descontos imperdíveis e experiências selecionadas a dedo.</p>
                            </div>
                            <Link href="/destinos" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-[#0d171c] dark:text-white font-bold hover:bg-primary hover:text-white transition-all shadow-sm group">
                                Ver todos os destinos
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-[40px] h-[500px]"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {featuredPackages.map((pkg) => (
                                    <div key={pkg.id} className="group bg-background-light dark:bg-surface-dark rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-500">
                                        <div className="h-72 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            {pkg.images?.[0] ? (
                                                <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Plane className="w-16 h-16" />
                                                </div>
                                            )}
                                            <div className="absolute top-6 left-6 bg-accent-orange text-white text-[10px] font-black px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md">
                                                <Star className="w-3 h-3 fill-current" />
                                                DESTAQUE
                                            </div>
                                        </div>
                                        <div className="p-10 flex flex-col flex-1">
                                            <h3 className="text-2xl font-black text-text-main dark:text-white mb-3 group-hover:text-primary transition-colors">{pkg.title}</h3>
                                            <p className="text-base text-text-secondary dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed">
                                                {pkg.description}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <span className="block text-[10px] text-text-secondary dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Investimento inicial</span>
                                                    <span className="block text-3xl font-black text-primary">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                                                </div>
                                                <Link
                                                    href={`/pacote/${pkg.id}`}
                                                    className="size-14 rounded-2xl bg-white dark:bg-gray-800 text-text-main dark:text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-primary/20"
                                                >
                                                    <ArrowUpRight className="w-7 h-7" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {featuredPackages.length === 0 && (
                                    <div className="col-span-full py-32 text-center bg-gray-50 dark:bg-gray-900/50 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
                                        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Novos destinos em breve</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Estamos preparando ofertas exclusivas para você. Fique ligado!</p>
                                        <Link href="/destinos" className="inline-block mt-8 text-primary font-black hover:underline uppercase tracking-widest text-sm">Explorar catálogo completo</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-24 bg-gray-50 dark:bg-[#0d171c]">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
                        <div className="bg-primary rounded-[50px] p-10 md:p-24 text-center md:text-left flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-orange/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                            <div className="relative z-10 max-w-2xl">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm">Comunidade VIP</span>
                                <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">Explore o mundo com a Maryfran</h2>
                                <p className="text-white/80 text-lg md:text-2xl max-w-xl">Receba promoções exclusivas e roteiros secretos diretamente no seu e-mail.</p>
                            </div>

                            <div className="relative z-10 w-full lg:max-w-md">
                                <div className="flex flex-col gap-4">
                                    <input
                                        className="w-full rounded-2xl border-0 px-8 py-5 text-text-main focus:ring-4 focus:ring-white/20 bg-white/95 text-lg font-medium shadow-2xl shadow-primary/20"
                                        placeholder="Seu melhor e-mail"
                                        type="email"
                                    />
                                    <button className="w-full bg-[#101c22] text-white font-black px-10 py-5 rounded-2xl hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-widest">
                                        Quero ofertas exclusivas
                                    </button>
                                </div>
                                <p className="text-white/40 text-xs mt-6 text-center lg:text-left">Sem spam. Apenas inspiração de viagem. Cancele quando quiser.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
