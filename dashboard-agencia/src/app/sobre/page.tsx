'use client'

import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import {
    Flag, Plane, Store, Trophy, Rocket, Eye, Diamond,
    ArrowRight, MessageCircle, Instagram, Globe, Mail,
    Phone, MapPin, CheckCircle2, Users, Target, ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SobrePage() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display antialiased text-[#0d171c] dark:text-gray-100">
            <PublicHeader />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full overflow-hidden min-h-[500px] md:min-h-[700px] flex items-center justify-center">
                    <div className="absolute inset-0 z-0 scale-105">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background-light dark:to-background-dark z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center transition-all duration-1000 transform scale-110 motion-safe:animate-slow-zoom"
                            style={{
                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCDm62e12WNoBoEIycRyMQq2ZlKyR0WSk3jYX3GfUQj2X6g2t3xbK7iRHi3raJTqqSH5uopcGI5rC3bzvj4cii_dE-A9LTEgYtTxayZIp0DvqjJ6xMGCV586PHH3ruNpxCE8nqD4bS7qmHRA4Jv6mSSAlNoeUP6boANCS514BkX7dHqLyYDkXzGuqK6pUj4uTMuby42vmL4wBso5o8WOpdTX6mYR5B-hcjMkqx_JMLFCbfKFK7jWIh9pPI4Q1OMERKJ81T0lYWWe2hU")'
                            }}
                        ></div>
                    </div>

                    <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-screen-xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <span className="bg-accent-orange/90 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[.3em] mb-8 shadow-2xl backdrop-blur-md">Desde 2001</span>
                            <h1 className="text-white text-5xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-8 drop-shadow-2xl">
                                Transformando viagens em <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-500 animate-gradient-x">memórias eternas</span>
                            </h1>
                            <p className="text-gray-100 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mb-12 drop-shadow-lg">
                                Conheça a história da Maryfran Turismo e nossa paixão por realizar sonhos de famílias brasileiras com segurança, conforto e alegria.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link href="/destinos" className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black transition-all shadow-2xl hover:shadow-primary/30 flex items-center justify-center gap-3 group hover:scale-[1.03] active:scale-95">
                                    <span>Ver Nossos Pacotes</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Our Story Text */}
                <section className="py-24 px-4 sm:px-10 max-w-screen-xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="flex-1 space-y-10">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Nossa Trajetória
                            </div>
                            <h2 className="text-[#0d171c] dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-tight">Vinte anos de confiança e bons momentos</h2>
                            <div className="space-y-8 text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed">
                                <p>
                                    A <strong className="text-primary">Maryfran Turismo</strong> nasceu de um sonho simples: mostrar que o mundo está ao alcance de todos. Fundada em 2001, começamos organizando pequenas excursões regionais que logo se transformaram em grandes aventuras nacionais e internacionais.
                                </p>
                                <p>
                                    Hoje, somos referência no mercado, conectando nossos clientes aos destinos mais fascinantes do planeta com um atendimento que faz você se sentir em casa antes mesmo de embarcar. Nosso compromisso é com a sua <span className="underline decoration-accent-orange decoration-4 underline-offset-4">felicidade e segurança</span>.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-8">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all"
                                >
                                    <span className="text-5xl font-black text-accent-orange block mb-2 tracking-tighter">20+</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-[.2em]">Anos de Estrada</span>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all"
                                >
                                    <span className="text-5xl font-black text-primary block mb-2 tracking-tighter">15k+</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-[.2em]">Sonhos Realizados</span>
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="relative">
                                <div className="absolute -top-16 -left-16 w-64 h-64 bg-accent-orange/10 rounded-full blur-[100px] animate-pulse"></div>
                                <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
                                <img
                                    alt="Equipe Maryfran"
                                    className="rounded-[60px] shadow-2xl w-full object-cover aspect-[4/5] lg:aspect-auto relative z-10 border-8 border-white dark:border-gray-800 hover:scale-[1.02] transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGx5rEgHz-WyjiYGpD4nRk9VpQnJjk8MCsrK9qdbTubbqo4hx5KC3aShuX-KZRWFFXcB3eKGyjfO2c1AXBP6r_0M3AavjreReD4tOOyubhlUWj9xk23uHISFarvv0VxyRs8EZyfQR94RNtmVpFRf1vtg-bORH58NXG5UbM1C3tT14YkLoc6E3i1p-RdSL7OhKZCAe7cgLpMjInQJu3Tq5FHTOgMlm1yhZnh_OkEiCqUQd76Kg2IwBpkldtKn8m5wiVLfohSVJFLnXP"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="bg-gray-100/50 dark:bg-[#0d171c] py-32 border-y border-slate-100 dark:border-gray-800 overflow-hidden">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-10">
                        <div className="text-center mb-24">
                            <span className="text-accent-orange font-black tracking-[.4em] uppercase text-xs">A nossa jornada</span>
                            <h2 className="text-[#0d171c] dark:text-white text-5xl md:text-7xl font-black mt-4 tracking-tighter">Momentos Históricos</h2>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-x-10">
                            {[
                                { year: '2001', title: 'Fundação da Agência', icon: Flag, desc: 'Início das atividades em Ribeirão Preto, com foco em excursões regionais e turismo rodoviário de qualidade.', color: 'text-orange-500 bg-orange-100 dark:bg-orange-950/30' },
                                { year: '2010', title: 'Expansão Internacional', icon: Plane, desc: 'Inauguramos nossos primeiros grupos internacionais para destinos como Orlando e as principais capitais europeias.', color: 'text-primary bg-primary/10' },
                                { year: '2018', title: 'Loja Conceito e Digital', icon: Store, desc: 'Inauguração da nova sede moderna e lançamento da nossa primeira plataforma de atendimento digital 24h.', color: 'text-accent-orange bg-orange-100 dark:bg-orange-950/30' },
                                { year: '2024', title: 'Inovação e Reconhecimento', icon: Trophy, desc: 'Consolidação como agência boutique, premiada pela excelência na curadoria de roteiros exclusivos e personalizados.', color: 'text-primary bg-primary/10', last: true }
                            ].map((item, idx) => (
                                <div key={idx} className="contents group">
                                    <div className="flex flex-col items-center">
                                        <div className={`size-16 md:size-20 rounded-[28px] ${item.color} ${item.color.split(' ')[0]} flex items-center justify-center shadow-2xl z-10 group-hover:scale-110 transition-transform duration-500`}>
                                            <item.icon className="w-8 h-8 md:w-10 md:h-10" />
                                        </div>
                                        {!item.last && <div className="w-1 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-800 dark:to-transparent h-full min-h-[120px]"></div>}
                                    </div>
                                    <div className="pb-24 pt-4 md:pt-6">
                                        <span className="text-sm font-black text-primary bg-primary/10 px-6 py-2 rounded-full tracking-widest">{item.year}</span>
                                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-8 tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 mt-6 text-lg md:text-xl leading-relaxed max-w-2xl">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission, Vision, Values */}
                <section className="py-32 px-4 sm:px-10 bg-white dark:bg-background-dark">
                    <div className="max-w-screen-2xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-[#0d171c] dark:text-white text-5xl md:text-7xl font-black tracking-tighter">Nossa Essência</h2>
                            <div className="w-24 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-12">
                            {[
                                { icon: Rocket, title: 'Missão', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20', desc: 'Proporcionar experiências de viagem seguras e inesquecíveis, conectando pessoas a culturas e criando laços duradouros através do turismo consciente.' },
                                { icon: Eye, title: 'Visão', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20', desc: 'Ser a agência de turismo mais confiável e recomendada do Brasil, reconhecida pela inovação constante e excelência no atendimento personalizado.' },
                                { icon: Diamond, title: 'Valores', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20', desc: 'Transparência em cada etapa, paixão por servir com alegria, segurança inegociável em todos os roteiros e profundo respeito à diversidade cultural.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-surface-dark p-12 rounded-[50px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group">
                                    <div className={`size-24 rounded-[32px] ${item.color} flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative`}>
                                        <item.icon className="w-12 h-12" />
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-[32px] transition-opacity"></div>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg md:text-xl">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 sm:px-10 bg-[#101c22] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_80%)]"></div>
                    <div className="max-w-[800px] mx-auto text-center relative z-10">
                        <h2 className="text-white text-4xl sm:text-5xl font-black mb-6">Pronto para escrever sua história?</h2>
                        <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                            Deixe a Maryfran Turismo cuidar de todos os detalhes enquanto você foca no que realmente importa: viver o momento.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="h-16 px-10 rounded-2xl bg-accent-orange hover:bg-orange-600 text-white font-black transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 group">
                                <MessageCircle className="w-6 h-6" />
                                Fale Conosco agora
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <Link href="/destinos" className="h-16 px-10 rounded-2xl bg-white/5 border border-gray-700 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center backdrop-blur-sm">
                                Explorar Destinos
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
