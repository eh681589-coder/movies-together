const socket = io();
const code = window.ROOM_CODE;
const myName = window.MY_NAME;

const codeBtn = document.getElementById('codeBtn');
codeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(code);
  alert('Код скопирован: ' + code);
});

socket.emit('join', { code, name: myName });

const grid = document.getElementById('moviesGrid');

function createMovieCard(m) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  const imgHTML = m.poster
    ? `<img class="movie-poster" src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.replaceWith(createFallback())">`
    : '';
  card.innerHTML = `${imgHTML}<div class="title">${m.title}</div><div class="year">${m.year}</div>`;
  card.addEventListener('click', () => {
    socket.emit('select_movie', { code, movie: m });
  });
  return card;
}

function createFallback() {
  const div = document.createElement('div');
  div.className = 'movie-fallback';
  div.textContent = '🎬';
  return div;
}

const fragment = document.createDocumentFragment();
movies.forEach(m => fragment.appendChild(createMovieCard(m)));
grid.appendChild(fragment);

const playerArea = document.getElementById('playerArea');

socket.on('movie_update', (movie) => {
  if (!movie) return;
  playerArea.classList.remove('empty');
  playerArea.innerHTML = `
    <div style="text-align:center;padding:30px;width:100%;">
      <div style="font-size:56px;margin-bottom:16px;">🎬</div>
      <h2 style="font-size:24px;margin-bottom:8px;">${movie.title}</h2>
      <p style="color:var(--text-muted);font-size:14px;">${movie.year}</p>
      <p style="color:var(--text-muted);font-size:13px;margin-top:20px;">Здесь будет плеер 🎥</p>
    </div>
  `;
});

const chatBox = document.getElementById('chatBox');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addMessage(m) {
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="msg-head">
      <span class="name">${escapeHTML(m.name)}</span>
    </div>
    <span class="msg-text">${escapeHTML(m.text)}</span>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on('message', addMessage);
socket.on('messages_history', (msgs) => {
  chatBox.innerHTML = '';
  msgs.forEach(addMessage);
});

sendBtn.addEventListener('click', () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('send_message', { code, name: myName, text });
  msgInput.value = '';
});

msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});