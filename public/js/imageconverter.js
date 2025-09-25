// js/imageConverter.js

// 1. Definição da função de inicialização do Conversor de Imagens
// Esta função encapsula toda a lógica de configuração do conversor (event listeners, etc.).
function initializeImageConverter() {
    console.log('Image Converter: Inicializando funcionalidade...');

    const imageInput = document.getElementById('imageInput');
    const imageFormatSelect = document.getElementById('imageFormat');
    const convertImageBtn = document.getElementById('convertImageBtn');
    const outputImage = document.getElementById('outputImage');
    const downloadLink = document.getElementById('downloadLink');

    // **IMPORTANTE:** Verificar se os elementos existem antes de adicionar listeners.
    // Isso é crucial para evitar erros se algum elemento não for encontrado.
    if (!imageInput || !imageFormatSelect || !convertImageBtn || !outputImage || !downloadLink) {
        console.warn('Image Converter: Nem todos os elementos HTML necessários foram encontrados no DOM. ' +
                     'A funcionalidade do conversor pode não ser ativada corretamente. ' +
                     'Certifique-se de que todos os IDs no HTML correspondem aos usados no JavaScript.');
        return; // Sai da função se os elementos não forem encontrados
    }

    // Adiciona o listener de clique ao botão de conversão
    convertImageBtn.addEventListener('click', () => {
        const file = imageInput.files[0];
        if (!file) {
            alert('Por favor, selecione uma imagem para converter.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const format = imageFormatSelect.value;
                let mimeType;
                switch (format) {
                    case 'png':
                        mimeType = 'image/png';
                        break;
                    case 'jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    default:
                        mimeType = 'image/png'; // Padrão
                }

                // Verifica se o browser suporta o formato WebP antes de tentar converter para ele
                // Isso é importante para navegadores mais antigos
                if (format === 'webp' && !canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
                    alert('Seu navegador não suporta o formato WebP para conversão.');
                    return;
                }

                const imageDataUrl = canvas.toDataURL(mimeType);
                outputImage.src = imageDataUrl;
                outputImage.style.display = 'block'; // Mostra a imagem de saída
                
                downloadLink.href = imageDataUrl;
                downloadLink.download = `converted_image.${format}`;
                downloadLink.textContent = `Baixar como ${format.toUpperCase()}`;
                downloadLink.style.display = 'inline-block'; // Mostra o link de download
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}


// 2. Chamar a função de inicialização do conversor assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Apenas chame a função principal de inicialização do conversor.
    // A seção do conversor no HTML deve estar visível por padrão (sem 'display: none').
    initializeImageConverter();

    // Opcional: Para o rodapé, se você quiser atualizar o ano dinamicamente.
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});