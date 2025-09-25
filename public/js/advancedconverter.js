

document.addEventListener('DOMContentLoaded', () => {
    const advancedInput = document.getElementById('advancedInput');
    const advancedFormatSelect = document.getElementById('advancedFormat');
    const convertAdvancedBtn = document.getElementById('convertAdvancedBtn');
    const advancedOutput = document.getElementById('advancedOutput');

    convertAdvancedBtn.addEventListener('click', async () => {
        const file = advancedInput.files[0];
        if (!file) {
            alert('Por favor, selecione um arquivo.');
            return;
        }

        
        advancedOutput.innerHTML = '<p>Enviando para conversão...</p>';

        try {
            
            const response = await fetch('/.netlify/functions/convertFile', { // Exemplo de sua própria Netlify Function
                method: 'POST',
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    targetFormat: advancedFormatSelect.value,
                  
                    fileContent: await new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result.split(',')[1]); // Base64 content
                        reader.readAsDataURL(file);
                    })
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro na conversão avançada.');
            }

            const result = await response.json();
            if (result.downloadUrl) {
                advancedOutput.innerHTML = `<p>Conversão concluída!</p><a href="${result.downloadUrl}" download="${result.fileName}">Baixar ${result.fileName}</a>`;
            } else {
                advancedOutput.innerHTML = `<p>Erro: URL de download não recebida.</p>`;
            }

        } catch (error) {
            console.error('Erro na conversão avançada:', error);
            advancedOutput.innerHTML = `<p style="color: red;">Erro na conversão: ${error.message}</p>`;
        }
    });
});
