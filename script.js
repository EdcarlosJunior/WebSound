// ====== SELECIONA ELEMENTOS DO DOM ====== //
const form = document.getElementById('searchForm');
const input = document.getElementById('buscador');
const resultsDiv = document.getElementById('results');
const favoritesDiv = document.getElementById('favorites');
const player = document.getElementById('player');
const audioPlayer = document.getElementById('audioPlayer');
const trackInfo = document.getElementById('trackInfo');
const closePlayer = document.getElementById('closePlayer');

// ====== FAVORITOS (CARREGADOS DO LOCALSTORAGE) ====== //
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// ====== RENDERIZA OS FAVORITOS NA TELA ====== //
function renderFavorites() {
  favoritesDiv.innerHTML = '';

  if (favorites.length === 0) {
    favoritesDiv.innerHTML = '<p>Nenhuma música favoritada ainda.</p>';
    return;
  }

  favorites.forEach(track => {
    const card = document.createElement('div');
    card.className = 'card favorite';

    // A estrutura abaixo permite que os botões fiquem lado a lado com seu novo CSS
    card.innerHTML = `
      <img src="${track.artworkUrl100.replace('100x100bb', '200x200bb')}" alt="${track.trackName}">
      <h4>${track.trackName}</h4>
      <p>${track.artistName}</p>
      <div class="card-buttons">
        <button class="play-btn">▶️ Preview</button>
        <button class="remove-btn">❌ Remover</button>
      </div>
    `;

    card.querySelector('.play-btn').addEventListener('click', () => playTrack(track));
    card.querySelector('.remove-btn').addEventListener('click', () => removeFavorite(track.trackId));
    favoritesDiv.appendChild(card);
  });
}

function toggleFavorite(track) {
  const exists = favorites.find(f => f.trackId === track.trackId);
  if (exists) {
    favorites = favorites.filter(f => f.trackId !== track.trackId);
  } else {
    favorites.push(track);
  }
  saveFavorites();
  renderFavorites();
}

function removeFavorite(trackId) {
  favorites = favorites.filter(f => f.trackId !== trackId);
  saveFavorites();
  renderFavorites();
}

function renderResults(tracks) {
  resultsDiv.innerHTML = '';
  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'card';
    const isFavorite = favorites.some(f => f.trackId === track.trackId);

    card.innerHTML = `
      <img src="${track.artworkUrl100.replace('100x100bb', '200x200bb')}" alt="${track.trackName}">
      <h4>${track.trackName}</h4>
      <p>${track.artistName}</p>
      <button class="play-btn">▶️ Preview</button>
      <button class="favorite-btn">${isFavorite ? '★ Favorito' : '☆ Favoritar'}</button>
    `;

    card.querySelector('.play-btn').addEventListener('click', () => playTrack(track));
    card.querySelector('.favorite-btn').addEventListener('click', () => {
      toggleFavorite(track);
      renderResults(tracks);
    });
    resultsDiv.appendChild(card);
  });
}

function playTrack(track) {
  trackInfo.textContent = `${track.trackName} - ${track.artistName}`;
  audioPlayer.src = track.previewUrl;
  audioPlayer.play();
  player.classList.remove('hidden');
}

// ====== EVENTO PARA FECHAR O PLAYER ====== //
closePlayer.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.src = '';
  player.classList.add('hidden');
});

// ====== EVENTO PARA LIMPAR TODOS OS FAVORITOS ====== //
// Movido para fora para funcionar independente da busca
document.getElementById('clearFavorites').addEventListener('click', () => {
  if (confirm('Deseja realmente apagar todos os favoritos?')) {
    favorites = [];
    saveFavorites();
    renderFavorites();
  }
});

// ====== EVENTO DE BUSCA ====== //
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = '<p>Carregando...</p>';
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=15`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length === 0) {
      resultsDiv.innerHTML = '<p>Nenhum resultado encontrado.</p>';
      return;
    }
    renderResults(data.results);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red;">Erro ao buscar músicas: ${err.message}</p>`;
  }
});

// ====== PLAYER ARRASTÁVEL ====== //
let isDragging = false;
let offsetX, offsetY;

player.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});

document.addEventListener('mouseup', () => isDragging = false);

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    player.style.left = `${e.clientX - offsetX}px`;
    player.style.top = `${e.clientY - offsetY}px`;
    player.style.bottom = 'auto';
    player.style.right = 'auto';
  }
});

// Inicialização ao carregar
renderFavorites();