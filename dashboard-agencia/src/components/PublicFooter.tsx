'use client'

import { Plane, Mail, Phone, MapPin, Globe, Instagram, AtSign, CreditCard, Landmark, Banknote } from 'lucide-react'
import Link from 'next/link'

export default function PublicFooter() {
    return (
        <footer className="bg-white dark:bg-[#0d171c] border-t border-[#e7eff4] dark:border-gray-800 mt-auto">
            <div className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-[#0d171c] dark:text-white group">
                            <img
                                src="/logo.png"
                                alt="Maryfran Turismo"
                                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </div>
                        <p className="text-base text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                            Transformando sonhos em destinos. Sua agência de confiança para as melhores experiências de viagem pelo Brasil e pelo mundo.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="https://www.instagram.com/maryfranturismo/" target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:-translate-y-1">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.tiktok.com/@maryfran.turismo" target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:-translate-y-1">
                                <TikTokIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="font-black text-[#0d171c] dark:text-white mb-6 uppercase tracking-widest text-xs">Empresa</h4>
                        <ul className="flex flex-col gap-4 text-slate-500 dark:text-gray-400 font-bold">
                            <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Trabalhe Conosco</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog de Viagens</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Imprensa</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="font-black text-[#0d171c] dark:text-white mb-6 uppercase tracking-widest text-xs">Suporte</h4>
                        <ul className="flex flex-col gap-4 text-slate-500 dark:text-gray-400 font-bold">
                            <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Política de Cancelamento</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><Link href="/contato" className="hover:text-primary transition-colors">Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-slate-50 dark:bg-surface-dark p-8 rounded-[32px] border border-slate-100 dark:border-gray-800">
                        <h4 className="font-black text-[#0d171c] dark:text-white mb-3">Receba Ofertas</h4>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 font-medium">Cadastre-se para receber promoções exclusivas e guias de viagem.</p>
                        <div className="flex flex-col gap-3">
                            <input
                                className="w-full h-12 bg-white dark:bg-gray-800 border-none rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary/5 text-[#0d171c] dark:text-white font-medium outline-none"
                                placeholder="Seu melhor e-mail"
                                type="email"
                            />
                            <button className="w-full h-12 bg-accent-orange hover:bg-orange-600 text-white font-black rounded-xl text-xs transition-all uppercase tracking-widest shadow-lg shadow-accent-orange/10 active:scale-95">
                                Inscrever-se Agora
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-gray-800 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-slate-400 text-center md:text-left">© {new Date().getFullYear()} Maryfran Turismo. Cadastur: 12.345.678/0001-90</p>
                    <div className="flex items-center gap-6 text-slate-300 dark:text-gray-700">
                        <CreditCard className="w-7 h-7" />
                        <Landmark className="w-7 h-7" />
                        <Banknote className="w-7 h-7" />
                        <div className="h-6 w-px bg-slate-100 dark:bg-gray-800 ml-2"></div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Pagamento 100% Seguro</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function TikTokIcon(props: any) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.14-1.41-.33-.21-.65-.44-.95-.69-.02 2.34.01 4.68-.02 7.02-.13 5.41-5.78 8.87-10.5 6.09-4.82-2.84-5.36-9.83-1.04-13.38 1.63-1.34 3.79-1.92 5.86-1.57v4.11c-2.07-.63-4.32.74-4.64 2.87-.41 2.68 2.37 4.96 4.7 3.86 1.14-.54 1.83-1.72 1.83-2.98.01-4.79-.01-9.59 0-14.39z" />
        </svg>
    )
}
