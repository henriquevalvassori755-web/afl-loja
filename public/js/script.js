document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('.video-item video');
    videos.forEach(video => {
        // Adiciona um botão de som ao lado do vídeo
        const soundToggleButton = document.createElement('button');
        soundToggleButton.innerHTML = '🔊'; // Ícone de som
        soundToggleButton.classList.add('sound-toggle-button');
        video.parentNode.appendChild(soundToggleButton); // Adiciona o botão como irmão do vídeo

        // Estado inicial do botão
        if (video.muted) {
            soundToggleButton.innerHTML = '🔇';
        } else {
            soundToggleButton.innerHTML = '🔊';
        }

        soundToggleButton.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                soundToggleButton.innerHTML = '🔇';
            } else {
                soundToggleButton.innerHTML = '🔊';
                // Tenta dar play se não estiver tocando
                if (video.paused) {
                    video.play().catch(error => {
                        console.log('Autoplay com som bloqueado pelo navegador após clique:', error);
                        // Pode exibir uma mensagem ao usuário se o autoplay ainda falhar
                    });
                }
            }
        });

        // Opcional: Adicionar um listener para quando o vídeo for pausado ou tocado
        video.addEventListener('play', () => {
            if (!video.muted) {
                soundToggleButton.innerHTML = '🔊';
            }
        });
        video.addEventListener('pause', () => {
            if (!video.muted) {
                soundToggleButton.innerHTML = '🔊'; // Ainda mostrando som se foi ativado
            }
        });
    });
});