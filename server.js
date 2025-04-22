const http = require('http');
const fs = require('fs');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer((req, res) => {
  let filePath = './public' + (req.url === '/' ? '/index.html' : req.url);
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const io = socketio(server);
const port = 3000;

let qaMap = {};
let adminSocket = null;

io.on('connection', (socket) => {
  socket.join(socket.id);
  console.log(`Socket connected: ${socket.id}`);

  socket.on('registerAsAdmin', () => {
    adminSocket = socket;
    console.log('Admin registered');
  });

  socket.on('userMessage', (msg) => {
    const input = msg.toLowerCase().trim();

    const autoReplies = [
      { pattern: /\b(hello|hi|hey)\b/i, reply: "Hello! How can I help you?" },
      { pattern: /\byour name\b/i, reply: "I'm your friendly chatbot!" },
      { pattern: /\bhelp\b/i, reply: "Sure! I can assist with basic questions or route you to the admin." },
      { pattern: /\b(bye|goodbye|see you)\b/i, reply: "Goodbye! Have a great day!" },
      { pattern: /\b(price|cost|charges?)\b/i, reply: "Our pricing varies based on service. Please visit our pricing page!" },
      { pattern: /\b(working hours|opening time|office hours|timings?)\b/i, reply: "We’re available Monday to Friday, 9am–6pm." }
    ];

    const matchedAuto = autoReplies.find(rule => rule.pattern.test(input));

    if (matchedAuto) {
      socket.emit('botReply', matchedAuto.reply);
      return;
    }

    if (qaMap[input]) {
      socket.emit('botReply', qaMap[input]);
    } else {
      if (adminSocket) {
        adminSocket.emit('adminNotify', {
          question: input,
          userId: socket.id
        });
        socket.emit('botReply', "🔄 Waiting for admin to reply...");
      } else {
        socket.emit('botReply', "🤔 I don't know the answer and admin is offline.");
      }
    }
  });


//   const audio1 = new Audio('https://digitalhubsolution.com/front/images/livechat-sound.mp3');
// let soundEnabled1 = false;

// document.addEventListener('click', () => {
//   audio1.play().then(() => {
//     audio1.pause();
//     audio1.currentTime = 0;
//     soundEnabled1 = true;
//     console.log('Audio unlocked');
//   });
// }, { once: true }); // unlocks only on the first interaction




  socket.on('adminResponse', ({ answer, userId, question }) => {
   
    
    qaMap[question] = answer;
    io.to(userId).emit('botReply', `🧑‍💼 Admin: ${answer}`);
    
  });

  socket.on('disconnect', () => {
    if (socket === adminSocket) {
      adminSocket = null;
      console.log('Admin disconnected');
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
