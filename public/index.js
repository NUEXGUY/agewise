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
async function submitChatMessage(event) {
  const chatInput = document.querySelector('#chatInput');
  const chatInputValue = chatInput.value;
  addChatItem('User', chatInputValue);

  try {
    const aiResponse = await sendChatMessage(chatInputValue);
    await new Promise(resolve => setTimeout(resolve, 100));
    addChatItem('AI', aiResponse);
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

// Helper function for adding chat items to the UI
function addChatItem(sender, message) {
  const chatItem = document.createElement('div');
  chatItem.classList.add(sender === 'AI' ? 'chatItemBot' : 'chatItemUser');
  
  const chatText = document.createElement('p');
  chatText.classList.add(sender === 'AI' ? 'chatTextBot' : 'chatTextUser');
  chatText.textContent = message;
  
  const chatContainer = document.querySelector('#chatContainer');
  chatContainer.insertAdjacentElement('afterbegin', chatItem);
  chatItem.appendChild(chatText);
}