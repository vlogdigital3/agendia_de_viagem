'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatWidget() {
    const whatsappNumber = '5511943539446'
    const message = 'Olá Nalva! Gostaria de planejar minha próxima viagem. ✨✈️'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    const handleRedirect = () => {
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="fixed bottom-6 right-6 font-sans z-[9999]">
            {/* Tooltip on Hover */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                whileHover={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-sm font-bold whitespace-nowrap pointer-events-none mb-2"
            >
                Falar com a Nalva no WhatsApp 🌴
                <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-100 dark:border-gray-700 rotate-45"></div>
            </motion.div>

            {/* Pulse Effect */}
            <div className="absolute inset-0 size-14 rounded-full bg-emerald-500/20 animate-ping"></div>

            {/* Main Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRedirect}
                className="relative size-14 rounded-full shadow-2xl flex items-center justify-center transition-all bg-emerald-500 text-white cursor-pointer border-4 border-white dark:border-gray-900 overflow-hidden group"
            >
                {/* Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <MessageCircle className="w-7 h-7" />

                {/* Online Indicator */}
                <span className="absolute top-2 right-2 size-3 bg-white rounded-full flex items-center justify-center">
                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                </span>
            </motion.button>
        </div>
    )
}
