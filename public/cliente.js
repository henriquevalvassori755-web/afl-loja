document.addEventListener('DOMContentLoaded', function() {
    // Variáveis para rastrear filtros ativos
    let currentCategoria = null;
    let currentLoja = null;
    let currentSearchTerm = '';

    // Seletores para os elementos do HTML
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const categoryButtons = document.querySelectorAll('.category-filters .filter-btn');
    const storeButtons = document.querySelectorAll('.stores .filter-btn');
    const clearButton = document.getElementById('clear-filters');
    const formProduto = document.getElementById('cadastro-produto-form');

    // Função principal para carregar os produtos
    async function carregarProdutos() {
        if (!productsContainer) {
            console.error("Elemento products-container não encontrado.");
            return;
        }

        let url = '/api/produtos';
        const params = new URLSearchParams();

        // Adiciona os filtros ativos na URL
        if (currentCategoria && currentCategoria !== 'todos') {
            params.append('categoria', currentCategoria);
        }
        if (currentLoja) {
            params.append('loja', currentLoja);
        }
        if (currentSearchTerm) {
            params.append('termo', currentSearchTerm);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        console.log('URL da requisição:', url); // DEBUG
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao carregar produtos do servidor.');
            }

            const produtos = await response.json();
            
            console.log('Produtos recebidos:', produtos.length, 'itens'); // DEBUG
            
            productsContainer.innerHTML = '';

            if (!Array.isArray(produtos) || produtos.length === 0) {
                productsContainer.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
                return;
            }

            produtos.forEach(produto => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Nao+Disponivel'">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <strong>R$ ${parseFloat(produto.preco).toFixed(2)}</strong><br>
                    <a href="${produto.link}" target="_blank">Ver Produto!</a>
                `;
                productsContainer.appendChild(productCard);
            });
        } catch (error) {
            console.error('Erro ao carregar produtos:', error.message);
            productsContainer.innerHTML = `<p class="no-products">Ocorreu um erro ao carregar os produtos: ${error.message}</p>`;
        }
    }

    // --- LÓGICA DE EVENTOS ---
    
    // Filtros de Categoria
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentCategoria = this.dataset.categoria || null;
                carregarProdutos();
            });
        });
    }

    // Filtros de Loja
    if (storeButtons.length > 0) {
        storeButtons.forEach(button => {
            button.addEventListener('click', function() {
                storeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentLoja = this.dataset.loja || null;
                carregarProdutos();
            });
        });
    }

    // Botão de Busca
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            currentSearchTerm = searchInput.value.trim();
            carregarProdutos();
        });
    }

    // Busca por Enter no campo de texto
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentSearchTerm = searchInput.value.trim();
                carregarProdutos();
            }
        });
    }

    // Botão Limpar Filtros
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            currentCategoria = null;
            currentLoja = null;
            currentSearchTerm = '';
            
            if (searchInput) searchInput.value = '';
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            storeButtons.forEach(btn => btn.classList.remove('active'));
            
            console.log('Filtros limpos.'); // DEBUG
            carregarProdutos();
        });
    }

    // --- LÓGICA DO FORMULÁRIO DE CADASTRO ---
    
    async function cadastrarProduto(dados) {
        try {
            const response = await fetch('/api/cadastrar-produto', {
                method: 'POST',
                body: dados,
            });

            if (!response.ok) {
                let errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    errorText = errorData.error || 'Erro desconhecido.';
                } catch (e) {
                    console.error("A resposta não é JSON. Conteúdo:", errorText);
                    errorText = `Erro do servidor: ${response.status} ${response.statusText}. Por favor, verifique o console para mais detalhes.`;
                }
                throw new Error(errorText);
            }

            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            console.error('Erro no cadastro:', error.message);
            return { success: false, error: error.message };
        }
    }

    if (formProduto) {
        formProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formProduto);
            
            const submitBtn = formProduto.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
                submitBtn.disabled = true;
                const resultado = await cadastrarProduto(formData);
                if (resultado.success) {
                    alert('Produto cadastrado com sucesso!');
                    formProduto.reset();
                    carregarProdutos();
                } else {
                    alert(`Erro: ${resultado.error}`);
                }
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Carga inicial dos produtos ao carregar a página
    carregarProdutos();
});