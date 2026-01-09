'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import StatsCards from '@/components/StatsCards'
import PerformanceCharts from '@/components/PerformanceCharts'
import CreateLeadModal from '@/components/CreateLeadModal'
import { Plus, Search, Bell, Filter, MoreHorizontal, Kanban as KanbanIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
    const [leads, setLeads] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

    const fetchLeads = async () => {
        const { data } = await supabase.from('leads').select('*')
        if (data) setLeads(data)
    }

    useEffect(() => {
        fetchLeads()
        const subscription = supabase.channel('dashboard_leads_page').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads).subscribe()
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user))
        return () => { subscription.unsubscribe() }
    }, [])

    return (
        <>
            {/* Header */}
            <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-surface-light/50 dark:bg-background-dark backdrop-blur-sm z-10 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Controle</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bem-vindo à central de operações da Agência.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 transition-shadow text-gray-900 dark:text-white"
                            placeholder="Buscar..."
                            type="text"
                        />
                    </div>

                    <button className="relative p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-300">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-surface-dark"></span>
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-all shadow-lg shadow-primary/30"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Novo Lead</span>
                    </button>
                </div>
            </header>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-8 pt-6">

                {/* Stats Cards */}
                <StatsCards leads={leads} />

                {/* Pipeline Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <KanbanIcon className="w-6 h-6 text-primary" />
                                Pipeline de Vendas
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition">
                                    <Filter className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Kanban Board */}
                        <KanbanBoard />
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Funil de Vendas</h3>
                            <select className="bg-gray-50 dark:bg-gray-800 border-none text-xs rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 outline-none">
                                <option>Este Mês</option>
                                <option>Últimos 3 meses</option>
                            </select>
                        </div>
                        <div className="h-64 w-full relative">
                            <PerformanceCharts leads={leads} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                            <div className="text-white text-3xl">🏆</div>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Meta Mensal</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">Você atingiu 75% da sua meta de vendas este mês. Continue assim!</p>
                        <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                            <div className="bg-primary h-3 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-xs font-semibold text-primary dark:text-primary-hover">R$ 45.000 / R$ 60.000</span>
                    </div>
                </div>

            </div>

            <CreateLeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchLeads}
            />
        </>
    )
}
