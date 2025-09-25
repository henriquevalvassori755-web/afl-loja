document.addEventListener('DOMContentLoaded', async () => {
    const fraseMotivadoraElement = document.getElementById('fraseMotivadora');
    const trainingTipsElement = document.getElementById('trainingTipsContent');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const videosGallery = document.getElementById('videosGallery');

    async function fetchData(url, elementType) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessageText = errorData.error || `Erro HTTP: ${response.status} ao buscar o recurso.`;
                throw new Error(errorMessageText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Erro ao buscar dados de ${url}:`, error);
            if (elementType) {
                elementType.textContent = `Ops! Erro ao carregar. Recarregue a página.`;
            }
            if (errorMessage) {
                errorMessage.textContent = `Detalhe do erro: ${error.message}`;
                errorMessage.style.display = 'block';
            }
            throw error;
        }
    }

    async function fetchMotivationPhrase() {
        if (!fraseMotivadoraElement) return;
        fraseMotivadoraElement.textContent = 'Carregando sua frase...';
        if (loadingMessage) loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';

        try {
            // **CORRIGIDO:** O caminho agora é /api/
            const data = await fetchData('/api/get-motivation', fraseMotivadoraElement);
            if (data && data.phrase) {
                fraseMotivadoraElement.textContent = data.phrase;
            } else {
                throw new Error('Formato de dados da frase inesperado.');
            }
        } catch (error) {
            // O erro já foi tratado em fetchData()
        } finally {
            if (loadingMessage) loadingMessage.style.display = 'none';
        }
    }

    async function fetchTrainingTips() {
        if (!trainingTipsElement) return;
        trainingTipsElement.textContent = 'Carregando dicas de treino...';
        try {
            // **CORRIGIDO:** O caminho agora é /api/
            const data = await fetchData('/api/get-training-tips', trainingTipsElement);
            if (data && data.tips) {
                trainingTipsElement.textContent = data.tips;
            } else {
                throw new Error('Formato de dados das dicas inesperado.');
            }
        } catch (error) {
            // O erro já foi tratado em fetchData()
        }
    }
    
    async function fetchYouTubeVideos() {
        if (!videosGallery) return;
        videosGallery.innerHTML = '<p class="loading-videos">Carregando Vídeos...</p>';
        try {
            // **CORRIGIDO:** O caminho agora é /api/
            const data = await fetchData('/api/get-youtube-videos', videosGallery);
            videosGallery.innerHTML = '';
            if (data && data.regularVideos && data.regularVideos.length > 0) {
                data.regularVideos.forEach(video => createVideoEmbed(video, videosGallery));
            } else {
                videosGallery.innerHTML = '<p>Nenhum vídeo longo encontrado no momento. Volte mais tarde!</p>';
            }
        } catch (error) {
            // O erro já foi tratado em fetchData()
        }
    }

    function createVideoEmbed(video, containerElement) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container', 'aspect-ratio-16x9');
        const iframe = document.createElement('iframe');
        iframe.setAttribute('width', '560');
        iframe.setAttribute('height', '315');
        iframe.setAttribute('src', `https://www.youtube.com/embed/${video.id}?rel=0`);
        iframe.setAttribute('title', video.title || 'Vídeo do YouTube');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        videoContainer.appendChild(iframe);
        containerElement.appendChild(videoContainer);
    }

    fetchMotivationPhrase();
    fetchTrainingTips();
    fetchYouTubeVideos();
});
