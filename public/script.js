function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;
  
    displayMessage(userInput, 'user');
    getBotResponse(userInput.toLowerCase());
  
    document.getElementById("userInput").value = "";
  }
  
  function displayMessage(message, sender) {
    const chatbox = document.getElementById("chatbox");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender);
    msgDiv.textContent = message;
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  
  // Store unknown question
  let lastUnknownQuestion = null;
  
  function getBotResponse(input) {
    const storedAnswers = JSON.parse(localStorage.getItem("customBotAnswers")) || {};
  
    let response;
  
    // Check predefined answers
    if (input.includes("hello") || input.includes("hi")) {
      response = "Hello! How can I help you?";
    } else if (input.includes("your name")) {
      response = "I'm your friendly chatbot!";
    } else if (input.includes("help")) {
      response = "Sure, I can help! Ask me something simple.";
    } else if (input.includes("bye")) {
      response = "Goodbye! Have a great day!";
    }
    // Check if user had trained the bot earlier
    else if (storedAnswers[input]) {
      response = storedAnswers[input];
    }
    // Unknown input — ask user to teach
    else if (!lastUnknownQuestion) {
      lastUnknownQuestion = input;
      response = `I don't know how to respond to that. What should I reply when someone says "${input}"?`;
    }
    // User provides a reply — store it
    else {
      storedAnswers[lastUnknownQuestion] = input;
      localStorage.setItem("customBotAnswers", JSON.stringify(storedAnswers));
      response = `Got it! I'll remember that for next time. ✅`;
      lastUnknownQuestion = null;
    }
  
    // Show bot message after delay
    setTimeout(() => {
      displayMessage(response, 'bot');
    }, 600);
  }
  