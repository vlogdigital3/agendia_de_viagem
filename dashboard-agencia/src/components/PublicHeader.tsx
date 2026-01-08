'use client'

import Link from 'next/link'
import { Plane, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PublicHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navLinks = [
        { href: '/', label: 'Início' },
        { href: '/destinos', label: 'Destinos' },
        { href: '/sobre', label: 'Sobre Nós' },
        { href: '/contato', label: 'Contato' },
    ]

    return (
        <header className="sticky top-0 z-[100] w-full border-b border-[#e7eff4] dark:border-gray-800 bg-white/95 dark:bg-[#101c22]/95 backdrop-blur-md">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 h-[72px] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <img
                        src="/logo.png"
                        alt="Maryfran Turismo"
                        className="h-[50px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>

                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="hidden sm:flex h-11 px-6 items-center justify-center rounded-2xl bg-accent-orange text-white text-sm font-black hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-600/20 active:scale-95"
                    >
                        Área do Cliente
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-[#0d171c] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-[#e7eff4] dark:border-gray-800 bg-white dark:bg-[#101c22] overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="mt-4 flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20"
                            >
                                <User className="w-5 h-5 mr-2" />
                                Área do Cliente
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
