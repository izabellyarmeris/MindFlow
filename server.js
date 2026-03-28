const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// SUA CHAVE VALIDADA
const API_KEY = "AIzaSyDzoBDylgPx_3URZ2ipHu5hbrW3cMfTFYs";
const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/process', async (req, res) => {
    try {
        const { text, readingLevel, focusSupport } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // AGORA ELAS ESTÃO ATIVAS: Configuração para não bloquear palavras sensíveis
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        const prompt = `
            Você é o MindFlow, assistente para pessoas neurodiversas.
            Simplifique de forma calma: "${text}"
            Nível de leitura: ${readingLevel} | Suporte: ${focusSupport}
            
            REGRAS: 
            1. Responda APENAS com código HTML puro.
            2. Use a estrutura <div class="task"><h4>Título</h4><p>Conteúdo</p></div>.
            3. Sem blocos markdown (não escreva \`\`\`html).
            4. Se 'focusSupport' for 'pomodoro', inclua uma task sugerindo 5 minutos de pausa.
        `;

        // Passando a configuração de segurança junto com o texto
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            safetySettings,
        });

        const response = await result.response;
        let htmlOutput = response.text();
        
        // Limpa formatação caso a IA ainda tente mandar markdown
        htmlOutput = htmlOutput.replace(/```html/gi, '').replace(/```/g, '').trim();

        res.json({ html: htmlOutput });
        
    } catch (error) {
        console.error("\n=== ERRO NO GEMINI ===");
        console.error(error.message);
        console.error("======================\n");
        res.status(500).json({ error: 'Falha na comunicação com a IA.' });
    }
});

app.listen(port, () => {
    console.log(`\n🚀 MINDFLOW PRONTO PARA O HACKATHON!`);
    console.log(`🧠 Rodando com o motor Gemini 2.5 Flash`);
    console.log(`🔗 Acesse: http://localhost:${port}\n`);
});