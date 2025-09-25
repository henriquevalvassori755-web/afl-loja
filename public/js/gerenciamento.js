// Arquivo: js/gerenciamento.js

const cadastrarBtn = document.getElementById('cadastrarBtn');
const editarBtn = document.getElementById('editarBtn');
const excluirBtn = document.getElementById('excluirBtn');
let produtoEmEdicaoId = null;

// --- Função auxiliar para converter imagem em Base64 ---
const converterImagemParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// --- Função para Cadastrar Produto ---
cadastrarBtn.addEventListener('click', async () => {
    const imagemInput = document.getElementById('imagem');
    const imagemFile = imagemInput.files[0];

    if (!imagemFile) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    try {
        const base64Image = await converterImagemParaBase64(imagemFile);

        const produto = {
            nome: document.getElementById('nome').value,
            classificacao: document.getElementById('classificacao').value,
            link: document.getElementById('link').value,
            preco: document.getElementById('preco').value,
            base64Image: base64Image
        };

        const response = await fetch('/.netlify/functions/produto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto),
        });
        const data = await response.json();
        console.log('Produto cadastrado:', data);
        alert('Produto cadastrado com sucesso!');
        limparFormulario();
        recarregarVitrine();
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        alert('Erro ao cadastrar produto.');
    }
});

// --- Função para Editar Produto ---
editarBtn.addEventListener('click', async () => {
    if (produtoEmEdicaoId) {
        const imagemInput = document.getElementById('imagem');
        const imagemFile = imagemInput.files[0];
        let base64Image = null;

        if (imagemFile) { // Se uma nova imagem foi selecionada
            base64Image = await converterImagemParaBase64(imagemFile);
        }

        const produtoAtualizado = {
            nome: document.getElementById('nome').value,
            classificacao: document.getElementById('classificacao').value,
            link: document.getElementById('link').value,
            preco: document.getElementById('preco').value,
            base64Image: base64Image // Envia a nova imagem ou null se não houver
        };

        try {
            const response = await fetch(`/.netlify/functions/produto/${produtoEmEdicaoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produtoAtualizado),
            });
            const data = await response.json();
            console.log('Produto editado:', data);
            alert('Produto editado com sucesso!');
            limparFormulario();
            recarregarVitrine();
        } catch (error) {
            console.error('Erro ao editar produto:', error);
            alert('Erro ao editar produto.');
        }
    }
});

// --- Função para Excluir Produto (sem alteração) ---
excluirBtn.addEventListener('click', async () => {
    if (produtoEmEdicaoId) {
        try {
            const response = await fetch(`/.netlify/functions/produto/${produtoEmEdicaoId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Produto excluído:', produtoEmEdicaoId);
                alert('Produto excluído com sucesso!');
                limparFormulario();
                recarregarVitrine();
            } else {
                throw new Error('Falha ao excluir produto.');
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir produto.');
        }
    }
});

function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('classificacao').value = 'eletronicos';
    document.getElementById('link').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('imagem').value = ''; // Limpa o campo de upload
    
    cadastrarBtn.style.display = 'block';
    editarBtn.style.display = 'none';
    excluirBtn.style.display = 'none';
    produtoEmEdicaoId = null;
}

// --- Nova função para recarregar a vitrine ---
function recarregarVitrine() {
    // Envia uma mensagem para a janela da vitrine recarregar os dados
    if (window.parent) {
        window.parent.postMessage('recarregar', '*');
    }
}