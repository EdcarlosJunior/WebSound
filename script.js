// ====== SELECIONA ELEMENTOS DO DOM ====== //
const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const favoritesDiv = document.getElementById('favorites');
const player = document.getElementById('player');
const audioPlayer = document.getElementById('audioPlayer');
const trackInfo = document.getElementById('trackInfo');
const closePlayer = document.getElementById('closePlayer');

// ====== FAVORITOS (CARREGADOS DO LOCALSTORAGE) ====== //
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// ====== SALVAR FAVORITOS NO LOCALSTORAGE ====== //
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

    card.innerHTML = `
      <img src="${track.artworkUrl100.replace('100x100bb', '200x200bb')}" alt="${track.trackName}">
      <h4>${track.trackName}</h4>
      <p>${track.artistName}</p>
      <button class="play-btn">▶️ Preview</button>
      <button class="remove-btn">❌ Remover</button>
    `;

    // Evento para tocar a música
    card.querySelector('.play-btn').addEventListener('click', () => playTrack(track));

    // Evento para remover dos favoritos
    card.querySelector('.remove-btn').addEventListener('click', () => removeFavorite(track.trackId));

    favoritesDiv.appendChild(card);
  });
}

// ====== ADICIONA OU REMOVE UM FAVORITO ====== //
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

// ====== REMOVE FAVORITO PELO ID ====== //
function removeFavorite(trackId) {
  favorites = favorites.filter(f => f.trackId !== trackId);
  saveFavorites();
  renderFavorites();
}

// ====== RENDERIZA OS RESULTADOS DE BUSCA ====== //
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

    // Evento para tocar música
    card.querySelector('.play-btn').addEventListener('click', () => playTrack(track));

    // Evento para adicionar/remover dos favoritos
    card.querySelector('.favorite-btn').addEventListener('click', () => {
      toggleFavorite(track);
      renderResults(tracks); // Atualiza os ícones no grid
    });

    resultsDiv.appendChild(card);
  });
}

// ====== FUNÇÃO PARA TOCAR UMA MÚSICA ====== //
function playTrack(track) {
  trackInfo.textContent = `${track.trackName} - ${track.artistName}`;
  audioPlayer.src = track.previewUrl;
  audioPlayer.play();
  player.classList.remove('hidden');
}

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
    player.style.bottom = 'auto'; // remove fixo
    player.style.right = 'auto';
  }
});

// ====== EVENTO PARA FECHAR O PLAYER ====== //
closePlayer.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.src = '';
  player.classList.add('hidden');
});

// ====== EVENTO DE SUBMISSÃO DO FORMULÁRIO ====== //
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

// ====== INICIALIZA FAVORITOS AO CARREGAR A PÁGINA ====== //
renderFavorites();
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  input.value = ''; // limpa campo
  
  document.getElementById('clearFavorites').addEventListener('click', () => {
  if (confirm('Deseja realmente apagar todos os favoritos?')) {
    favorites = [];
    saveFavorites();
    renderFavorites();
  }
});

const rockTracks = data.results.filter(t => t.primaryGenreName === 'Rock');


});




