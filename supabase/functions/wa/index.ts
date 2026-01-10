import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    console.log(`[DEBUG] Received ${req.method} request at ${new Date().toISOString()}`);
    console.log("[DEBUG] Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));

    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        const rawBody = await req.text();
        console.log("[DEBUG] Raw Body:", rawBody);

        let body;
        try {
            body = JSON.parse(rawBody);
            console.log("[DEBUG] Parsed Body:", JSON.stringify(body));
        } catch (e) {
            console.error("[DEBUG] Failed to parse JSON body:", e, "Raw Content:", rawBody);
            return new Response(JSON.stringify({ error: "Invalid JSON", raw: rawBody }), { status: 400, headers: corsHeaders });
        }

        const instanceName = body.instance || 'Vlog';
        console.log("[DEBUG] Instance Name:", instanceName);

        const data = body.data;
        if (!data) {
            console.log("[DEBUG] No data field in body - ignoring.");
            return new Response(JSON.stringify({ success: true, message: "No data" }), { headers: corsHeaders });
        }

        // 1. IGNORE FROM ME
        if (data.key?.fromMe) {
            console.log("[DEBUG] Message from self - ignoring.");
            return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        const remoteJid = data.key?.remoteJid;
        const phone = remoteJid?.split('@')[0];
        const isGroup = remoteJid?.includes('@g.us');
        console.log(`[DEBUG] From: ${phone}, IsGroup: ${isGroup}`);

        // Fetch config
        const { data: config, error: configError } = await supabaseClient
            .from('whatsapp_configs')
            .select('*')
            .eq('instance_name', instanceName)
            .single();

        if (configError) {
            console.error(`[DEBUG] Config fetch error for ${instanceName}:`, JSON.stringify(configError));
        }

        if (!config) {
            console.error(`[DEBUG] Config NOT FOUND for ${instanceName}.`);
            // return new Response(JSON.stringify({ success: false, message: "Config not found" }), { headers: corsHeaders });
        }

        if (config && !config.active) {
            console.log(`[DEBUG] [${instanceName}] Instance marked as inactive in DB.`);
            // return new Response(JSON.stringify({ success: true, message: "Inactive" }), { headers: corsHeaders });
        }

        // Use a fallback config for debugging if database is empty/missing
        const safeConfig = config || {
            active: true,
            evolution_url: "https://api.vlogia.com.br",
            evolution_apikey: "b6ff2fcd3acabca05a948b13e08bad86",
            whitelist: [],
            behavior: { ignore_groups: true }
        };

        // Filters
        const ignoreGroups = safeConfig.behavior?.ignore_groups ?? true;
        if (isGroup && ignoreGroups) {
            console.log(`[DEBUG] BLOCKED: Group message from ${remoteJid}`);
            return new Response(JSON.stringify({ success: true, message: "Group ignored" }), { headers: corsHeaders });
        }

        const whitelist = config.whitelist || [];
        if (whitelist.length > 0 && !whitelist.includes(phone)) {
            console.log(`[DEBUG] BLOCKED: ${phone} not in whitelist. Allowed: ${JSON.stringify(whitelist)}`);
            return new Response(JSON.stringify({ success: true, message: "Not in whitelist" }), { headers: corsHeaders });
        }

        const pushName = data.pushName || 'Desconhecido';
        const messageContent = data.message?.conversation || data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || "";
        console.log(`[DEBUG] Content: "${messageContent}"`);

        if (!phone || (!messageContent && !data.message?.imageMessage)) {
            console.log("[DEBUG] No phone or content - ignoring.");
            return new Response(JSON.stringify({ success: true, message: "No content/phone" }), { headers: corsHeaders });
        }

        // history check (idempotency)
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
                console.log(`[DEBUG] DUPLICATE DETECTED: Ignoring repeat message from ${phone}`);
                return new Response(JSON.stringify({ success: true, message: "Duplicate" }), { headers: corsHeaders });
            }
        }

        // 4. CALL AI ASSISTANT
        console.log("[DEBUG] Fetching history...");
        const { data: history } = await supabaseClient
            .from('chat_history')
            .select('message')
            .eq('session_id', phone)
            .order('created_at', { ascending: true })
            .limit(20);

        const messages = (history || []).map(h => h.message);
        messages.push({ role: 'user', content: messageContent });

        console.log("[DEBUG] Calling AI Assistant (chat-assistant)...");
        const aiRes = await fetch(Deno.env.get('SUPABASE_URL') + "/functions/v1/chat-assistant", {
            method: 'POST',
            headers: { 'Authorization': "Bearer " + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, user_name: pushName, platform: 'whatsapp' })
        });

        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error(`[DEBUG] AI Assistant Error (${aiRes.status}):`, errorText);
            return new Response(JSON.stringify({ error: "AI Assistant failure" }), { status: 500, headers: corsHeaders });
        }

        const aiData = await aiRes.json();
        let finalMessage = aiData.content || "";
        console.log(`[DEBUG] AI Response (Length: ${finalMessage.length})`);

        // 5. HANDLE GALLERY MARKER
        if (finalMessage.includes("AUTO_SEND_GALLERY_MARKER")) {
            console.log("[DEBUG] Gallery marker detected.");
            const markerRegex = /AUTO_SEND_GALLERY_MARKER\[(.*?)\]/;
            const match = finalMessage.match(markerRegex);

            if (match && match[1]) {
                const packageName = match[1].trim();
                console.log(`[DEBUG] Extracted Package Name: "${packageName}"`);

                const { data: pkgData, error: pkgError } = await supabaseClient
                    .from('packages')
                    .select('images')
                    .ilike('title', `%${packageName}%`)
                    .limit(1);

                if (pkgError) console.error("[DEBUG] DB Fetch Error:", pkgError);

                if (pkgData && pkgData.length > 0 && pkgData[0].images && pkgData[0].images.length > 0) {
                    const images = pkgData[0].images;
                    console.log(`[DEBUG] Found ${images.length} images for "${packageName}". Sending...`);

                    for (const imgUrl of images) {
                        console.log(`[DEBUG] Sending image: ${imgUrl}`);
                        await fetch(`${config.evolution_url}/message/sendMedia/${instanceName}`, {
                            method: 'POST',
                            headers: { 'apikey': config.evolution_apikey, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                number: phone,
                                media: imgUrl,
                                mediatype: "image",
                                caption: ""
                            })
                        }).catch(e => console.error(`[DEBUG] Error sending media (${imgUrl}):`, e));
                        // Small delay between images
                        await new Promise(r => setTimeout(r, 1500));
                    }
                } else {
                    console.log(`[DEBUG] No images found for package: "${packageName}"`);
                }
            }
            // Remove the marker from the text
            finalMessage = finalMessage.replace(markerRegex, "").trim();
        }

        // 6. EXTRA SAFETY: Strip any markdown image links that the AI might have hallucinated
        const markdownImageRegex = /!\[.*?\]\(.*?\)/g;
        if (markdownImageRegex.test(finalMessage)) {
            console.log("[DEBUG] Stripping hallucinated markdown image links.");
            finalMessage = finalMessage.replace(markdownImageRegex, "").trim();
        }

        // Handle handover marker
        if (finalMessage.includes("AUTO_NOTIFY_HUMAN_MARKER")) {
            console.log("[DEBUG] Handover marker detected.");
            const parts = finalMessage.split("---");
            const leadSummary = parts[0].replace("AUTO_NOTIFY_HUMAN_MARKER", "").trim();
            finalMessage = parts[1]?.trim() || "Um consultor especialista entrará em contato em breve!";

            // Notify human
            const humanAgent = config.human_agent_phone || "5519981316733";
            console.log(`[DEBUG] Notifying human agent: ${humanAgent}`);
            await fetch(`${config.evolution_url}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: { 'apikey': config.evolution_apikey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: humanAgent,
                    options: { delay: 1200, presence: "composing" },
                    text: `🚀 *NOVO LEAD QUALIFICADO (WHATSAPP)*\n\n${leadSummary}\n\n👤 *Lead*: ${pushName} (${phone})`
                })
            }).catch(e => console.error("[DEBUG] Error notifying human:", e));
        }

        // 5. SEND TO WHATSAPP
        console.log(`[DEBUG] Sending reply to ${phone}...`);
        const messagePayload = {
            number: phone,
            options: { delay: 1200, presence: "composing" },
            text: finalMessage
        };

        const evolutionRes = await fetch(`${config.evolution_url}/message/sendText/${instanceName}`, {
            method: 'POST',
            headers: { 'apikey': config.evolution_apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
        });

        const evoData = await evolutionRes.json();
        console.log("[DEBUG] Evolution API Response:", JSON.stringify(evoData));

        // 6. SAVE TO HISTORY
        await supabaseClient.from('chat_history').insert([
            { session_id: phone, message: { role: 'user', content: messageContent } },
            { session_id: phone, message: { role: 'assistant', content: finalMessage } }
        ]);

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (error) {
        console.error("[DEBUG] GLOBAL CRITICAL ERROR:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});
