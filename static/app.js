const socket = io();

const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const errorEl = document.getElementById('error');

createBtn.addEventListener('click', () => {
  const name = prompt('Твоё имя:') || 'Гость';
  localStorage.setItem('myName', name);
  socket.emit('create_room');
});

joinBtn.addEventListener('click', () => {
  const code = codeInput.value.trim().toUpperCase();
  if (code.length !== 6) {
    errorEl.textContent = 'Код должен быть 6 символов';
    return;
  }
  const name = prompt('Твоё имя:') || 'Гость';
  localStorage.setItem('myName', name);
  socket.emit('join', { code, name });
});

codeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

socket.on('room_created', ({ code }) => {
  window.location.href = `/room?code=${code}`;
});

socket.on('joined', ({ code }) => {
  window.location.href = `/room?code=${code}`;
});

socket.on('join_error', ({ message }) => {
  errorEl.textContent = message;
});