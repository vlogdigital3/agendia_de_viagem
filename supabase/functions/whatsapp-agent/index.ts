import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        const body = await req.json();
        const data = body.data;

        // 1. IGNORE FROM ME
        if (!data || data.key?.fromMe) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

        // 2. IGNORE GROUPS (@g.us)
        const remoteJid = data.key?.remoteJid;
        if (remoteJid && remoteJid.includes('@g.us')) {
            console.log("Ignoring group message from: " + remoteJid);
            return new Response(JSON.stringify({ success: true, message: "Group ignored" }), { headers: corsHeaders });
        }

        const messageData = data.message;
        const messageContent = messageData?.conversation || messageData?.extendedTextMessage?.text || messageData?.imageMessage?.caption;
        const phone = remoteJid?.split('@')[0];
        const pushName = data.pushName;

        if (!messageContent || !phone) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

        const { data: config } = await supabaseClient.from('whatsapp_configs').select('*').eq('instance_name', 'maryfran-ai').single();
        if (!config || !config.active) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

        const { data: history } = await supabaseClient.from('chat_history').select('message').eq('session_id', phone).order('created_at', { ascending: true }).limit(10);
        const messages = (history || []).map(h => h.message);
        messages.push({ role: 'user', content: messageContent });

        const aiRes = await fetch(Deno.env.get('SUPABASE_URL') + "/functions/v1/chat-assistant", {
            method: 'POST',
            headers: { 'Authorization': "Bearer " + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, user_name: pushName })
        });

        const aiData = await aiRes.json();
        let finalMessage = aiData.content || "";

        if (finalMessage.includes("AUTO_NOTIFY_HUMAN_MARKER")) {
            finalMessage = finalMessage.replace("AUTO_NOTIFY_HUMAN_MARKER", "").trim();
            if (config.human_agent_phone) {
                await fetch(config.evolution_url + "/message/sendText/" + config.instance_name, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                    body: JSON.stringify({ number: config.human_agent_phone, text: "⚠️ NOVA SOLICITAÇÃO\n\nCliente: " + (pushName || phone) + " (@" + phone + ")\nInteresse: " + messageContent })
                });
            }
        }

        if (finalMessage) {
            const lowercaseMsg = finalMessage.toLowerCase();
            const { data: packages } = await supabaseClient.from('packages').select('title, images, videos').eq('active', true);

            const mentioned = packages?.filter((p: any) => {
                const title = p.title.toLowerCase();
                return lowercaseMsg.includes(title) || title.split(' ').some((word: string) => word.length > 4 && lowercaseMsg.includes(word));
            }) || [];

            for (const p of mentioned) {
                if (p.images && p.images.length > 0) {
                    for (const imgUrl of p.images) {
                        await fetch(config.evolution_url + "/message/sendMedia/" + config.instance_name, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                            body: JSON.stringify({ number: phone, media: imgUrl, mediatype: "image" })
                        });
                        await new Promise(r => setTimeout(r, 800));
                    }
                }
                if (p.videos && p.videos.length > 0) {
                    for (const vidUrl of p.videos) {
                        await fetch(config.evolution_url + "/message/sendMedia/" + config.instance_name, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                            body: JSON.stringify({ number: phone, media: vidUrl, mediatype: "video" })
                        });
                        await new Promise(r => setTimeout(r, 1200));
                    }
                }
            }

            if (finalMessage.length < 130) {
                const tts = await fetch("https://api.openai.com/v1/audio/speech", {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + Deno.env.get('OPENAI_API_KEY'), "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "tts-1", voice: "shimmer", input: finalMessage, response_format: "opus" })
                });

                if (tts.ok) {
                    const audioBuffer = await tts.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
                    await fetch(config.evolution_url + "/message/sendWhatsAppAudio/" + config.instance_name, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                        body: JSON.stringify({ number: phone, audio: base64, encoding: "base64" })
                    });
                } else {
                    await fetch(config.evolution_url + "/message/sendText/" + config.instance_name, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                        body: JSON.stringify({ number: phone, text: finalMessage })
                    });
                }
            } else {
                await fetch(config.evolution_url + "/message/sendText/" + config.instance_name, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                    body: JSON.stringify({ number: phone, text: finalMessage })
                });
            }

            await supabaseClient.from('chat_history').insert([
                { session_id: phone, message: { role: 'user', content: messageContent } },
                { session_id: phone, message: { role: 'assistant', content: finalMessage } }
            ]);
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
});
