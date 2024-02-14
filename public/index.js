const chatSendButton = document.querySelector('#inputBar #chatSendButton');

chatSendButton.addEventListener('click', () => {
  sendChatMessage();
  chatInput.value = '';
});

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
    sendChatMessage(chatInput.value);
    chatInput.value = '';
  }
});

chatInput.addEventListener('input', () => {
  if (chatInput.value.trim() === '') {
    chatSendButton.disabled = true;
  } else {
    chatSendButton.disabled = false;
  }
});

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && chatInput.value.trim() === '') {
    event.preventDefault();
  }
});

// Send message to OpenAI
async function sendChatMessage(message, isUser) {
  if (isUser) {
    addChatItem('User', message);
  }

  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();

    await new Promise(resolve => setTimeout(resolve, 100));

    addChatItem('AI', data.message);
  } catch (error) {
    console.error('Error sending chat message:', error);
    addChatItem('AI', "Sorry, I couldn't process your message.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const initialBotMessage = "Welcome to the chat!";
  setTimeout(() => {
    addChatItem('AI', initialBotMessage);
    console.log("initialBotMessage:", initialBotMessage);
  }, 1000);
});

function addChatItem(sender, message) {
  console.log("sender:", sender, "message:", message);
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
