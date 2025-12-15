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

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                    Configurações
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie perfis de acesso e preferências.</p>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent-purple" />
                        Controle de Acesso e Cargos
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Defina quem pode acessar o que no dashboard.</p>
                </div>

                <div className="p-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg h-fit text-blue-600 dark:text-blue-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Gerenciamento de Time</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                    Nesta versão de demonstração, você pode visualizar a estrutura de cargos.
                                    A integração completa com convites de e-mail requer configuração SMTP.
                                </p>
                            </div>
                        </div>
                    </div>

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
                                    <button className="text-sm text-primary font-medium hover:underline">Editar</button>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-all font-medium text-sm flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Convidar Novo Usuário
                        </button>
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
