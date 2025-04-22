const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('message');
const messages = document.getElementById('messages');
const isAdmin = window.location.pathname.includes('admin');
 
if (isAdmin) {
  socket.emit('registerAsAdmin');
  appendMessage("🛠️ You are logged in as Admin", 'system');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(`You: ${msg}`, 'user');
  socket.emit('userMessage', msg);
  input.value = '';
});

socket.on('botReply', (msg) => {
  appendMessage(`Bot: ${msg}`, 'bot');
});

 


const audio = new Audio('https://digitalhubsolution.com/front/images/livechat-sound.mp3');
let soundEnabled = false;

document.addEventListener('click', () => {
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
    soundEnabled = true;
    console.log('Audio unlocked');
  });
}, { once: true }); // unlocks only on the first interaction


socket.on('adminNotify', ({ question, userId }) => {
  audio.play();
  const div = document.createElement('div');
  div.className = 'admin-question';
  div.innerHTML = `
    <p><strong>User:</strong> ${question}</p>
    <input type="text" placeholder="Type reply..." data-user="${userId}" data-question="${question}" />
    <button onclick="sendAdminReply(this)">Reply</button>
  `;
  messages.appendChild(div);
  
});

function appendMessage(text, type) {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = type;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function sendAdminReply(button) {
  const input = button.previousElementSibling;
  const answer = input.value.trim();
  const userId = input.dataset.user;
  const question = input.dataset.question;

  if (answer) {

    socket.emit('adminResponse', { answer, userId, question });
    appendMessage(`Replied to user: ${answer}`, 'admin');
    input.disabled = true;
    button.disabled = true;
  }
}
