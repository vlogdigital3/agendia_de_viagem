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
        // Evolution API sends instance name in 'instance' field
        const instanceName = body.instance || 'maryfran-ai';
        const data = body.data;

        // 1. IGNORE FROM ME (Prevent infinite loops)
        if (!data || data.key?.fromMe) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

        const remoteJid = data.key?.remoteJid;
        const phone = remoteJid?.split('@')[0];
        const isGroup = remoteJid?.includes('@g.us');

        // Fetch config for this specific instance
        const { data: config } = await supabaseClient
            .from('whatsapp_configs')
            .select('*')
            .eq('instance_name', instanceName)
            .single();

        if (!config || !config.active) {
            console.log(`[${instanceName}] Instance inactive or not found in DB.`);
            return new Response(JSON.stringify({ success: true, message: "Inactive" }), { headers: corsHeaders });
        }

        // 2. GROUP FILTER (Based on DB 'ignore_groups' flag)
        const ignoreGroups = config.behavior?.ignore_groups ?? true;
        if (isGroup && ignoreGroups) {
            console.log(`[${instanceName}] BLOCKED: Group message from ${remoteJid}`);
            return new Response(JSON.stringify({ success: true, message: "Group ignored" }), { headers: corsHeaders });
        }

        // 3. WHITELIST FILTER (Crucial for scaling and testing)
        const whitelist = config.whitelist || [];
        if (whitelist.length > 0 && !whitelist.includes(phone)) {
            console.log(`[${instanceName}] BLOCKED: ${phone} not in whitelist.`);
            return new Response(JSON.stringify({ success: true, message: "Not in whitelist" }), { headers: corsHeaders });
        }

        const pushName = data.pushName || 'Desconhecido';
        const messageContent = data.message?.conversation || data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || "";

        if (!phone || (!messageContent && !data.message?.imageMessage)) {
            return new Response(JSON.stringify({ success: true, message: "No content/phone" }), { headers: corsHeaders });
        }

        // Idempotency check: Ignore if same message from same phone in the last 5 seconds
        const { data: recentMsgs } = await supabaseClient
            .from('chat_history')
            .select('created_at, message')
            .eq('session_id', phone)
            .order('created_at', { ascending: false })
            .limit(1);

        if (recentMsgs && recentMsgs.length > 0) {
            const lastMsg = recentMsgs[0];
            const lastTime = new Date(lastMsg.created_at).getTime();
            const now = Date.now();
            if (now - lastTime < 5000 && lastMsg.message.role === 'user' && lastMsg.message.content === messageContent) {
                console.log(`[${instanceName}] DUPLICATE DETECTED: Ignoring repeat message from ${phone}`);
                return new Response(JSON.stringify({ success: true, message: "Duplicate ignored" }), { headers: corsHeaders });
            }
        }

        // 4. CALL AI ASSISTANT
        const aiCallStartTime = Date.now();
        const { data: history } = await supabaseClient
            .from('chat_history')
            .select('message')
            .eq('session_id', phone)
            .order('created_at', { ascending: true })
            .limit(20);

        const messages = (history || []).map(h => h.message);
        messages.push({ role: 'user', content: messageContent });

        const aiRes = await fetch(Deno.env.get('SUPABASE_URL') + "/functions/v1/chat-assistant", {
            method: 'POST',
            headers: { 'Authorization': "Bearer " + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, user_name: pushName })
        });

        const aiData = await aiRes.json();
        let finalMessage = aiData.content || "";

        // --- CLEAN MARKDOWN ---
        if (finalMessage) {
            finalMessage = finalMessage
                .replace(/^#+\s+/gm, '')
                .replace(/^\s*[-*•]\s+/gm, '📍 ')
                .replace(/^\s*\d+[.)]\s+/gm, '📍 ') // Forcefully strip numbered lists
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }

        // Handle Human Request Marker
        if (finalMessage.includes("AUTO_NOTIFY_HUMAN_MARKER")) {
            const rawContent = finalMessage.replace("AUTO_NOTIFY_HUMAN_MARKER", "").trim();
            const [richReason, ...goodbyeParts] = rawContent.split("---");
            const goodbyeMessage = goodbyeParts.join("---").trim();

            finalMessage = goodbyeMessage || "Perfeito! Já passei todos os detalhes para o nosso consultor especializado. Em instantes ele entrará em contato com você por aqui mesmo para finalizarmos! 😊🚀";

            if (config.human_agent_phone) {
                await fetch(`${config.evolution_url}/message/sendText/${instanceName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                    body: JSON.stringify({
                        number: config.human_agent_phone,
                        text: `✅ *NOVO LEAD QUALIFICADO!*\n\n${richReason.trim()}\n\n👤 *Cliente:* ${pushName}\n📱 *WhatsApp:* ${phone}`
                    })
                }).catch(() => { });
            }
        }

        if (finalMessage) {
            // --- RESTORE MEDIA SENDING WITH NORMALIZATION ---
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedMsg = normalize(finalMessage);
            const normalizedUser = normalize(messageContent);

            // Fetch last assistant message specifically to avoid immediate duplicate cards
            const { data: lastMsgs } = await supabaseClient
                .from('chat_history')
                .select('message')
                .eq('session_id', phone)
                .order('created_at', { ascending: false })
                .limit(2);

            const lastAssistantContent = lastMsgs?.find(m => m.message.role === 'assistant')?.message.content || "";
            const normalizedLast = normalize(lastAssistantContent);

            const { data: packages } = await supabaseClient.from('packages').select('title, description, images, videos').eq('active', true);

            const hasGalleryMarker = finalMessage.includes("AUTO_SEND_GALLERY_MARKER");
            if (hasGalleryMarker) {
                finalMessage = finalMessage.replace("AUTO_SEND_GALLERY_MARKER", "").trim();
            }

            const mentioned = packages?.filter((p: any) => {
                // Use only the part before '–' to identify the destination (e.g., "Fernando de Noronha")
                const mainName = p.title.split('–')[0].trim();
                const titleParts = mainName.split(/[^a-zA-ZáéíóúÁÉÍÓÚçÇ]/).filter((w: string) => w.length > 3);

                if (titleParts.length === 0) return false;

                // Match if any part of the ACTUAL destination name is mentioned
                // Exclude generic words from being the ONLY trigger
                const genericWords = ['ferias', 'viagem', 'pacote', 'aventura', 'charme', 'experiencia'];
                const isNowMentioned = titleParts.some((part: string) => {
                    const normPart = normalize(part);
                    return normalizedMsg.includes(normPart) && !genericWords.includes(normPart);
                }) || (titleParts.length === 1 && normalizedMsg.includes(normalize(titleParts[0])));

                const wasJustMentioned = titleParts.some((part: string) => normalizedLast.includes(normalize(part)));
                const userWantsMore = normalizedUser.match(/foto|imagem|detalhe|mais|ver|olha|mostra|cade|qual|onde/);

                // Send card if mentioned AND (not sent in the very last msg OR user explicitly asked for more OR explicit marker)
                return isNowMentioned && (!wasJustMentioned || userWantsMore || hasGalleryMarker);
            })?.slice(0, 2) || [];

            for (const p of mentioned) {
                const isDeepDive = mentioned.length === 1 && (finalMessage.length > 500 || normalizedUser.match(/detalhe|passeio|mais|foto|imagem/) || hasGalleryMarker);

                if (p.images && p.images.length > 0) {
                    // Send first image as a "Card" (Image + Caption)
                    const firstImg = p.images[0];
                    const cardCaption = `🌴 *${p.title}*\n\n${p.description?.substring(0, 200)}...\n\n✨ _Fale comigo para saber mais!_`;

                    await fetch(`${config.evolution_url}/message/sendMedia/${instanceName}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                        body: JSON.stringify({
                            number: phone,
                            media: firstImg,
                            mediatype: "image",
                            caption: cardCaption
                        })
                    }).catch(e => console.error("Error sending card:", e));

                    await new Promise(r => setTimeout(r, 1500));

                    // If it's a deep dive and we have more images, send them as gallery
                    if (isDeepDive && p.images.length > 1) {
                        for (let i = 1; i < p.images.length; i++) {
                            await fetch(`${config.evolution_url}/message/sendMedia/${instanceName}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                                body: JSON.stringify({ number: phone, media: p.images[i], mediatype: "image" })
                            }).catch(e => console.error("Error sending gallery image:", e));
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    }
                }

                if (isDeepDive && p.videos && p.videos.length > 0) {
                    for (const vidUrl of p.videos) {
                        await fetch(`${config.evolution_url}/message/sendMedia/${instanceName}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                            body: JSON.stringify({ number: phone, media: vidUrl, mediatype: "video" })
                        }).catch(e => console.error("Error sending video:", e));
                        await new Promise(r => setTimeout(r, 1500));
                    }
                }
            }

            // Presence 'typing'
            fetch(`${config.evolution_url}/chat/retrivePresence/${instanceName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                body: JSON.stringify({ number: phone, presence: "composing" })
            }).catch(() => { });

            // AI Response (TTS logic if short, else text)
            if (finalMessage.length < 130 && Deno.env.get('OPENAI_API_KEY')) {
                const tts = await fetch("https://api.openai.com/v1/audio/speech", {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + Deno.env.get('OPENAI_API_KEY'), "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "tts-1", voice: "shimmer", input: finalMessage, response_format: "opus" })
                });

                if (tts.ok) {
                    const audioBuffer = await tts.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
                    await fetch(`${config.evolution_url}/message/sendWhatsAppAudio/${instanceName}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                        body: JSON.stringify({ number: phone, audio: base64, encoding: "base64" })
                    });
                } else {
                    await fetch(`${config.evolution_url}/message/sendText/${instanceName}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                        body: JSON.stringify({ number: phone, text: finalMessage })
                    });
                }
            } else {
                await fetch(`${config.evolution_url}/message/sendText/${instanceName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': config.evolution_apikey },
                    body: JSON.stringify({ number: phone, text: finalMessage })
                });
            }

            // Persistence
            await supabaseClient.from('chat_history').insert([
                { session_id: phone, message: { role: 'user', content: messageContent } },
                { session_id: phone, message: { role: 'assistant', content: finalMessage } }
            ]);
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (e: any) {
        console.error("AGENT FATAL ERROR:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
});
