'use client'

import { useState, useEffect } from 'react'
import LeadsTable from '@/components/LeadsTable'
import CreateLeadModal from '@/components/CreateLeadModal'
import { Plus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchLeads = async () => {
        setLoading(true)
        const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
        if (data) setLeads(data)
        setLoading(false)
    }

    const handleDeleteLead = async (id: string) => {
        const { error } = await supabase.from('leads').delete().eq('id', id)
        if (!error) {
            fetchLeads()
        } else {
            alert('Erro ao excluir lead')
        }
    }

    useEffect(() => {
        fetchLeads()
        const subscription = supabase.channel('leads_page').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads).subscribe()
        return () => { subscription.unsubscribe() }
    }, [])

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Gestão de Leads
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Visualize e gerencie todos os leads da agência.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-all shadow-lg shadow-primary/30"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Lead</span>
                </button>
            </div>

            {/* Table Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <LeadsTable
                    leads={leads}
                    onUpdate={fetchLeads}
                    onDelete={handleDeleteLead}
                />
            )}

            <CreateLeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchLeads}
            />
        </div>
    )
}
