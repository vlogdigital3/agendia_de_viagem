'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, MoreHorizontal, Edit, Trash2, Phone, Mail, MapPin, Calendar, ArrowUpDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import LeadModal from './LeadModal'
import { supabase } from '@/lib/supabase'

type Lead = {
    id: string
    name: string
    phone: string
    email: string
    destination_interest: string
    status: string
    ai_summary?: string | null
    created_at: string
}

const STATUS_STYLES: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'qualified': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'negotiation': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'payment_pending': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'won': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo',
    'qualified': 'Qualificado',
    'negotiation': 'Negociação',
    'payment_pending': 'Pagamento',
    'won': 'Vendido',
    'lost': 'Perdido',
}

export default function LeadsTable({ leads, onUpdate, onDelete }: { leads: Lead[], onUpdate: () => void, onDelete: (id: string) => void }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch =
                lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.destination_interest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone?.includes(searchTerm)

            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [leads, searchTerm, statusFilter])

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            await onDelete(id) // Call parent handler which calls Supabase
        }
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, destino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer text-gray-700 dark:text-gray-300 min-w-[160px]"
                        >
                            <option value="all">Todos os Status</option>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 rounded-tl-lg">Lead</th>
                            <th className="px-6 py-4">Contato</th>
                            <th className="px-6 py-4">Destino</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4 text-right rounded-tr-lg">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <AnimatePresence>
                            {filteredLeads.map((lead) => (
                                <motion.tr
                                    key={lead.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedLead(lead)}
                                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {lead.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{lead.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{lead.id.slice(0, 6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                <Phone className="w-3 h-3" /> {lead.phone}
                                            </div>
                                            {lead.email && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" /> {lead.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 decoration-gray-400">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {lead.destination_interest || 'N/D'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium border border-transparent', STATUS_STYLES[lead.status] || 'bg-gray-100 text-gray-800')}>
                                            {STATUS_LABELS[lead.status] || lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedLead(lead) }}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-primary transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, lead.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Filter className="w-10 h-10 opacity-20" />
                                        <p>Nenhum lead encontrado com os filtros atuais.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Visual only for now) */}
            <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Mostrando {filteredLeads.length} de {leads.length} registros</span>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">Anterior</button>
                    <button disabled className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">Próxima</button>
                </div>
            </div>

            <LeadModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
                onUpdateStatus={async (id, status) => {
                    await supabase.from('leads').update({ status }).eq('id', id)
                    onUpdate()
                    setSelectedLead(null)
                }}
            />
        </div>
    )
}
