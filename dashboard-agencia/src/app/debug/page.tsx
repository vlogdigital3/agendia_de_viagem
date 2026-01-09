'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
    const [status, setStatus] = useState<any>({ loading: true })
    const [packages, setPackages] = useState<any[]>([])

    useEffect(() => {
        async function runDebug() {
            try {
                console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

                const { data, error, count } = await supabase
                    .from('packages')
                    .select('*', { count: 'exact' })

                if (error) {
                    setStatus({
                        loading: false,
                        error: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    })
                } else {
                    setStatus({
                        loading: false,
                        success: true,
                        count: count
                    })
                    setPackages(data || [])
                }
            } catch (err: any) {
                setStatus({ loading: false, error: err.message })
            }
        }
        runDebug()
    }, [])

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Supabase Debug Panel</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Connection Status:</h2>
                <pre>{JSON.stringify(status, null, 2)}</pre>
            </div>

            <div>
                <h2 className="font-bold mb-2">Found Packages ({packages.length}):</h2>
                <div className="grid gap-2">
                    {packages.map(p => (
                        <div key={p.id} className="p-2 border rounded">
                            {p.title} (Active: {String(p.active)})
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-gray-500">
                Check browser console (F12) for more details.
            </div>
        </div>
    )
}
