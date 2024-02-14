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
  if (modal.style.visibility === 'hidden' || modal.style.visibility === '') {
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    const inputs = modal.querySelectorAll('input, select');
    inputs.forEach(input => input.disabled = false);
  } else {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    const inputs = modal.querySelectorAll('input, select');
    inputs.forEach(input => input.disabled = true);
  }
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

  // Add SVG animation to the chatInput
  chatInput.insertAdjacentHTML('afterend', `<svg width="120" height="20" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#FFFFFF">
      <animate attributeName="r" from="15" to="15"
               begin="0s" dur="0.8s"
               values="15;9;15" calcMode="linear"
               repeatCount="indefinite" />
      <animate attributeName="fill-opacity" from="1" to="1"
               begin="0s" dur="0.8s"
               values="1;.5;1" calcMode="linear"
               repeatCount="indefinite" />
    </circle>
    <circle cx="60" cy="15" r="9" fill-opacity="0.3" fill="#FFFFFF">
      <animate attributeName="r" from="9" to="9"
               begin="0s" dur="0.8s"
               values="9;15;9" calcMode="linear"
               repeatCount="indefinite" />
      <animate attributeName="fill-opacity" from="0.5" to="0.5"
               begin="0s" dur="0.8s"
               values=".5;1;.5" calcMode="linear"
               repeatCount="indefinite" />
    </circle>
    <circle cx="105" cy="15" r="15" fill="#FFFFFF">
      <animate attributeName="r" from="15" to="15"
               begin="0s" dur="0.8s"
               values="15;9;15" calcMode="linear"
               repeatCount="indefinite" />
      <animate attributeName="fill-opacity" from="1" to="1"
               begin="0s" dur="0.8s"
               values="1;.5;1" calcMode="linear"
               repeatCount="indefinite" />
    </circle>
  </svg>`);

  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();

    // Replace SVG animation with the original placeholder text
    chatInput.placeholder = 'Enter your question here...';
    document.querySelector('svg').remove();

    addChatItem('AI', data.message);
  } catch (error) {
    console.error('Error sending chat message:', error);
    addChatItem('AI', "Sorry, I couldn't process your message.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const initialBotMessage = "Feeling lost in the fog of chronic pain? You're not alone. Ask your question here and get insights tailored to your experience. Remember, AgeWise isn't a doctor, but we can help you understand your pain better.";
  setTimeout(() => {
    addChatItem('AI', initialBotMessage);
  }, 1000);
});

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

let mouseLeaveEnabled = true;

document.addEventListener('mouseleave', () => {
  if (mouseLeaveEnabled) {
    mouseLeaveEnabled = false;
    setTimeout(() => {
      mouseLeaveEnabled = true;
    }, 3 * 60 * 1000);
    toggleModal();
  }
});

chatInput.addEventListener('focus', function() {
  chatInput.placeholder = 'Type your message...';
});

chatInput.addEventListener('blur', function() {
  chatInput.placeholder = 'Start typing here...';
});