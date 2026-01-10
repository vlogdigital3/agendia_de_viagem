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
        const { messages, user_name, platform = 'whatsapp' } = body;

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
            ? "Seu nome é Nalva, a consultora mais apaixonada da Maryfran Turismo. Você fala com " + user_name + ". Use o nome dele(a) com carinho e entusiasmo!"
            : "Seu nome é Nalva, a consultora mais apaixonada da Maryfran Turismo. Seja extremamente vibrante e acolhedora!";

        const systemContent = `Você é Nalva, a inteligência da Maryfran Turismo. Você é uma consultora de elite fundamentada em DADOS.
        
SUA PERSONALIDADE: Elegante, vibrante, técnica e apaixonada por viagens. Você não é apenas um bot, você é uma especialista.

REGRAS DE OURO (SISTEMÁTICAS):
1. TRAVA DE DADOS ABSOLUTA: Proibido falar de destinos não encontrados em 'search_packages'. Se não existir, avise que não temos no sistema ativo e peça para o consultor criar um roteiro sob medida.
2. VERIFICAÇÃO DE MÍDIA: O resultado de 'search_packages' contém o campo 'images'. SE esse campo tiver URLs, você TEM fotos reais. Nunca diga que não tem se os dados mostrarem o contrário.
3. PIVOTAGEM DE CONVERSA (CRÍTICO): Se o usuário citar um novo destino ou interesse, ESQUEÇA o destino anterior imediatamente. O foco é sempre o ÚLTIMO lugar pesquisado ou mencionado. Não tente "vender" Noronha se ele pediu Paris.
4. PROATIVIDADE VISUAL: Ao citar um destino em *Negrito*, PERGUNTE se quer ver o álbum de fotos/vídeos. Se o usuário mudar de destino e pedir fotos, envie o marcador do NOVO destino.
5. GATILHO DE ÁLBUM: Se o cliente quiser ver imagens ou portfólio de um pacote que você encontrou, você DEVE incluir o marcador exatamente assim: AUTO_SEND_GALLERY_MARKER[NOME_DO_PACOTE]. Use o nome exato do pacote dentro dos colchetes.
6. PROIBIÇÃO DE LINKS: NUNCA envie links diretos (URLs) de imagens ou markdown de imagens (![...](...)) no corpo da mensagem. O envio de fotos é feito EXCLUSIVAMENTE pelo marcador GATILHO DE ÁLBUM. Se você listar links no texto, você quebra a experiência do usuário.
7. QUALIFICAÇÃO "PONTE DE OURO": SÓ chame o humano (request_human_assistance) após ter: 1) Destino, 2) Data/Mês, 3) Qtd de Pessoas, 4) Perfil.
8. ZERO LISTAS: Use parágrafos fluidos.

FUNIL DE CONVERSÃO (${platform}):
- Após apresentar opções de pacotes, você DEVE ser incisiva e perguntar: "Qual destes destinos mais te encantou?" ou já avançar para a próxima pergunta da qualificação (Data, Pessoas ou Perfil). NÃO repita os pacotes se o cliente já demonstrou interesse em um específico. Se ele clicar em 'Explorar', confirme os detalhes e peça a próxima informação (ex: data da viagem).

Sua missão é encantar com o inventário real da Maryfran e qualificar o lead com perfeição.
`;
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
        let foundPackages: any[] = [];
        let perfectSummary = '';

        if (message.tool_calls) {
            const toolHistory = [{ role: 'system', content: systemContent }, ...messages, message];
            const toolCalls = message.tool_calls;

            for (const toolCall of toolCalls) {
                if (toolCall.function.name === "search_packages") {
                    const { query: searchQuery, category } = JSON.parse(toolCall.function.arguments);
                    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

                    let query = supabaseClient.from('packages').select('id, title, description, images, price').eq('active', true);
                    if (category) query = query.ilike('category', `%${category}%`);
                    if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

                    let { data: packages } = await query.limit(10);
                    if (!packages || packages.length === 0) {
                        const { data: featured } = await supabaseClient.from('packages').select('id, title, description, images, price').eq('active', true).limit(3);
                        packages = featured;
                    }

                    if (platform === 'web' && packages) {
                        foundPackages = packages;
                    }

                    toolHistory.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: "search_packages",
                        content: packages?.length ? JSON.stringify(packages) : "Nenhum pacote encontrado."
                    });
                }
                else if (toolCall.function.name === "request_human_assistance") {
                    const summarizerResp = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Você é um Analista de Leads de Elite da Maryfran Turismo. Seu único trabalho é extrair os 4 pontos de qualificação da conversa e formatar em texto para o consultor.
                                    📍 *Destino*: [Nome do destino MAIS RECENTE que o cliente demonstrou interesse. Ignore destinos anteriores.]
                                    📅 *Data/Mês*: [Mês ou Data]
                                    👥 *Adultos/Crianças*: [Qtd total]
                                    ✨ *Perfil da Viagem*: [Casal, Família, Aventura, etc]`
                                },
                                ...messages,
                                { role: 'user', content: 'Crie agora o resumo estruturado deste lead.' }
                            ],
                        }),
                    });
                    const summarizerData = await summarizerResp.json();
                    perfectSummary = summarizerData.choices[0].message.content;

                    toolHistory.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: "request_human_assistance",
                        content: "OK"
                    });
                }
            }

            // After all tools are processed, get final completion
            const secondResp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': "Bearer " + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: toolHistory
                }),
            });
            const secondData = await secondResp.json();
            message = secondData.choices[0].message;

            if (perfectSummary) {
                message.content = "AUTO_NOTIFY_HUMAN_MARKER\n" + perfectSummary + "\n---\n" + message.content;
            }
        }

        return new Response(JSON.stringify({
            content: message.content,
            packages: foundPackages.length > 0 ? foundPackages : undefined
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ content: "Erro: " + error.message }), { headers: corsHeaders });
    }
});
