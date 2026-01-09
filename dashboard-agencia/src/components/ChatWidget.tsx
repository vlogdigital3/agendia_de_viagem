'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Bot, Plane, Loader2, Headset } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// We need the edge function URL. Usually it's https://[project-ref].supabase.co/functions/v1/[function-name]
const CHAT_API_URL = 'https://mjpwylpoedzikgbzcncr.supabase.co/functions/v1/chat-assistant'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, packages?: any[] }[]>([
        { role: 'assistant', content: 'Olá! Sou a Sofia, consultora de elite da Maryfran Turismo. ✈️✨ É um prazer conversar com você! Como posso tornar sua próxima viagem inesquecível hoje?' }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const [isCollectingLead, setIsCollectingLead] = useState(false)
    const [sessionId, setSessionId] = useState('')
    const [leadData, setLeadData] = useState({ name: '', phone: '', email: '' })
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Initialize or retrieve session ID
        let id = localStorage.getItem('chat_session_id')
        if (!id) {
            id = Math.random().toString(36).substring(7)
            localStorage.setItem('chat_session_id', id)
        }
        setSessionId(id)
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSend = async (e?: React.FormEvent, customMsg?: string) => {
        e?.preventDefault()
        const textContent = customMsg || message
        if (!textContent.trim() || isLoading) return

        const userMessage = { role: 'user' as const, content: textContent }
        setMessages(prev => [...prev, userMessage])
        if (!customMsg) setMessage('')
        setIsLoading(true)

        try {
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    sessionId: sessionId,
                    user_name: leadData.name || 'Visitante',
                    platform: 'web'
                })
            })

            const data = await response.json()

            if (data.content) {
                // Check for human handover marker
                if (data.content.includes("AUTO_NOTIFY_HUMAN_MARKER")) {
                    setIsCollectingLead(true)
                    const cleanContent = data.content.split('---').pop()?.trim() || "Pronto! Para que um de nossos especialistas assuma seu atendimento com exclusividade, por favor, me informe seus dados básicos:"
                    setMessages(prev => [...prev, { role: 'assistant', content: cleanContent }])
                } else {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.content,
                        packages: data.packages
                    }])
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um probleminha técnico. Pode tentar novamente? 😅' }])
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Estou com dificuldades de conexão no momento. Que tal nos chamar no WhatsApp? 🌴' }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCollectingLead(false)
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Obrigada, ${leadData.name}! Seus dados foram enviados. Um de nossos consultores entrará em contato em breve pelo WhatsApp ${leadData.phone}. Até logo! ✨`
        }])

        // Open WhatsApp directly for the user as a "premium" experience
        const wpMsg = `Olá! Vim do site da Maryfran e gostaria de falar com um especialista. Meu nome é ${leadData.name}.`
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(wpMsg)}`, '_blank')

        console.log("New Lead Collected:", leadData)
    }

    const handlePackageClick = (pkgTitle: string) => {
        handleSend(undefined, `Me fale mais sobre ${pkgTitle}`)
    }

    return (
        <div className="fixed bottom-6 right-6 font-sans z-[9999]">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] max-h-[70vh] sm:max-h-[600px] bg-white dark:bg-surface-dark rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col z-50 border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 sm:p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Headset className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg sm:text-xl tracking-tight">Sofia</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Online agora</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-black/20">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                            }`}>
                                            {msg.content}

                                            {msg.packages && msg.packages.length > 0 && (
                                                <div className="mt-4 space-y-4">
                                                    {msg.packages.map((pkg: any, pidx) => (
                                                        <motion.div
                                                            key={pidx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                                                        >
                                                            {pkg.images?.[0] && (
                                                                <img src={pkg.images[0]} alt={pkg.title} className="w-full h-32 object-cover" />
                                                            )}
                                                            <div className="p-3">
                                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{pkg.title}</h4>
                                                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{pkg.description}</p>
                                                                <button
                                                                    onClick={() => handlePackageClick(pkg.title)}
                                                                    className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer z-10 relative"
                                                                >
                                                                    Explorar Destino
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area / Lead Form */}
                        {isCollectingLead ? (
                            <form onSubmit={handleLeadSubmit} className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark space-y-4">
                                <div className="space-y-3">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={leadData.name}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
                                    />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="WhatsApp (com DDD)"
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
                                    />
                                    <input
                                        type="email"
                                        placeholder="E-mail (opcional)"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer"
                                >
                                    Falar com Especialista
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-primary transition-all">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || isLoading}
                                        className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`size-14 rounded-full shadow-2xl flex items-center justify-center transition-all bg-emerald-500 text-white ${isOpen ? 'rotate-90' : ''}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>
        </div>
    )
}
