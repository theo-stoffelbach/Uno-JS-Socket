const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const getCards = require('./testcard.js');


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front/page.html');
})

let buttonState = "lobby";
let i = 0;

io.on('connection', (socket) => {
    socket.emit('getId', socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('start game', () => {
        if (buttonState === "lobby") {
            buttonState = "start";
        } else {
            buttonState = "Start";
        }
        socket.emit('start game');
        socket.emit('card', getCards(socket.id) );
        console.log("Go joué");

    });


});


server.listen(3000, () => {
    console.log('listening on *:3000');
});