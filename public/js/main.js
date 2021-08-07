// get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const socket = io()

// user joined chatroom
socket.emit('joinRoom', { username, room })

// get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputRoomUsers(users)
})

// get message from server
socket.on('message', (message) => {
  outputMessage(message)

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Submit message
chatForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const message = event.target.elements.msg.value

  // send message to server
  socket.emit('chatMessage', message)

  // clear input
  event.target.elements.msg.value = ''
  event.target.elements.msg.focus()
})

// output message to DOM
function outputMessage(message) {
  const el = document.createElement('div')

  el.classList.add('message')
  el.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>`

  document.querySelector('.chat-messages').appendChild(el)
}

// add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// add users to DOM
function outputRoomUsers(users) {
  userList.innerHTML = `${users.map((user) => `<li>${user.username}</li>`).join('')}`
}
