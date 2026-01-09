'use client'



import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Globe, Map } from 'lucide-react'

export default function ContatoPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display antialiased text-[#0d171c] dark:text-gray-100">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative w-full py-16 md:py-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBMAayInLBpTZIzy8sXzEQIz0-_pJ6wMzbsDRyu45N0JyTL-0_6Xju3ebYet0VEf8GbYFo3rAU-WSNrMayV2L707bZQG-hDXI8kXo3iM5piXBzGw8A1rt_WcszXIIlYIdKMIDussmJ1L1RpmuUszW1PV1_E4c1KXBoXwJDOuTNDpCscI9S2-hr78zmmOnE0beyvaSQudRark2pJ1J20MTrof_8Oe8T4VsGhJEz4Lho_41S8BJkuQKmKvx8ueCSgiqemBjHZ2n7cYAzl")' }}>
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Fale Conosco
                    </h1>
                    <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Estamos prontos para planejar a viagem dos seus sonhos. Entre em contato conosco para dúvidas, cotações ou suporte.
                    </p>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-[1100px] mx-auto items-start">

                    {/* Contact Form Section */}
                    <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Envie uma mensagem</h2>
                            <p className="text-slate-500 dark:text-gray-400 font-medium">Preencha o formulário abaixo e entraremos em contato em breve.</p>
                        </div>
                        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1" htmlFor="name">Nome Completo</label>
                                    <input className="h-14 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 px-5 transition-all outline-none dark:text-white font-medium" id="name" placeholder="Seu nome" type="text" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1" htmlFor="phone">Telefone / WhatsApp</label>
                                    <input className="h-14 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 px-5 transition-all outline-none dark:text-white font-medium" id="phone" placeholder="(00) 00000-0000" type="tel" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1" htmlFor="email">E-mail</label>
                                <input className="h-14 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 px-5 transition-all outline-none dark:text-white font-medium" id="email" placeholder="seu@email.com" type="email" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1" htmlFor="subject">Assunto</label>
                                <select className="h-14 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 px-5 transition-all outline-none text-slate-700 dark:text-gray-300 font-bold appearance-none cursor-pointer" id="subject">
                                    <option value="">Selecione um assunto</option>
                                    <option value="pacotes">Pacotes de Viagem</option>
                                    <option value="cotacao">Cotação Personalizada</option>
                                    <option value="duvidas">Dúvidas Gerais</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1" htmlFor="message">Mensagem</label>
                                <textarea className="rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 p-5 transition-all outline-none dark:text-white font-medium resize-none" id="message" placeholder="Como podemos ajudar você hoje?" rows={5}></textarea>
                            </div>
                            <button className="mt-4 h-16 w-full bg-accent-orange hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-accent-orange/20 flex items-center justify-center gap-3 group" type="submit">
                                <span>Enviar Mensagem</span>
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Contact Info & Map Section */}
                    <div className="flex flex-col gap-10">
                        {/* Info Cards */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                Canais Diretos
                                <span className="w-10 h-1 bg-primary rounded-full"></span>
                            </h2>

                            {/* Card 1 */}
                            <div className="flex items-start gap-6 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-accent-orange group-hover:scale-110 transition-transform">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Nosso Escritório</h3>
                                    <p className="text-base text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">Av. Paulista, 1000 - Bela Vista<br />São Paulo - SP, 01310-100</p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="flex items-start gap-6 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-primary group-hover:scale-110 transition-transform">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Telefones</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 mb-3">Segunda a Sexta, 9h às 18h</p>
                                    <div className="space-y-2">
                                        <a className="text-primary hover:text-primary-hover font-black text-xl block transition-colors" href="tel:+551133334444">(11) 3333-4444</a>
                                        <a className="text-green-500 hover:text-green-600 font-black text-xl flex items-center gap-2 transition-colors" href="https://wa.me/5511999998888">
                                            <MessageCircle className="w-5 h-5" />
                                            (11) 99999-8888
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="flex items-start gap-6 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-accent-orange group-hover:scale-110 transition-transform">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">E-mail</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 mb-2">Orçamentos e suporte</p>
                                    <a className="text-primary hover:text-primary-hover font-black text-lg transition-colors border-b-2 border-primary/20 pb-1" href="mailto:contato@maryfranturismo.com.br">contato@maryfranturismo.com.br</a>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 h-72 shadow-2xl relative group mt-4">
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCelcjEGiCB3GJd-Tnq_HyPyOrjfjXk02IoiUvIBHWxY-VxkQaqq0WLTO4vj2WodPyvIfjuaarzavDJxDDFW0xaVE_7vOcFjnOvNwCEsOqpy6AQipibbc6Ax2Uk5ee4pOX7zzKQMwTaEALQ3caNd_fYvnc7MVrd_0b86G737F-eIog0vpB6AC-2HSrIANzzRJ0UhqpzE2GpkuJ2E7CgELWg5ipoJYUDGbKnskVgWWDCzftqw7YRcNx4_EmbYxqv_j0GG8_4qJfnmFSb")' }}>
                            </div>
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <button className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                                    <Map className="w-5 h-5 text-primary" />
                                    Abrir no Google Maps
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* WhatsApp Floating Button */}
            <a
                className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-5 rounded-full shadow-2xl shadow-green-600/30 transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 group"
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
            >
                <MessageCircle className="w-8 h-8" />
                <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-xs font-black px-4 py-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 origin-right whitespace-nowrap pointer-events-none border border-gray-100 dark:border-gray-700">
                    Dúvidas? Fale Conosco agora!
                </span>
            </a>

            <PublicFooter />
        </div>
    )
}
