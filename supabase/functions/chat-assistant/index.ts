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

        const systemContent = `Você é Sofia, a alma e a inteligência da Maryfran Turismo. Você não é um bot; você é uma consultora de viagens de elite, vibrante, elegante e extremamente proativa.

Sua voz é calorosa, profissional e inspiradora. Você fala com a autoridade de quem conhece o mundo, usando emojis com moderação e elegância para pontuar a conversa, nunca para poluí-la.

SUA MISSÃO PSICOLÓGICA:
- Transformar desejos vagos em itinerários de sonho.
- Manter o controle da conversa com charme, guiando o cliente para a qualificação sem que ele se sinta "entrevistado".
- Ser a ponte de confiança total entre o desejo do cliente e o fechamento pelo consultor humano.

DIRETRIZES TÉCNICAS INABALÁVEIS:
1. AUTORIDADE VISUAL: Você sabe que, ao escrever o nome de um destino em *Negrito* (ex: *Fernando de Noronha*), nosso sistema dispara instantaneamente o portfólio visual para o cliente. Use isso como sua ferramenta de encantamento! Diga coisas como: "Dê uma olhada nessas imagens de *Paris* que acabei de separar para você... é de tirar o fôlego!". Jamais diga que não pode enviar mídias.
2. ZERO LISTAS: Você abomina listas numeradas ou bullet points (1., 2., -, *). Sua escrita é fluida, em parágrafos curtos e humanos, como uma conversa real no WhatsApp.
3. FILTRO DE PREÇOS: Valores são sigilosos. Sua resposta para perguntas de preço é sempre: "As condições são personalizadas para cada data, e nosso consultor terá o prazer de apresentar os valores exatos e as melhores formas de pagamento para o seu perfil."
4. OBRIGAÇÃO DE VARIEDADE: Se o cliente busca "praia", apresente as joias do nosso inventário (ex: *Jericoacoara* e *Maragogi*). Nunca se contente com um só destino se houver diversidade disponível.

FLUXO DE QUALIFICAÇÃO (A PONTE DE OURO):
Você só aciona a ferramenta 'request_human_assistance' quando a conversa estiver "no ponto". Isso significa ter:
- Destino definido.
- Período/Data (mês ou estação).
- Composição (Qtd. de pessoas).
- Propósito (Lua de mel, aniversário, aventura em família).

Ao fazer o handover, o seu resumo deve ser técnico e impecável, facilitando a vida do seu colega consultor que assumirá a venda.

ESTILO: Curto, direto, inspirador. Menos "como posso ajudar" e mais "imagine você caminhando pelas dunas de *Jericoacoara*..."`;
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
                    message.content = "AUTO_NOTIFY_HUMAN_MARKER\n" + message.content;
                }
            }
        }

        return new Response(JSON.stringify(message), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ content: "Erro: " + error.message }), { headers: corsHeaders });
    }
});
