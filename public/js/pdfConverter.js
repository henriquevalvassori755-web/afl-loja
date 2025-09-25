// public/js/pdfConverter.js

// public/js/pdfConverter.js
import { getDocument } from './lib/pdfjs/build/pdf.mjs'; 
pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/lib/pdfjs/build/pdf.worker.mjs'; 
document.addEventListener('DOMContentLoaded', () => {
    const pdfInput = document.getElementById('pdfInput');
    const viewPdfBtn = document.getElementById('viewPdfBtn');
    const pdfViewer = document.getElementById('pdfViewer');
    const extractedImage = document.getElementById('extractedImage');
    const downloadPdfImageLink = document.getElementById('downloadPdfImageLink');

    viewPdfBtn.addEventListener('click', async () => {
        const file = pdfInput.files[0];
        if (!file) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        pdfViewer.innerHTML = '<p>Carregando PDF...</p>';
        extractedImage.style.display = 'none';
        downloadPdfImageLink.style.display = 'none';

        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);

            try {
                const pdf = await getDocument({ data: typedarray }).promise;
                pdfViewer.innerHTML = ''; // Limpa a mensagem de carregamento

                // Extrai a primeira página como imagem
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 }); // Aumenta a escala para melhor qualidade

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                extractedImage.src = canvas.toDataURL('image/png');
                extractedImage.style.display = 'block';

                downloadPdfImageLink.href = extractedImage.src;
                downloadPdfImageLink.download = 'pagina_1_do_pdf.png';
                downloadPdfImageLink.textContent = 'Baixar 1ª Página como PNG';
                downloadPdfImageLink.style.display = 'inline-block';

            } catch (error) {
                console.error('Erro ao processar PDF:', error);
                pdfViewer.innerHTML = `<p style="color: red;">Erro ao carregar ou processar PDF: ${error.message}</p>`;
            }
        };
        fileReader.readAsArrayBuffer(file);
    });
});
