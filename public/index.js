const chatSendButton = document.querySelector('#chatSendButton');

chatSendButton.addEventListener('click', submitChatMessage);

function clearForm() {
  document.querySelector('#name').value = '';
  document.querySelector('#age').value = '';
  document.querySelector('#gender').value = '';
  document.querySelector('#email').value = '';
  document.querySelector('#phone').value = '';
  document.querySelector('#contactTime').value = '';
}

const modal = document.querySelector('#modal');
const contactButton = document.querySelector('#contactButton');


// Toggle modal with overlay and disable/enable inputs
const toggleModal = () => {
  modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
  const inputs = modal.querySelectorAll('input, select');
  inputs.forEach(input => input.disabled = modal.style.display === 'none');
};

contactButton.addEventListener('click', toggleModal);
document.addEventListener('click', (event) => {
  const modalElement = document.querySelector('#modal');
  if (!modalElement.contains(event.target) && modalIsOpen) {
    // Do nothing, prevent closing due to outside click
  }
});

let modalIsOpen = false;

window.addEventListener('blur', () => {
  if (!modalIsOpen) {
    modalIsOpen = true;
    toggleModal();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (!modalIsOpen) {
      modalIsOpen = true;
      toggleModal();
    }
  } else {
  }
});

document.querySelector('#cancelUserInfo').addEventListener('click', () => {
  modalIsOpen = false;
  toggleModal();
});

const closeModal = () => {
  modalIsOpen = false;
  toggleModal();
}

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
      closeModal();
    } else {
      console.error('Error submitting user info');
    }
  } catch (error) {
    console.error('Error submitting user info:', error);
  }
});

// Using keydown for better compatibility
const chatInput = document.querySelector('#chatInput');

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target === chatInput) {
    event.preventDefault();
    submitChatMessage(chatInput.value);
    chatInput.value = '';
  }
});

// Function for submitting chat messages
async function submitChatMessage() {
  const chatInput = document.querySelector('#chatInput');
  const chatInputValue = chatInput.value;

  // Check for first request and display initial message if present
  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      body: JSON.stringify({ message: chatInputValue }),
    });
    const data = await response.json();

    // Check if the received message has a "system" role
    if (data.message.startsWith('You are a helpful assistant.')) {
      addChatItem('AI', data.message);
    } else {
      addChatItem('User', chatInputValue);

      const aiResponse = data.message;
      await new Promise(resolve => setTimeout(resolve, 100));
      addChatItem('AI', aiResponse);
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
  }

  chatInput.value = '';
}

// Chat message send function
async function sendChatMessage(message) {
  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error sending chat message:', error);
    return "Sorry, I couldn't process your message.";
  }
}

function addChatItem(sender, message) {
  const chatItem = document.createElement('div');
  chatItem.classList.add(sender === 'AI' ? 'chatItemBot' : 'chatItemUser');
  
  const chatText = document.createElement('p');
  chatText.classList.add(sender === 'AI' ? 'chatTextBot' : 'chatTextUser');
  chatText.textContent = message;
  
  const chatContainer = document.querySelector('#chatContainer');
  const lastChatItem = chatContainer.lastElementChild;

  if (lastChatItem) {
    // Insert new item after the last existing chat item
    chatContainer.insertBefore(chatItem, lastChatItem.nextSibling);
  } else {
    // Append to container if no existing items
    chatContainer.appendChild(chatItem);
  }
  chatItem.appendChild(chatText);
}

async function fetchInitialMessage() {
    const response = await fetch('/chat-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialMessage: true })
    });
    const data = await response.json();
    return data.message;
}

function displayInitialMessage(message) {
  addChatItem("AI", message);
}

document.addEventListener("load", async () => {
  const message = await fetchInitialMessage();
  displayInitialMessage(message);
});

document.addEventListener('DOMContentLoaded', async function() {
  const initialMessageResponse = await fetch('/trigger-initial-message', {
    method: 'POST'
  });

  if (initialMessageResponse.ok) {
    // Initial message triggered successfully
    const message = await fetchInitialMessage();
    displayInitialMessage(message);
  } else {
    // Handle error case (e.g., failed to trigger initial message)
    console.error('Error triggering initial message:', initialMessageResponse.statusText);
  }
});

function createInitialMessage(message) {
  const chatItem = document.createElement('div');
  chatItem.classList.add('chatItemBot');

  const chatText = document.createElement('p');
  chatText.classList.add('chatTextBot');
  chatText.textContent = message;

  const chatContainer = document.querySelector('#chatContainer');
  chatContainer.appendChild(chatItem);
  chatItem.appendChild(chatText);
}

window.onload = function() {
  const initialMessage = "Feel free to ask me any question about your pain or discomfort. What's been bothering you lately?";
  createInitialMessage(initialMessage);
};
