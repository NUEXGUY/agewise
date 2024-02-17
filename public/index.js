const chatSendButton = document.querySelector('#inputBar #chatSendButton')

chatSendButton.addEventListener('click', () => {
  sendChatMessage(chatInput.value, true)
  chatInput.value = ''
})

function clearForm () {
  document.querySelector('#name').value = ''
  document.querySelector('#age').value = ''
  document.querySelector('#gender').value = ''
  document.querySelector('#email').value = ''
  document.querySelector('#phone').value = ''
  document.querySelector('#contactTime').value = ''
}

const modal = document.querySelector('#modal')
const contactButton = document.querySelector('#contactButton')

// Toggle modal with overlay and disable/enable inputs
const toggleModal = () => {
  if (modal.style.visibility === 'hidden' || modal.style.visibility === '') {
    modal.style.opacity = '1'
    modal.style.visibility = 'visible'
    const inputs = modal.querySelectorAll('input, select')
    inputs.forEach(input => {
      input.disabled = false
    })
  } else {
    modal.style.opacity = '0'
    modal.style.visibility = 'hidden'
    const inputs = modal.querySelectorAll('input, select')
    inputs.forEach(input => {
      input.disabled = true
    })
  }
}

contactButton.addEventListener('click', toggleModal)
document.addEventListener('click', (event) => {
  const modalElement = document.querySelector('#modal')
  if (!modalElement.contains(event.target) && modalIsOpen) {
    // Do nothing, prevent closing due to outside click
  }
})

let modalIsOpen = false

window.addEventListener('blur', () => {
  if (!modalIsOpen) {
    modalIsOpen = true
    toggleModal()
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (!modalIsOpen) {
      modalIsOpen = true
      toggleModal()
    }
  } else { /* empty */ }
})

document.querySelector('#cancelUserInfo').addEventListener('click', () => {
  modalIsOpen = false
  toggleModal()
})

const closeModal = () => {
  modalIsOpen = false
  toggleModal()
}

// When user clicks #sendUserInfo create a new person object with collected information
const sendUserInfo = document.querySelector('#submitUserInfo')
const nameInput = document.querySelector('#name')
const emailInput = document.querySelector('#email')
const phoneInput = document.querySelector('#phone')

sendUserInfo.addEventListener('click', async (event) => {
  event.preventDefault()
  const name = nameInput.value
  const email = emailInput.value
  const phone = phoneInput.value
  const age = document.querySelector('#age').value
  const gender = document.querySelector('#gender').value
  const contactTime = document.querySelector('#contactTime').value

  if (!name || !email || !phone) {
    return
  }

  const person = { name, email, phone, age, gender, contactTime }

  try {
    const response = await fetch('/submit-user-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    })
    const data = await response.json()
    if (data.success) {
      clearForm()
      closeModal()
    } else {
      console.error('Error submitting user info')
    }
  } catch (error) {
    console.error('Error submitting user info:', error)
  }
})

// Using keydown for better compatibility
const chatInput = document.querySelector('#chatInput')

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target === chatInput) {
    event.preventDefault()
    sendChatMessage(chatInput.value, true)
    chatInput.value = ''
  }
})

chatInput.addEventListener('input', () => {
  if (chatInput.value.trim() === '') {
    chatSendButton.disabled = true
  } else {
    chatSendButton.disabled = false
  }
})

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && chatInput.value.trim() === '') {
    event.preventDefault()
  }
})

// Send message to the server for OpenAI interaction
async function sendChatMessage (message, isUser) {
  if (isUser) {
    addChatItem('User', message)
  }

  // Add SVG animation to the chatInput
  chatInput.insertAdjacentHTML('afterend',
      `<svg width="120" height="20" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
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
      </svg>`)

  try {
    const response = await fetch('/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    // Wait for the full response before logging/using it
    const data = await response.json()

    // Replace SVG animation with the original placeholder text
    chatInput.placeholder = 'Enter your question here...'
    document.querySelector('svg').remove()

    addChatItem('AI', data.message)
  } catch (error) {
    console.error('Error sending chat message:', error)
    console.error('Error details:', error.message, error.stack)

    // Handle specific error cases based on server response
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = error.response.data.error.message
      addChatItem('AI', errorMessage)
    } else {
      addChatItem('AI', "Sorry, I couldn't process your message.")
    }
  }
}

function addChatItem (sender, message) {
  const chatItem = document.createElement('div')
  chatItem.classList.add(sender === 'AI' ? 'chatItemBot' : 'chatItemUser')

  const chatText = document.createElement('p')
  chatText.classList.add(sender === 'AI' ? 'chatTextBot' : 'chatTextUser')
  chatText.textContent = message

  const chatBox = document.querySelector('#chatBox')
  chatBox.appendChild(chatItem) // This keeps the appending logic simple
  chatItem.appendChild(chatText)

  // Automatically scroll to the bottom after adding a new message
  chatBox.scrollTop = chatBox.scrollHeight
}

document.addEventListener('DOMContentLoaded', () => {
  const initialBotMessage = "Feeling lost in the fog of chronic pain? You're not alone. Ask your question here and get insights tailored to your experience. Remember, AgeWise isn't a doctor, but we can help you understand your pain better."
  addChatItem('AI', initialBotMessage)
  // Ensure the chatBox scrolls to the bottom after the initial message is added
  const chatBox = document.querySelector('#chatBox')
  chatBox.scrollTop = chatBox.scrollHeight
}, 1000)

let mouseLeaveEnabled = true

document.addEventListener('mouseleave', () => {
  if (mouseLeaveEnabled) {
    mouseLeaveEnabled = false
    setTimeout(() => {
      mouseLeaveEnabled = true
    }, 3 * 60 * 1000)
    toggleModal()
  }
})

chatInput.addEventListener('focus', function () {
  chatInput.placeholder = 'Type your message...'
})

chatInput.addEventListener('blur', function () {
  chatInput.placeholder = 'Start typing here...'
})
