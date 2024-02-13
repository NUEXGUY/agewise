const sendButton = document.querySelector('#sendButton');

chatSendButton.addEventListener('click', submitUserInput);

function submitUserInput(event) {
  event.preventDefault();
  const userInput = document.querySelector('#userInput');
  const userInputValue = userInput.value;
  const chatItemUser = document.createElement('div');
  chatItemUser.classList.add('chatItemUser');
  const chatTextUser = document.createElement('p');
  chatTextUser.classList.add('chatTextUser');
  chatTextUser.textContent = userInputValue;
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.insertAdjacentElement('afterbegin', chatItemUser);
  chatItemUser.appendChild(chatTextUser);
  sendButton.disabled = true;
  setTimeout(() => {
    sendButton.disabled = false;
  });
  userInput.value = '';
}

document.querySelector('#userInput').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    submitUserInput(event);
  }
});

function clearForm() {
  document.querySelector('#name').value = '';
  document.querySelector('#age').value = '';
  document.querySelector('#gender').value = '';
  document.querySelector('#email').value = '';
  document.querySelector('#phone').value = '';
  document.querySelector('#contactTime').value = '';
}

const modal = document.getElementById('modal');
const contactButton = document.querySelector('.contactButton');

// Disable form submission on Enter key when modal is open
modal.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.tagName === 'FORM') {
    event.preventDefault();
  }
});

// Toggle modal with overlay and disable/enable inputs
const toggleModal = () => {
  modal.classList.toggle('active'); // Use CSS class for styling
  const inputs = modal.querySelectorAll('input, select');
  inputs.forEach(input => input.disabled = modal.classList.contains('active'));
};

contactButton.addEventListener('click', toggleModal);

// Close modal on clicking outside or leaving page
const closeModal = () => {
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
  }
};

document.addEventListener('click', (event) => {
  if (!modal.contains(event.target)) {
    closeModal();
  }
});

document.addEventListener('mouseleave', closeModal); // Consider alternative trigger

// When user clicks #sendUserInfo create a new person object with collected information
const sendUserInfo = document.querySelector('#submitUserInfo');

sendUserInfo.addEventListener('click', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#name').value;
  const age = document.querySelector('#age').value;
  const gender = document.querySelector('#gender').value;
  const email = document.querySelector('#email').value;
  const phone = document.querySelector('#phone').value;
  const contactTime = document.querySelector('#contactTime').value;
  const person = { name, age, gender, email, phone, contactTime };

  try {
    const response = await fetch('/submit-user-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    });
    const data = await response.json();
    if (data.success) {
      console.log('User info submitted successfully');
      clearForm();
      toggleModal();
    } else {
      console.error('Error submitting user info');
    }
  } catch (error) {
    console.error('Error submitting user info:', error);
  }
});

// Function for submitting user form input (remains unchanged)
async function submitUserInput(event) {
  event.preventDefault();
  const name = document.querySelector('#name').value;
  const age = document.querySelector('#age').value;
  const gender = document.querySelector('#gender').value;
  const email = document.querySelector('#email').value;
  const phone = document.querySelector('#phone').value;
  const contactTime = document.querySelector('#contactTime').value;
  const person = { name, age, gender, email, phone, contactTime };

  try {
    const response = await fetch('/submit-user-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    });
    const data = await response.json();
    if (data.success) {
      console.log('User info submitted successfully');
      clearForm();
      toggleModal();
    } else {
      console.error('Error submitting user info');
    }
  } catch (error) {
    console.error('Error submitting user info:', error);
  }
}

// New function for submitting chat messages
async function submitChatMessage(event) {
  event.preventDefault();

  const userInput = document.querySelector('#userInput');
  const userInputValue = userInput.value;

  // Display user's message immediately
  addChatItem('User', userInputValue);

  try {
    const aiResponse = await sendChatMessage(userInputValue);

    // Ensure aiResponse is available before adding AI message
    await new Promise(resolve => setTimeout(resolve, 100)); // Optional delay for testing

    // Display AI's response with proper delay
    addChatItem('AI', aiResponse);
  } catch (error) {
    console.error('Error sending chat message:', error);
  }

  userInput.value = ''; // Reset the input field
}

// Renamed and refactored chat message sending function
async function sendChatMessage(message) {
  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.message; // Return the AI response
  } catch (error) {
    console.error('Error sending chat message:', error);
    return "Sorry, I couldn't process your message."; // Fallback message
  }
}

// Helper function for adding chat items to the UI
function addChatItem(sender, message) {
  const chatItem = document.createElement('div');
  chatItem.classList.add(sender === 'AI' ? 'chatItemAI' : 'chatItemUser');
  
  const chatText = document.createElement('p');
  chatText.classList.add(sender === 'AI' ? 'chatTextAI' : 'chatTextUser');
  chatText.textContent = message;
  
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.insertAdjacentElement('afterbegin', chatItem);
  chatItem.appendChild(chatText);
}