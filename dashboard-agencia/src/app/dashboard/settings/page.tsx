'use client'



import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Shield, User, Mail, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
    const [users, setUsers] = useState<any[]>([])
    // Mock user for now since we can't easily list auth.users without admin key
    // In a real app, this would fetch from 'user_roles' joined with auth

    // For this prototype, we will allow creating "Profiles" in user_roles manually
    // to simulate the hierarchy.

    const [loading, setLoading] = useState(false)
    const [humanPhone, setHumanPhone] = useState('')
    const [saving, setSaving] = useState(false)
    const [configId, setConfigId] = useState<string | null>(null)

    useEffect(() => {
        const loadConfigs = async () => {
            const { data } = await supabase.from('whatsapp_configs').select('id, human_agent_phone').limit(1).maybeSingle()
            if (data) {
                setHumanPhone(data.human_agent_phone || '')
                setConfigId(data.id)
            }
        }
        loadConfigs()
    }, [])

    const handleSaveHumanPhone = async () => {
        if (!configId) return
        setSaving(true)
        const { error } = await supabase
            .from('whatsapp_configs')
            .update({ human_agent_phone: humanPhone })
            .eq('id', configId)

        if (!error) {
            alert('Telefone do agente salvo com sucesso!')
        } else {
            alert('Erro ao salvar telefone.')
        }
        setSaving(false)
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                    Configurações
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie perfis de acesso e preferências.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Access Control Card */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent-purple" />
                            Controle de Acesso e Cargos
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Defina quem pode acessar o que no dashboard.</p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Mock Users List */}
                            {[
                                { name: 'Admin Principal', role: 'admin', email: 'admin@agencia.com' },
                                { name: 'Financeiro', role: 'financial', email: 'financeiro@agencia.com' },
                                { name: 'Agente de Vendas', role: 'agent', email: 'vendas@agencia.com' }
                            ].map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Automation & Notification Settings */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Notificações e Transbordo
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Configure o contato para atendimento humano.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">WhatsApp do Agente Humano</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={humanPhone}
                                    onChange={(e) => setHumanPhone(e.target.value)}
                                    placeholder="Ex: 5519999998888"
                                    className="flex-1 px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                                <button
                                    onClick={handleSaveHumanPhone}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                                >
                                    {saving ? '...' : <Save className="w-4 h-4" />}
                                    Salvar
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                                A IA Sofia enviará um resumo e o contato do lead para este número quando detectar necessidade de atendimento humano.
                            </p>
                        </div>

                        <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Modelo de Notificação</h4>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-[11px] font-mono text-gray-600 dark:text-gray-400 space-y-1 border border-gray-100 dark:border-gray-800">
                                <p>🔔 *NOVO ATENDIMENTO HUMANO*</p>
                                <p>*Nome Cliente:* [Nome do Lead]</p>
                                <p>*Tel:* [Número do Lead]</p>
                                <p>*Obs:* [Contexto da conversa]</p>
                                <p>----------</p>
                                <p>*Resumo IA:* [Resumo gerado pela Sofia]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
