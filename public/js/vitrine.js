// Arquivo: js/vitrine.js

// Escuta por mensagens da página pai (gerenciamento.html) para recarregar a vitrine
window.addEventListener('message', event => {
    // Verifique a origem da mensagem para segurança (opcional, mas recomendado)
    if (event.origin !== window.location.origin) {
        return;
    }
    
    if (event.data === 'recarregar') {
        carregarProdutos();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();

    const filtroSelect = document.getElementById('filtro');
    if (filtroSelect) {
        filtroSelect.addEventListener('change', (e) => {
            const classificacao = e.target.value;
            carregarProdutos(classificacao);
        });
    }
});

async function carregarProdutos(classificacao = 'todos') {
    try {
        let url = '/.netlify/functions/produto';
        if (classificacao !== 'todos') {
            url += `?classificacao=${classificacao}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro na requisição da API');
        }
        const produtos = await response.json();
        renderizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Não foi possível carregar os produtos.');
        const vitrine = document.getElementById('vitrine');
        if (vitrine) {
            vitrine.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
        }
    }
}

function renderizarProdutos(produtos) {
    const vitrine = document.getElementById('vitrine');
    if (!vitrine) return;

    vitrine.innerHTML = ''; // Limpa a vitrine antes de renderizar

    if (produtos.length === 0) {
        vitrine.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('card-produto');
        card.innerHTML = `
            <img type="image/jpg" src="${produto.imagem_url}" alt="${produto.nome}"/>
            <h3>${produto.nome}</h3>
            <p class="preco">R$ ${produto.preco}</p>
            <span class="tag-classificacao">${produto.classificacao}</span>
            <a href="${produto.link}" target="_blank" class="btn-link">Ir para o link</a>
        `;
        vitrine.appendChild(card);
    });
}