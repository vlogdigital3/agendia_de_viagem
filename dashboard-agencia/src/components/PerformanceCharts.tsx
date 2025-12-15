'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = {
    leads: any[]
}

const COLORS = {
    'new': '#60A5FA', // blue-400
    'qualified': '#A78BFA', // purple-400
    'negotiation': '#FACC15', // yellow-400
    'payment_pending': '#FB923C', // orange-400
    'won': '#4ADE80', // green-400
    'lost': '#F87171', // red-400
}

const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo',
    'qualified': 'Qualif.',
    'negotiation': 'Negoc.',
    'payment_pending': 'Pgto',
    'won': 'Venda',
    'lost': 'Perdido'
}

export default function PerformanceCharts({ leads }: Props) {
    // Process data for the chart
    const data = Object.keys(COLORS).map(status => ({
        name: STATUS_LABELS[status],
        count: leads.filter(l => l.status === status).length,
        color: COLORS[status as keyof typeof COLORS]
    }))

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl h-[350px]">
            <h3 className="text-lg font-bold text-white mb-6">Funil de Vendas</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F3F4F6'
                        }}
                        cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
