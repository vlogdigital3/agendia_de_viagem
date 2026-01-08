'use client'

import { Plane, Mail, Phone, MapPin, Globe, Camera, AtSign, CreditCard, Landmark, Banknote } from 'lucide-react'
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
                            <a href="#" className="size-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:-translate-y-1"><Globe className="w-5 h-5" /></a>
                            <a href="#" className="size-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:-translate-y-1"><Camera className="w-5 h-5" /></a>
                            <a href="#" className="size-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:-translate-y-1"><AtSign className="w-5 h-5" /></a>
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
