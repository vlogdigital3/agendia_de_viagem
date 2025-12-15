'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { MapPin, Phone, Building2, MoreHorizontal } from 'lucide-react'
import LeadModal from './LeadModal'
import clsx from 'clsx'

type Lead = {
    id: string
    name: string
    phone: string
    destination_interest: string
    status: string
    ai_summary: string
    created_at: string
}

const COLUMNS = [
    { id: 'new', label: 'Novo Lead', color: 'bg-blue-500' },
    { id: 'qualified', label: 'Qualificado', color: 'bg-purple-500' },
    { id: 'negotiation', label: 'Em Negociação', color: 'bg-yellow-500' },
    { id: 'payment_pending', label: 'Aguardando Pagto', color: 'bg-orange-500' },
    { id: 'won', label: 'Venda Realizada', color: 'bg-green-500' },
    { id: 'lost', label: 'Perdido', color: 'bg-red-500' },
]

export default function KanbanBoard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const fetchLeads = async () => {
        const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
        if (data) setLeads(data)
    }

    useEffect(() => {
        fetchLeads()
        const subscription = supabase.channel('leads_change_kanban').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads).subscribe()
        return () => { subscription.unsubscribe() }
    }, [])

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
        if (!error) fetchLeads()
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[400px]">
            {COLUMNS.map(col => {
                const columnLeads = leads.filter(l => l.status === col.id)
                return (
                    <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center justify-between px-1 mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{col.label}</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                                {columnLeads.length}
                            </span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="bg-gray-100 dark:bg-surface-darker/50 rounded-xl p-2 h-full border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
                            <AnimatePresence>
                                {columnLeads.length === 0 ? (
                                    <div className="h-24 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                        Vazio
                                    </div>
                                ) : (
                                    columnLeads.map(lead => (
                                        <motion.div
                                            key={lead.id}
                                            layoutId={lead.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => setSelectedLead(lead)}
                                            className="bg-white dark:bg-surface-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary dark:hover:border-primary transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={clsx("text-xs font-medium px-2 py-0.5 rounded", `text-${col.color.split('-')[1]}-600 bg-${col.color.split('-')[1]}-50 dark:bg-${col.color.split('-')[1]}-900/20`)}>
                                                    Lead
                                                </span>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{lead.name}</h4>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                                                <MapPin className="w-3 h-3" /> {lead.destination_interest || 'Destino n/a'}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </span>
                                                <div className={`w-6 h-6 rounded-full ${col.color} text-white text-xs flex items-center justify-center`}>
                                                    {lead.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )
            })}

            <LeadModal
                lead={selectedLead}
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateStatus={handleStatusUpdate}
            />
        </div>
    )
}
