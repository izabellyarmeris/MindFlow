document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById('processButton');
    const userInput = document.getElementById('userInput');
    const outputArea = document.getElementById('outputArea');
    const simplifiedContent = document.getElementById('simplifiedContent');
    
    const readingLevelSelect = document.getElementById('readingLevel');
    const focusSupportSelect = document.getElementById('focusSupport');

    processButton.addEventListener('click', async () => {
        const text = userInput.value.trim();
        if (text === "") {
            alert("Por favor, insira um texto para ser processado.");
            return;
        }

        outputArea.style.display = 'block';
        simplifiedContent.innerHTML = '<p>Processando sua solicitação com calma e cuidado...</p>';

        try {
            // Envia os dados para o nosso back-end
            const response = await fetch('/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    readingLevel: readingLevelSelect.value,
                    focusSupport: focusSupportSelect.value,
                }),
            });

            // VERIFICAÇÃO CRUCIAL: Checa se a resposta do servidor foi bem-sucedida (status 200-299)
            if (!response.ok) {
                // Se não foi, lê a mensagem de erro enviada pelo servidor
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ocorreu um erro no servidor.');
            }

            const data = await response.json();
            simplifiedContent.innerHTML = data.html; // Agora, isso só executa se a resposta for um sucesso
        } catch (error) {
            simplifiedContent.innerHTML = '<p style="color: red;">Desculpe, não foi possível conectar ao assistente. Tente novamente mais tarde.</p>';
            console.error('Erro ao conectar com o servidor:', error);
        }
    });
});