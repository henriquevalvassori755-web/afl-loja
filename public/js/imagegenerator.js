// public/js/imagegenerator.js

// URL da sua Netlify Function. Certifique-se de que o nome do arquivo corresponde ao da função.
/*const FUNCTION_URL = '/.netlify/functions/generate-vertex-image'; 

const promptInput = document.getElementById('promptInput');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');
const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const generatedImage = document.getElementById('generatedImage');

generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    const aspectRatio = aspectRatioSelect.value; // Obtém o valor selecionado da proporção

    if (!prompt) {
        errorMessage.textContent = 'Por favor, digite uma descrição para a imagem.';
        return;
    }

    // Limpa mensagens anteriores
    errorMessage.textContent = '';
    generatedImage.style.display = 'none';
    generatedImage.src = '';
    imagePlaceholder.style.display = 'block';
    imagePlaceholder.textContent = 'Gerando imagem, por favor aguarde...';
    generateBtn.disabled = true;
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, aspectRatio }), // Envia o prompt e a proporção
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na geração da imagem.');
        }

        const data = await response.json();

        if (data.imageUrl) {
            generatedImage.src = data.imageUrl;
            generatedImage.style.display = 'block';
            imagePlaceholder.style.display = 'none';
        } else {
            errorMessage.textContent = 'Nenhuma URL de imagem foi retornada.';
        }

    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        errorMessage.textContent = `Erro: ${error.message}`;
        imagePlaceholder.textContent = 'A imagem gerada aparecerá aqui.';
        imagePlaceholder.style.display = 'block';
    } finally {
        generateBtn.disabled = false;
        loadingSpinner.style.display = 'none';
    }
});*/