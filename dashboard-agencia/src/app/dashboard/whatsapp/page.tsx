'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { MessageSquare, Shield, HelpCircle, CheckCircle2, XCircle, QrCode, Phone, Users, History, Eye, Signal, LogOut, Plus, X, Settings, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const EVO_CONFIG = {
    url: 'https://api.vlogia.com.br',
    apikey: 'b6ff2fcd3acabca05a948b13e08bad86',
    instance: 'maryfran-ai'
}

export default function WhatsAppPage() {
    const [configs, setConfigs] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
    const [whitelistNum, setWhitelistNum] = useState('')
    const [blacklistNum, setBlacklistNum] = useState('')
    const [qrCode, setQrCode] = useState<string | null>(null)

    const setupWebhook = async (instanceName: string) => {
        try {
            await fetch(`https://api.vlogia.com.br/webhook/set/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'b6ff2fcd3acabca05a948b13e08bad86'
                },
                body: JSON.stringify({
                    url: "https://mjpwylpoedzikgbzcncr.supabase.co/functions/v1/whatsapp-agent",
                    enabled: true,
                    events: ["MESSAGES_UPSERT"]
                })
            })
            console.log("Webhook configured successfully")
        } catch (e) {
            console.error("Error setting up webhook", e)
        }
    }

    const checkStatus = async (instanceName: string) => {
        try {
            const resp = await fetch(`${EVO_CONFIG.url}/instance/connectionState/${instanceName}`, {
                headers: { 'apikey': EVO_CONFIG.apikey }
            })

            if (!resp.ok) {
                if (resp.status === 404) setStatus('disconnected')
                return
            }

            const data = await resp.json()
            const state = data.instance?.state || data.state || (data.status === 'open' ? 'open' : null)

            if (state === 'open' || state === 'CONNECTED') {
                setStatus('connected')
                setQrCode(null)
            } else if (state === 'connecting' || state === 'CONNECTING') {
                setStatus('connecting')
                if (!qrCode) {
                    const qrResp = await fetch(`${EVO_CONFIG.url}/instance/connect/${instanceName}`, {
                        headers: { 'apikey': EVO_CONFIG.apikey }
                    })
                    const qrData = await qrResp.json()
                    if (qrData.base64) setQrCode(qrData.base64)
                }
            } else {
                setStatus('disconnected')
            }
        } catch (e: any) {
            // Silence "Failed to fetch" to avoid Next.js error overlay in dev
            if (e.message === 'Failed to fetch') {
                console.warn("WhatsApp API unreachable (CORS or Network issue)")
            } else {
                console.error("Error checking WhatsApp status:", e)
            }
        }
    }

    const generateQRCode = async () => {
        setStatus('connecting')
        try {
            // First ensure instance exists (create if needed)
            const createResp = await fetch(`${EVO_CONFIG.url}/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVO_CONFIG.apikey
                },
                body: JSON.stringify({
                    instanceName: EVO_CONFIG.instance,
                    token: EVO_CONFIG.apikey,
                    qrcode: true,
                    integration: 'WHATSAPP-BAILEYS'
                })
            })

            // Wait a bit for instance to stabilize
            await new Promise(r => setTimeout(r, 1000))

            const resp = await fetch(`${EVO_CONFIG.url}/instance/connect/${EVO_CONFIG.instance}`, {
                headers: { 'apikey': EVO_CONFIG.apikey }
            })
            const data = await resp.json()
            if (data.base64) {
                setQrCode(data.base64)
            } else {
                // If create failed or already exists, try to get connection state
                await checkStatus(EVO_CONFIG.instance)
            }
        } catch (e: any) {
            console.warn("Error generating QR:", e.message)
            alert("Erro ao conectar com a API. Verifique sua conexão ou se há um bloqueador de anúncios ativo.")
            setStatus('disconnected')
        }
    }

    const handleDeleteInstance = async () => {
        if (!confirm('AVISO CRÍTICO: Isso excluirá permanentemente a instância "maryfran-ai" e todas as suas configurações na API. Deseja continuar?')) return

        const originalStatus = status
        setStatus('connecting') // Visual feedback of work

        try {
            console.log("Attempting to delete instance: maryfran-ai")
            const resp = await fetch(`https://api.vlogia.com.br/instance/delete/maryfran-ai`, {
                method: 'DELETE',
                headers: { 'apikey': 'b6ff2fcd3acabca05a948b13e08bad86' }
            })

            const data = await resp.json()
            console.log("Delete response:", data)

            if (resp.status === 200 || resp.status === 201) {
                alert('Instância excluída com sucesso! Recarregando página...')
                window.location.reload() // Force full refresh
            } else {
                alert(`Erro na API (${resp.status}): ` + (data.message || data.response?.message || 'Erro desconhecido'))
                setStatus(originalStatus)
            }
        } catch (e: any) {
            console.error("Error deleting instance", e)
            alert('Erro de conexão: ' + e.message)
            setStatus(originalStatus)
        }
    }

    const handleLogout = async () => {
        if (!confirm('Deseja realmente desconectar o WhatsApp?')) return
        try {
            await fetch(`${EVO_CONFIG.url}/instance/logout/${EVO_CONFIG.instance}`, {
                method: 'DELETE',
                headers: { 'apikey': EVO_CONFIG.apikey }
            })
            setStatus('disconnected')
            setQrCode(null)
        } catch (e) {
            console.error("Error logging out", e)
        }
    }

    const fetchConfigs = async () => {
        try {
            setLoading(true)
            const { data, error: fetchError } = await supabase.from('whatsapp_configs').select('*').limit(1).maybeSingle()

            if (fetchError) {
                console.error("Supabase fetch error:", fetchError)
                // If it's a real error (not just no rows), we might want to handle it
            }

            const targetUrl = 'https://api.vlogia.com.br'
            const targetKey = 'b6ff2fcd3acabca05a948b13e08bad86'
            const targetInstance = 'maryfran-ai'

            if (data) {
                setConfigs(data)
                // Ensure DB matches hardcoded target config
                if (data.evolution_url !== EVO_CONFIG.url || data.evolution_apikey !== EVO_CONFIG.apikey || data.instance_name !== EVO_CONFIG.instance) {
                    const { data: updated } = await supabase.from('whatsapp_configs').update({
                        evolution_url: EVO_CONFIG.url,
                        evolution_apikey: EVO_CONFIG.apikey,
                        instance_name: EVO_CONFIG.instance
                    }).eq('id', data.id).select().single()
                    if (updated) setConfigs(updated)
                }
                await checkStatus(EVO_CONFIG.instance)
            } else {
                // If no data, try to create it, but catch errors
                try {
                    const { data: newData, error: insertError } = await supabase.from('whatsapp_configs').insert([
                        { instance_name: EVO_CONFIG.instance, evolution_url: EVO_CONFIG.url, evolution_apikey: EVO_CONFIG.apikey }
                    ]).select().single()

                    if (insertError) throw insertError
                    if (newData) setConfigs(newData)
                } catch (e) {
                    console.error("Failed to create default configs", e)
                    // Set a local dummy config so we don't stay in loading state if DB is unreachable
                    setConfigs({
                        instance_name: targetInstance,
                        evolution_url: targetUrl,
                        evolution_apikey: targetKey,
                        behavior: { ignore_groups: true },
                        whitelist: []
                    })
                }
            }
        } catch (e) {
            console.error("Critical error in fetchConfigs", e)
        } finally {
            setLoading(false)
        }
    }

    const updateBehavior = async (key: string, value: boolean) => {
        if (!configs) return
        const currentBehavior = configs.behavior || {
            view_status: false,
            reject_calls: false,
            sync_history: false,
            always_online: false,
            ignore_groups: true,
            read_messages: false
        }
        const newBehavior = { ...currentBehavior, [key]: value }

        try {
            if (!configs.id) {
                // Creation logic if no ID
                const { data } = await supabase.from('whatsapp_configs').upsert({
                    instance_name: 'maryfran-ai',
                    evolution_url: 'https://api.vlogia.com.br',
                    evolution_apikey: 'b6ff2fcd3acabca05a948b13e08bad86',
                    behavior: newBehavior
                }, { onConflict: 'instance_name' }).select().single()
                if (data) setConfigs(data)
            } else {
                const { error } = await supabase.from('whatsapp_configs').update({ behavior: newBehavior }).eq('id', configs.id)
                if (!error) setConfigs({ ...configs, behavior: newBehavior })
            }
        } catch (e) {
            console.error("Error updating behavior:", e)
        }
    }

    const addToWhitelist = async () => {
        console.log("addToWhitelist called with:", whitelistNum)
        if (!whitelistNum || !configs) return

        const newWhitelist = [...(configs.whitelist || []), whitelistNum]

        try {
            if (!configs.id) {
                const { data } = await supabase.from('whatsapp_configs').upsert({
                    instance_name: 'maryfran-ai',
                    evolution_url: 'https://api.vlogia.com.br',
                    evolution_apikey: 'b6ff2fcd3acabca05a948b13e08bad86',
                    whitelist: newWhitelist
                }, { onConflict: 'instance_name' }).select().single()
                if (data) setConfigs(data)
            } else {
                const { error } = await supabase.from('whatsapp_configs').update({ whitelist: newWhitelist }).eq('id', configs.id)
                if (!error) {
                    setConfigs({ ...configs, whitelist: newWhitelist })
                    setWhitelistNum('')
                } else {
                    alert("Erro ao salvar: " + error.message)
                }
            }
        } catch (e) {
            console.error("Error in addToWhitelist:", e)
        }
    }

    const removeFromWhitelist = async (num: string) => {
        console.log("removeFromWhitelist called for:", num)
        if (!configs || !configs.whitelist) return

        const newWhitelist = configs.whitelist.filter((n: string) => n !== num)
        console.log("New whitelist after removal:", newWhitelist)

        try {
            const { error } = await supabase.from('whatsapp_configs').update({ whitelist: newWhitelist }).eq('id', configs.id)
            if (error) {
                console.error("Supabase update error (remove whitelist):", error)
            } else {
                setConfigs({ ...configs, whitelist: newWhitelist })
            }
        } catch (e) {
            console.error("Unexpected error in removeFromWhitelist:", e)
        }
    }

    useEffect(() => {
        fetchConfigs()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            // Poll more frequently if not connected or connecting
            checkStatus('maryfran-ai')
        }, status === 'connected' ? 15000 : 5000)
        return () => clearInterval(interval)
    }, [status, qrCode])

    if (loading || !configs) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
    )

    return (
        <div className="flex-1 overflow-y-auto p-8 pt-6 h-full font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    WhatsApp AI
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie a conexão do seu assistente inteligente e controle quem pode interagir com ele.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Connection Status Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-primary" />
                                <h2 className="font-bold text-gray-900 dark:text-white">Status da Conexão</h2>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'connected' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></span>
                                {status === 'connected' ? 'Conectado' : 'Desconectado'}
                            </div>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            {status === 'connected' ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-2 mx-auto">
                                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src="https://api.uifaces.co/our-content/donated/x4_8z_hy.jpg"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1/2 translate-x-1/2 p-1.5 bg-green-500 border-4 border-white dark:border-surface-dark rounded-full">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-xl">Maryfran AI Assistant</p>
                                        <p className="text-gray-500 flex items-center justify-center gap-2 mt-1">
                                            <Signal className="w-4 h-4 text-green-500" />
                                            Sincronizado e Ativo
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all mx-auto shadow-sm"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Desconectar WhatsApp
                                        </button>
                                        <button
                                            onClick={handleDeleteInstance}
                                            className="flex items-center gap-2 px-6 py-2 rounded-lg text-red-500 hover:text-red-700 text-xs font-medium transition-all mx-auto border border-red-200 hover:border-red-500 bg-white"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Excluir Instância (Cuidado)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-64 h-64 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden relative group">
                                        {qrCode ? (
                                            <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <QrCode className="w-32 h-32 text-gray-200 dark:text-gray-700" />
                                        )}

                                        {/* Overlay to delete even if not connected */}
                                        <button
                                            onClick={handleDeleteInstance}
                                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            title="Excluir Instância"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        {qrCode ? 'Aponte a câmera do seu WhatsApp para o código acima.' : 'Escaneie o QR Code com o seu WhatsApp para ativar a IA.'}
                                    </p>
                                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                                        <button
                                            onClick={generateQRCode}
                                            disabled={status === 'connecting'}
                                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {status === 'connecting' ? 'Gerando...' : 'Gerar QR Code'}
                                        </button>

                                        <button
                                            onClick={handleDeleteInstance}
                                            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-xs font-bold transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            EXCLUIR INSTÂNCIA ATUAL
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Behavior Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-accent-purple" />
                                <h2 className="font-bold text-gray-900 dark:text-white">Comportamento</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { id: 'reject_calls', label: 'Rejeitar Chamadas', desc: 'Rejeitar automaticamente todas as chamadas de voz/vídeo.', icon: Phone },
                                { id: 'ignore_groups', label: 'Ignorar Grupos', desc: 'Ignorar mensagens vindas de grupos.', icon: Users },
                                { id: 'always_online', label: 'Sempre Online', desc: 'Manter o status como Online permanentemente.', icon: Signal },
                                { id: 'read_messages', label: 'Visualizar Mensagens', desc: 'Marcar mensagens como lidas automaticamente.', icon: Eye },
                                { id: 'sync_history', label: 'Sincronizar Histórico', desc: 'Baixar histórico de conversas ao conectar.', icon: History },
                                { id: 'view_status', label: 'Visualizar Status', desc: 'Marcar status dos contatos como visualizados.', icon: Eye },
                            ].map((item) => (
                                <div key={item.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-50 dark:border-gray-800/50 hover:border-primary/20 transition-all">
                                    <div className="flex gap-4">
                                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateBehavior(item.id, !(configs.behavior?.[item.id] ?? false))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${configs.behavior?.[item.id] ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${configs.behavior?.[item.id] ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Access Configuration */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-gray-900 dark:text-white">Configurações de Acesso da IA</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Whitelist */}
                            <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                                        <h3 className="font-bold text-green-900 dark:text-green-300">Modo de Teste (Whitelist)</h3>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded uppercase">Prioridade Alta</span>
                                </div>
                                <p className="text-xs text-green-700 dark:text-green-400/80 mb-4">Se houver números aqui, a IA responderá SOMENTE a eles.</p>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={whitelistNum}
                                        onChange={(e) => setWhitelistNum(e.target.value)}
                                        placeholder="Ex: 5511999998888"
                                        className="flex-1 px-4 py-2 text-sm rounded-xl bg-white dark:bg-surface-dark border border-green-200 dark:border-green-800 focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-green-200"
                                    />
                                    <button
                                        onClick={addToWhitelist}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {configs.whitelist?.map((num: string) => (
                                        <span key={num} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-green-900/30 rounded-lg text-xs font-bold text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 shadow-sm">
                                            {num}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromWhitelist(num)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Blacklist */}
                            <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                                    <h3 className="font-bold text-red-900 dark:text-red-300">Lista Negra (Blacklist)</h3>
                                </div>
                                <p className="text-xs text-red-700 dark:text-red-400/80 mb-4">Bloquear números específicos. A IA ignorará mensagens destes contatos.</p>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ex: 5511999998888"
                                        className="flex-1 px-4 py-2 text-sm rounded-xl bg-white dark:bg-surface-dark border border-red-200 dark:border-red-800 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-red-200"
                                    />
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                                        Bloquear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-8">
                    {/* Important Info Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <HelpCircle className="w-5 h-5" />
                            Importante
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-green-600 dark:text-green-500">Sobre o Modo de Teste</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    Quando você adiciona um número na Whitelist, a IA entra automaticamente em Modo de Teste.
                                    Isso significa que ela vai ignorar qualquer pessoa que NÃO esteja na lista. Isso é perfeito para testar novas funcionalidades sem impactar clientes reais.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-red-600 dark:text-red-500">Sobre a Lista Negra</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    Use para bloquear números que não devem receber atendimento (ex: spam, concorrentes). O bloqueio só funciona se a Whitelist estiver vazia (Modo de Teste desativado).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guide Card */}
                    <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <HelpCircle className="w-5 h-5" />
                            Como Conectar?
                        </div>

                        <div className="space-y-6 relative">
                            {/* Line connecting steps */}
                            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800"></div>

                            {[
                                { step: 1, title: 'Abra o WhatsApp', desc: 'No seu celular, abra o aplicativo.' },
                                { step: 2, title: 'Aparelhos Conectados', desc: 'Vá em Configurações > Aparelhos conectados > Conectar aparelho.' },
                                { step: 3, title: 'Escaneie o Código', desc: 'Aponte a câmera para o QR Code na tela.' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
