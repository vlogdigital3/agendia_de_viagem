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

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) return new Response(JSON.stringify({ content: "ERRO: OPENAI_API_KEY" }), { headers: corsHeaders });

        const body = await req.json();
        const { messages, user_name } = body;

        const tools = [
            {
                type: "function",
                function: {
                    name: "search_packages",
                    description: "Busca pacotes na Maryfran Turismo.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string" }
                        }
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "request_human_assistance",
                    description: "Passa para consultor humano.",
                    parameters: {
                        type: "object",
                        properties: {
                            reason: { type: "string" },
                            user_details: { type: "string" }
                        },
                        required: ["reason", "user_details"]
                    }
                }
            }
        ];

        const personaPrompt = user_name
            ? "Seu nome é Sofia, a consultora mais apaixonada da Maryfran Turismo. Você fala com " + user_name + ". Use o nome dele(a) com carinho e entusiasmo!"
            : "Seu nome é Sofia, a consultora mais apaixonada da Maryfran Turismo. Seja extremamente vibrante e acolhedora!";

        const systemContent = "Você é Sofia, a alma vendedora e persuasiva da Maryfran Turismo.\n\n" +
            personaPrompt + "\n\n" +
            "MISSÃO: Fazer o cliente se apaixonar! Use linguagem emocional e descritiva. \n" +
            "EXEMPLO: Em vez de 'tem praia', diga 'Imagine você mergulhando em águas mornas e cristalinas, um verdadeiro paraíso particular!'.\n\n" +
            "REGRAS DE FORMATAÇÃO (CRÍTICO):\n" +
            "1. PROIBIDO HEADERS: Nunca use ### ou qualquer cabeçalho markdown. Fica horrível no WhatsApp.\n" +
            "2. PROIBIDO LISTAS: Nunca use listas numeradas (1, 2, 3) ou com traços (-). \n" +
            "3. USE EMOJIS E NEGRITO: Para organizar informações, use EMOJIS como marcadores (📍, ✨, 🌴, 💎) e *negrito* para títulos.\n" +
            "4. MÍDIA: Mencione que você está enviando fotos e vídeos incríveis para ele(a) ver.\n\n" +
            "DIRETRIZES DE VENDA:\n" +
            "- LEALDADE: Só fale da Maryfran. Nunca sugira outros sites ou destinos fora do catálogo.\n" +
            "- CHAMADA PARA AÇÃO (CTA): Sempre termine com uma pergunta poderosa para fechar ou avançar (ex: 'Topa realizar esse sonho hoje?', 'Posso garantir essa vaga pra você agora?').\n" +
            "- FLUXO: Se não achar no catálogo, use o transbordo humano pedindo Data/Pessoas.";

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: systemContent }, ...messages],
                tools,
                tool_choice: "auto",
                temperature: 0.8, // Slightly higher for more creative/passionate language
            }),
        });

        let aiData = await response.json();
        let message = aiData.choices[0].message;

        if (message.tool_calls) {
            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === "search_packages") {
                    const args = JSON.parse(toolCall.function.arguments);
                    const keywords = args.query.split(' ').filter((k: string) => k.length > 2);

                    let query = supabaseClient.from('packages').select('title, description, price').eq('active', true);
                    if (keywords.length > 0) {
                        const filter = keywords.map((k: string) => "title.ilike.%" + k + "%,description.ilike.%" + k + "%").join(',');
                        query = query.or(filter);
                    }

                    const { data: packages } = await query.limit(3);
                    const content = packages?.length ? JSON.stringify(packages) : "Nenhum pacote encontrado. Explique que a Maryfran faz roteiros sob medida e colete dados para o consultor.";

                    const secondResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [...messages, message, { tool_call_id: toolCall.id, role: "tool", name: "search_packages", content }]
                        }),
                    });
                    const secondData = await secondResp.json();
                    message = secondData.choices[0].message;
                }
                else if (toolCall.function.name === "request_human_assistance") {
                    const secondResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [...messages, message, { tool_call_id: toolCall.id, role: "tool", name: "request_human_assistance", content: "OK" }]
                        }),
                    });
                    const secondData = await secondResp.json();
                    message = secondData.choices[0].message;
                    message.content = "AUTO_NOTIFY_HUMAN_MARKER\n" + message.content;
                }
            }
        }

        return new Response(JSON.stringify(message), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ content: "Erro: " + error.message }), { headers: corsHeaders });
    }
});
