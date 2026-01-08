'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Phone, Mail, User, Bot, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

type Lead = {
    id: string
    name: string
    phone: string
    email?: string
    destination_interest: string
    status: string
    ai_summary?: string | null
    created_at: string
}

type Props = {
    lead: Lead | null
    isOpen: boolean
    onClose: () => void
    onUpdateStatus: (id: string, status: string) => void
}

const STATUS_OPTIONS = [
    { id: 'new', label: 'Novo Lead' },
    { id: 'qualified', label: 'Qualificado' },
    { id: 'negotiation', label: 'Em Negociação' },
    { id: 'payment_pending', label: 'Aguardando Pagamento' },
    { id: 'won', label: 'Venda Realizada' },
    { id: 'lost', label: 'Perdido' },
]

export default function LeadModal({ lead, isOpen, onClose, onUpdateStatus }: Props) {
    if (!isOpen || !lead) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 border-b border-white/5 p-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {lead.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {STATUS_OPTIONS.find(s => s.id === lead.status)?.label}
                                </span>
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    • <MapPin className="w-3 h-3" /> {lead.destination_interest}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Telefone</label>
                                <div className="flex items-center gap-2 text-white">
                                    <Phone className="w-4 h-4 text-green-500" />
                                    {lead.phone}
                                </div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Email</label>
                                <div className="flex items-center gap-2 text-white">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    {lead.email || 'Não informado'}
                                </div>
                            </div>
                        </div>

                        {/* AI Summary Section */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Bot className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                                <Bot className="w-5 h-5" /> Resumo da IA
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {lead.ai_summary || "Nenhum resumo disponível para este lead."}
                            </p>
                        </div>

                        {/* Actions / Status Change */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Mover para Fase</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            onUpdateStatus(lead.id, opt.id)
                                            onClose()
                                        }}
                                        className={clsx(
                                            "p-3 rounded-lg border text-sm transition-all hover:scale-105 active:scale-95 text-left",
                                            lead.status === opt.id
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                : "bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-700 hover:text-white"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-gray-900/50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors">Fechar</button>
                        <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                        >
                            <Phone className="w-4 h-4" /> Chamar no WhatsApp
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
