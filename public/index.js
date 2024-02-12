const sendButton = document.querySelector('#sendButton');

sendButton.addEventListener('click', submitUserInput);

/**
 * Submits the user input from the form, adds a chat item to the chat container,
 * and resets the input field and send button state.
 *
 * @param {Event} event - the event object
 * @return {void} 
 */
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


// Make #modal switch between display: none and display: flex
const toggleModal = () => {
  const modal = document.getElementById('modal');
  const inputs = modal.querySelectorAll('input[name="name"], input[name="email"], input[name="phone"]');
  if (modal.style.display === 'none') {
    modal.style.display = 'flex';
    inputs.forEach(input => {
      input.setAttribute('required', true);
    });
  } else {
    modal.style.display = 'none';
    inputs.forEach(input => {
      input.removeAttribute('required');
    });
  }
}

// When user clicks .contactButton run toggleModal();
const contactButton = document.querySelector('.contactButton');

contactButton.addEventListener('click', toggleModal);

// When user clicks #cancelUserInfo set #modal to display: none
const cancelButton = document.querySelector('#cancelUserInfo');

cancelButton.addEventListener('click', toggleModal);

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

// When user clicks outside of #userInfoContainer set #modal to display: none
document.addEventListener('click', (event) => {
  const userInfoContainer = document.querySelector('#userInfoContainer');
  const contactButton = document.querySelector('.contactButton');
  if (!userInfoContainer.contains(event.target) && event.target !== contactButton) {
    toggleModal();
  }
});

// Run toggleModal when the mouse exits the viewport
document.addEventListener('mouseleave', toggleModal);

