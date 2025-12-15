'use client'

import { UserPlus, DollarSign, TrendingUp, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'

type StatCardProps = {
    title: string
    value: string | number
    trend?: string
    isPositive?: boolean
    icon: any
    colorClass: string // e.g., 'text-accent-blue bg-blue-50 dark:bg-blue-900/20'
    iconBgIcon: any // Icon to show in background
}

const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorClass, iconBgIcon: BgIcon }: StatCardProps) => (
    <div className="relative bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${isPositive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    <TrendingUp className="w-3 h-3" /> {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <BgIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 dark:text-surface-darker pointer-events-none opacity-50 dark:opacity-30 group-hover:scale-110 transition-transform" />
    </div>
)

export default function StatsCards({ leads }: { leads: any[] }) {
    const totalLeads = leads.length
    const totalSales = leads.filter(l => l.status === 'won').length
    const conversionRate = totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) + '%' : '0%'
    const pendingPayment = leads.filter(l => l.status === 'payment_pending').length

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total de Leads"
                value={totalLeads}
                trend="+12%"
                isPositive={true}
                icon={UserPlus}
                colorClass="text-accent-blue bg-blue-50 dark:bg-blue-900/20"
                iconBgIcon={User}
            />
            <StatCard
                title="Vendas Realizadas"
                value={totalSales}
                trend="+5%"
                isPositive={true}
                icon={DollarSign}
                colorClass="text-accent-green bg-green-50 dark:bg-green-900/20"
                iconBgIcon={DollarSign}
            />
            <StatCard
                title="Taxa de Conversão"
                value={conversionRate}
                icon={TrendingUp}
                colorClass="text-accent-purple bg-purple-50 dark:bg-purple-900/20"
                iconBgIcon={TrendingUp}
            />
            <StatCard
                title="Aguardando Pagto"
                value={pendingPayment}
                trend="Atenção"
                isPositive={false}
                icon={Clock}
                colorClass="text-accent-orange bg-orange-50 dark:bg-orange-900/20"
                iconBgIcon={Clock}
            />
        </div>
    )
}
