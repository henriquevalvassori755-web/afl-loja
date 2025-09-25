// public/js/training-tips-app.js
document.addEventListener('DOMContentLoaded', async () => {
    const trainingTipsContentElement = document.getElementById('trainingTipsContent');
    const trainingTipsErrorMessageElement = document.getElementById('trainingTipsErrorMessage');

    async function fetchAndDisplayAllTrainingTips() { // Nome da função reflete que busca TUDO
        trainingTipsContentElement.innerHTML = '<p>Carregando dicas de treino...</p>';
        if (trainingTipsErrorMessageElement) {
            trainingTipsErrorMessageElement.style.display = 'none';
        }

        try {
            // *** CORREÇÃO 1: REMOVER O 'S' EXTRA AQUI! ***
            const response = await fetch('/.netlify/functions/get-training-tipss'); 

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    throw new Error("Nenhuma dica de treino encontrada no banco de dados.");
                }
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            // *** CORREÇÃO 2: ESPERAR UM ARRAY DE OBJETOS E ITERAR SOBRE ELES ***
            const allTips = await response.json(); 

            if (allTips && Array.isArray(allTips) && allTips.length > 0) {
                trainingTipsContentElement.innerHTML = ''; // Limpa a mensagem de carregamento
                
                allTips.forEach(tip => { // Itera sobre CADA dica no array
                    const tipItem = document.createElement('div');
                    tipItem.className = 'tip-item'; // Para estilização CSS
                    tipItem.innerHTML = `
                        <h2>${tip.titulo}</h2><br>
                        <p>${tip.conteudo.replace(/\n/g, '<br>')}</p><br>
                        <small>Publicado em: ${new Date(tip.data_geracao).toLocaleDateString('pt-BR')} às ${new Date(tip.data_geracao).toLocaleTimeString('pt-BR')}</small><br>
                        <hr> `;
                    trainingTipsContentElement.appendChild(tipItem);
                });
            } else {
                trainingTipsContentElement.innerHTML = '<p>Nenhuma dica de treino disponível no momento.</p><p>Por favor, volte mais tarde.</p>';
                if (trainingTipsErrorMessageElement) {
                    trainingTipsErrorMessageElement.textContent = 'Dados da dica de treino incompletos ou inexistentes.';
                    trainingTipsErrorMessageElement.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dicas de treino:', error);
            trainingTipsContentElement.innerHTML = `<p>Não foi possível carregar as dicas de treino no momento.</p>`;
            if (trainingTipsErrorMessageElement) {
                trainingTipsErrorMessageElement.textContent = `Erro: ${error.message}`;
                trainingTipsErrorMessageElement.style.display = 'block';
            }
        }
    }

    fetchAndDisplayAllTrainingTips(); // Chama a função ao carregar a página
});