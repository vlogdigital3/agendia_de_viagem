'use client'



import { useState, useEffect, useMemo } from 'react'
import { PieChart, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import TrendChart from '@/components/analytics/TrendChart'
import DestinationsChart from '@/components/analytics/DestinationsChart'
import PerformanceCharts from '@/components/PerformanceCharts'
import StatsCards from '@/components/StatsCards'

export default function AnalyticsPage() {
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: true })
            if (data) setLeads(data)
            setLoading(false)
        }
        fetchLeads()
    }, [])

    // Aggregate Data for Trends (Group by Date)
    const trendData = useMemo(() => {
        const grouped: Record<string, number> = {}
        leads.forEach(lead => {
            const date = new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            grouped[date] = (grouped[date] || 0) + 1
        })
        return Object.entries(grouped).map(([date, count]) => ({ date, count }))
    }, [leads])

    // Aggregate Data for Destinations (Count occurrences)
    const destinationsData = useMemo(() => {
        const grouped: Record<string, number> = {}
        leads.forEach(lead => {
            const dest = lead.destination_interest ? lead.destination_interest.trim() : 'Outros'
            // Simple normalization
            const normalizedDest = dest.charAt(0).toUpperCase() + dest.slice(1).toLowerCase()
            grouped[normalizedDest] = (grouped[normalizedDest] || 0) + 1
        })

        return Object.entries(grouped)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5) // Top 5
    }, [leads])

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-primary" />
                        Analytics Avançado
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Inteligência de dados sobre suas vendas e performance.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition-all">
                    <Download className="w-4 h-4" />
                    <span>Exportar Relatório</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* KPI Cards Reuse */}
                    <div className="mb-8">
                        <StatsCards leads={leads} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Trend Chart (Full Width on Mobile, Half on Desktop) */}
                        <div className="lg:col-span-2">
                            <TrendChart data={trendData} />
                        </div>

                        {/* Destinations Chart */}
                        <DestinationsChart data={destinationsData} />

                        {/* Status/Funnel Chart Reuse */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-[350px]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Distribuição por Status</h3>
                            </div>
                            <div className="h-[280px] w-full relative">
                                <PerformanceCharts leads={leads} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
