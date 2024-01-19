import {
  db,
  set,
  push,
  ref,
  onValue,
  child,
  remove
} from '../firebaseConfig.js'

// Maximum number of messages
const MAX_MESSAGES = 70
// Maximum number of characters in a message
const MAX_CHARS = 500
const sendMessageButton = document.querySelector('.send-message-button')

const conversationBoard = document.querySelector('.chat__conversation-board')

const messageInput = document.querySelector('.chat__conversation-panel__input')
messageInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault
        // If Shift + Enter is pressed, insert a newline at the current cursor position
        const start = messageInput.selectionStart;
        messageInput.value = messageInput.value.slice(0, start) + "\n" + messageInput.value.slice(start);
        messageInput.selectionStart = messageInput.selectionEnd = start + 1;
  } 
  else if (e.key === 'Enter' && messageInput.value.trim() !== '') {
    e.preventDefault();
    sendMessageButton.click();
  }
});


sendMessageButton.addEventListener('click', function () {
  if(messageInput.value.trim() === '') {
    alert('Please enter a message')
    return
  }
  // Check if the message exceeds the maximum number of characters
  if (messageInput.value.length > MAX_CHARS) {
    alert(`Message cannot exceed ${MAX_CHARS} characters.`)
    return
  }
  const newMessageRef = push(child(ref(db), 'messages'))
  set(newMessageRef, {
    avatar: './img/avatars/default.png',
    displayName: localStorage.getItem('userDisplayName')
      ? localStorage.getItem('userDisplayName')
      : 'Guest',
    displayNameColor: 'cyan',
    message: messageInput.value,
    timestamp: Date.now()
  })

  if (
    conversationBoard.scrollHeight - conversationBoard.clientHeight <=
    conversationBoard.scrollTop + 500
  ) {
    conversationBoard.scrollTop = conversationBoard.scrollHeight
  }
  messageInput.value = ''
})

// Receive messages
const messagesRef = child(ref(db), 'messages')
onValue(messagesRef, snapshot => {
  // Clear the chat conversation panel
  conversationBoard.innerHTML = ''

  // Append each message to the chat conversation panel
  snapshot.forEach(childSnapshot => {
    const message = childSnapshot.val()
    displayMessage(message)
  })
})
// Function to display a message
function displayMessage (message) {
  // Create a new message container
  const messageContainer = document.createElement('div')
  messageContainer.className = 'chat__conversation-board__message-container'

  // Create the person div
  const personDiv = document.createElement('div')
  personDiv.className = 'chat__conversation-board__message__person'
  messageContainer.appendChild(personDiv)

  // Add avatar
  const avatarDiv = document.createElement('div')
  avatarDiv.className = 'chat__conversation-board__message__person__avatar'
  const avatarImg = document.createElement('img')
  avatarImg.src = message.avatar
  avatarImg.alt = message.displayName
  avatarImg.style.backgroundColor = 'white'
  avatarDiv.appendChild(avatarImg)
  personDiv.appendChild(avatarDiv)

  // Add display name
  const displayNameSpan = document.createElement('span')
  displayNameSpan.className =
    'chat__conversation-board__message__person__nickname'
  displayNameSpan.textContent = message.displayName
  displayNameSpan.style.color = message.displayNameColor
  personDiv.appendChild(displayNameSpan)

  // Create the context div
  const contextDiv = document.createElement('div')
  contextDiv.className = 'chat__conversation-board__message__context'
  messageContainer.appendChild(contextDiv)

  // Add message bubble
  const bubbleDiv = document.createElement('div')
  bubbleDiv.className = 'chat__conversation-board__message__bubble'
  const bubbleSpan = document.createElement('span')
  bubbleSpan.textContent = message.message
  bubbleDiv.appendChild(bubbleSpan)
  contextDiv.appendChild(bubbleDiv)

  conversationBoard.appendChild(messageContainer)
}

// Listen for new messages
onValue(messagesRef, snapshot => {
  // Get all messages
  const messages = snapshot.val()

  // Convert the messages object to an array of keys
  const messageKeys = Object.keys(messages)

  // Check if the number of messages exceeds the maximum
  if (messageKeys.length > MAX_MESSAGES) {
    // Get the key of the oldest message
    const oldestMessageKey = messageKeys[0]

    // Remove the oldest message
    remove(child(messagesRef, oldestMessageKey))
  }
})
