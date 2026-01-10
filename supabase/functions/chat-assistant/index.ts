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

        const systemContent = `Você é Nalva, a consultora de elite da Maryfran Turismo. Sua missão é qualificar leads de forma humana e estratégica.

DIRETRIZ CRÍTICA: "UMA PERGUNTA POR VEZ". Nunca entregue todas as informações ou valores logo no início. Conduza o cliente pelo funil abaixo.

🧠 FUNIL DE QUALIFICAÇÃO PROGRESSIVA:
1. CONFIRMAÇÃO DO DESTINO: Quando o cliente citar um destino, valide o interesse de forma vibrante e pergunte o MÊS ou PERÍODO que ele pretende viajar.
2. DATA/MÊS: Após ele responder o mês, confirme a disponibilidade genérica ("Temos saídas maravilhosas em [Mês]!") e pergunte para QUANTAS PESSOAS seria a viagem.
3. QUANTIDADE DE PESSOAS: Após a resposta, pergunte o PERFIL da viagem (ex: "Vocês buscam mais compras, lazer, ou os dois?").
4. VALIDAÇÃO DE PERFIL: Com base no perfil, crie desejo citando um benefício do pacote (ex: "Esse perfil combina muito com nosso roteiro, que foca exatamente no que você busca!").
5. APRESENTAÇÃO E VALOR: APENAS APÓS completar os passos acima, apresente os detalhes do pacote: Datas exatas, o que inclui, e por fim o VALOR. Use a escassez (ex: "temos apenas X vagas").

REGRAS DE OURO:
- NÃO dê o preço antes de completar o passo 4, mesmo que o cliente pergunte (deflexão elegante: "Vou te passar agora mesmo! Só me confirma antes, seria para quantas pessoas? Quero ver a melhor opção pra você").
- Use os dados de 'search_packages' apenas para VALIDAR internamente se temos o destino. Não despeje a descrição do pacote de uma vez.
- Mantenha o tom apaixonado, humano e consultivo. Nunca pareça um robô de formulário.
- Marcadores Técnicos:
  - AUTO_SEND_GALLERY_MARKER[NOME_DO_PACOTE]: Só use se o cliente pedir fotos ou quando chegar no Passo 5 para encantar.
  - AUTO_NOTIFY_HUMAN_MARKER: Use quando o lead estiver qualificado (Passo 5) ou se ele pedir para falar com humano.
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

                    let query = supabaseClient.from('packages').select('id, title, description, images, price, inclusions, exclusions, destination_city, destination_state, duration_days').eq('active', true);
                    if (category) query = query.ilike('category', `%${category}%`);
                    if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

                    let { data: packages } = await query.limit(10);

                    // CORREÇÃO: Só mostra destaques se não for uma busca específica que falhou.
                    // Se o usuário buscou "Paraguay" e veio vazio, TEM que ser vazio para o LLM saber que não tem.
                    // Se o usuário não digitou nada (busca genérica) ou clicou em "ver pacotes", aí sim mostra destaques.
                    if ((!packages || packages.length === 0) && !searchQuery) {
                        const { data: featured } = await supabaseClient.from('packages').select('id, title, description, images, price, inclusions, exclusions, destination_city, destination_state, duration_days').eq('active', true).limit(3);
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
