document.addEventListener('DOMContentLoaded', async () => {
    const newsContainer = document.getElementById('news-container');
    const loadingMessage = document.getElementById('loading-message');

    // Função utilitária para criar e adicionar os cards de notícia
    function createNewsCard(newsItem) {
        const card = document.createElement('div');
        card.classList.add('news-card');

        const title = document.createElement('h3');
        title.textContent = newsItem.title;

        const description = document.createElement('p');
        description.textContent = newsItem.description;

        const link = document.createElement('a');
        link.href = newsItem.url;
        link.textContent = 'Leia mais';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const image = document.createElement('img');
        image.src = newsItem.image || 'placeholder.jpg'; // Adicionar uma imagem padrão se não houver
        image.alt = newsItem.title;
        image.classList.add('news-image');

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(link);
        return card;
    }

    // Função principal para buscar e exibir as notícias
    async function fetchNews() {
        if (!newsContainer) return;

        // Exibe a mensagem de carregamento
        loadingMessage.style.display = 'block';

        try {
            // **CORRIGIDO:** Alterado o caminho do fetch para o padrão do Vercel
            const response = await fetch('/api/get-news');

            if (!response.ok) {
                // Se a resposta não for OK, tenta ler o JSON de erro
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Erro HTTP: ${response.status} ao buscar notícias.`;
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Limpa o contêiner antes de adicionar as notícias
            newsContainer.innerHTML = '';

            // Se a busca retornar notícias, as exibe
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    const newsCard = createNewsCard(article);
                    newsContainer.appendChild(newsCard);
                });
            } else {
                // Se o array de artigos estiver vazio, exibe uma mensagem
                newsContainer.innerHTML = '<p class="error-message">Nenhuma notícia encontrada no momento. Tente novamente mais tarde.</p>';
            }

        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            // Se ocorrer um erro, exibe uma mensagem de erro na tela
            newsContainer.innerHTML = `<p class="error-message">Ops! Erro ao carregar as notícias: ${error.message}.</p>`;
        } finally {
            // Oculta a mensagem de carregamento ao final da operação
            loadingMessage.style.display = 'none';
        }
    }

    fetchNews();
});