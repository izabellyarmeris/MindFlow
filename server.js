require('dotenv').config(); // <-- ESSA LINHA PUXA A CHAVE ESCONDIDA
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// PEGANDO A CHAVE DO ARQUIVO .ENV (SEGURO PARA O GITHUB)
const API_KEY = process.env.GEMINI_API_KEY;

// Trava de segurança: se a chave não estiver no .env, o servidor avisa antes de quebrar
if (!API_KEY) {
    console.error("\n🚨 ERRO CRÍTICO: Chave da API não encontrada!");
    console.error("Verifique se o arquivo .env existe na sua pasta e contém a linha:");
    console.error("GEMINI_API_KEY=sua_nova_chave_aqui\n");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/process', async (req, res) => {
    try {
        const { text, readingLevel, focusSupport } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    console.log(`🔒 Modo Seguro: Chave oculta no .env`);
    console.log(`🧠 Rodando com o motor Gemini 2.5 Flash`);
    console.log(`🔗 Acesse: http://localhost:${port}\n`);
});