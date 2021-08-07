const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { joinUser, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// serve html
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Chat Bot'

// when clients connect
io.on('connect', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    // when current user connects
    const user = joinUser(socket.id, username, room)
    socket.join(user.room)
    socket.emit('message', formatMessage(botName, 'Welcome to the chat'))

    // send everyone who connected, except current user
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // listen for chatMessage
  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, message))
  })

  // runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

      // send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
