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

        const systemContent = `Você é Sofia, a inteligência da Maryfran Turismo. Você é uma consultora de elite fundamentada em DADOS.

REGRAS DE OURO (SISTEMÁTICAS):
1. TRAVA DE DADOS ABSOLUTA: Você é proibida de falar sobre destinos que não retornarem na ferramenta 'search_packages'. Se o cliente pedir algo inexistente (ex: Portugal), diga que não temos esse pacote ativo no sistema Maryfran e peça para anotar o desejo para um consultor.
2. MEMÓRIA E CONTEXTO: Você tem acesso às últimas 20 mensagens. Use isso para mostrar que está prestando atenção: "Como você mencionou que vai viajar com 4 pessoas...".
3. PROATIVIDADE VISUAL: Ao citar um destino em *Negrito*, pergunte imediatamente se ele quer ver o portfólio completo de fotos.
4. GATILHO DE ÁLBUM: Se ele disser sim, use o marcador AUTO_SEND_GALLERY_MARKER.
5. QUALIFICAÇÃO "PONTE DE OURO": SÓ chame o consultor humano (ferramenta 'request_human_assistance') quando tiver: 1) Destino, 2) Data/Mês, 3) Qtd de Pessoas, 4) Perfil. 
6. ZERO LISTAS: Use apenas parágrafos fluidos e humanos.

Sua missão é encantar com o inventário real da Maryfran e qualificar o lead com perfeição técnica.`;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'system', content: systemContent }, ...messages],
                tools,
                tool_choice: "auto",
                temperature: 0.7,
            }),
        });

        let aiData = await response.json();
        let message = aiData.choices[0].message;

        if (message.tool_calls) {
            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === "search_packages") {
                    const args = JSON.parse(toolCall.function.arguments);
                    const keywords = args.query.split(' ').filter((k: string) => k.length >= 2);

                    let query = supabaseClient.from('packages').select('title, description').eq('active', true);
                    if (keywords.length > 0) {
                        const filter = keywords.map((k: string) => "title.ilike.%" + k + "%,description.ilike.%" + k + "%").join(',');
                        query = query.or(filter);
                    }

                    let { data: packages } = await query.limit(10);

                    // FALLBACK: If search returns nothing, return featured active packages
                    if (!packages || packages.length === 0) {
                        const { data: featured } = await supabaseClient.from('packages').select('title, description').eq('active', true).limit(5);
                        packages = featured;
                    }

                    const content = packages?.length
                        ? JSON.stringify(packages)
                        : "Nenhum pacote no sistema. Avise que criamos roteiros sob medida.";

                    const secondResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o',
                            messages: [{ role: 'system', content: systemContent }, ...messages, message, { tool_call_id: toolCall.id, role: "tool", name: "search_packages", content }]
                        }),
                    });
                    const secondData = await secondResp.json();
                    message = secondData.choices[0].message;
                }
                else if (toolCall.function.name === "request_human_assistance") {
                    // SECOND INTELLIGENCE: Lead Specialist Summarizer
                    const summarizerResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Você é um Analista de Leads de Elite da Maryfran Turismo. Seu único trabalho é extrair os 4 pontos de qualificação da conversa e formatar em texto para o consultor.
                                    ESTRUTURA OBRIGATÓRIA:
                                    📍 *Destino*: [Nome do Destino]
                                    📅 *Data/Mês*: [Mês ou Data]
                                    👥 *Adultos/Crianças*: [Qtd total de pessoas]
                                    ✨ *Perfil da Viagem*: [Casal, Família, Aventura, etc]`
                                },
                                ...messages,
                                { role: 'user', content: 'Crie agora o resumo estruturado deste lead para o consultor humano.' }
                            ],
                        }),
                    });
                    const summarizerData = await summarizerResp.json();
                    const perfectSummary = summarizerData.choices[0].message.content;

                    const secondResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [{ role: 'system', content: systemContent }, ...messages, message, { tool_call_id: toolCall.id, role: "tool", name: "request_human_assistance", content: "OK" }]
                        }),
                    });
                    const secondData = await secondResp.json();
                    message = secondData.choices[0].message;
                    message.content = "AUTO_NOTIFY_HUMAN_MARKER\n" + perfectSummary + "\n---\n" + message.content;
                }
            }
        }

        return new Response(JSON.stringify(message), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ content: "Erro: " + error.message }), { headers: corsHeaders });
    }
});
