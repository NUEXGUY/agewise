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

document.querySelector('#userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    submitUserInput(e);
  }
});

// Make #modal switch between display: none and display: flex

// When user clicks #contactButton set #modal to display: flex

// When user tries to leave AgeWise set #modal to display: flex

// When user clicks #cancelUserInfo set #modal to display: none

// When user clicks #sendUserInfo create a new person object with collected information

// When user clicks #sendUserInfo set #modal to display: none

// When user click outside of #userInfoContainer set #modal to display: none

