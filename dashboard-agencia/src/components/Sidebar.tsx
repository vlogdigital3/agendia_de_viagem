'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Rocket, LayoutDashboard, Users, PieChart, Settings, Moon, Sun, LogOut, Package, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
    { label: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads & CRM', href: '/dashboard/leads', icon: Users },
    { label: 'Pacotes', href: '/dashboard/packages', icon: Package },
    { label: 'WhatsApp AI', href: '/dashboard/whatsapp', icon: MessageSquare },
    { label: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
    { label: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [isDark, setIsDark] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check local storage or system preference on mount
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true)
            document.documentElement.classList.add('dark')
        } else {
            setIsDark(false)
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDark(false)
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDark(true)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            <div>
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Maryfran Turismo"
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1",
                                        isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary dark:text-white"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-2 mb-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all text-sm group"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </aside>
    )
}
