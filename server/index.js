const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const getCards = require('./testcard.js');
// const StartGame = require('./game')

var ioSocket = io.sockets
const path = require('path')

var playersOnGame = [];
var cardsDiscard = [];
var playerCardMap = new Map;

app.use(express.static(path.join(__dirname , '/front')))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front/page.html');
})

let buttonState = "lobby";
let i = 0;

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log('user disconnected');

        if (String(playerCardMap.get(socket.id === undefined))) {
            return;
        }

        playerCardMap.get(socket.id).forEach(card => {
            console.log("card : ", card)
        })
        playerCardMap.delete(socket.id)
        console.log(playerCardMap)

    });

    socket.on('getInitCard',() => {
        playersOnGame.push(socket.id);
        console.log('user co : ', playersOnGame)
        let playerCard = getCards(socket.id);

        socket.emit('getInitCard', playerCard)

        playerCardMap.set(socket.id, playerCard.cards);
        console.log(playerCardMap)
    })

    socket.on('start game', () => {

        if (buttonState === "lobby") {
            socket.emit('start game')
            socket.broadcast.emit('start game');
            StartGame(playersOnGame);
        } else {
            buttonState = "Start";
        }
    });

});

function cooldown(s) {
    setTimeout(() => {},s*1000)
}

function StartGame(playersOnGame) {
    i = 0;
    console.log("bizzare")
    while (true) {
        const targetUUID = playersOnGame[i+1 % playersOnGame.length];

        console.log(playersOnGame);
        console.log(targetUUID + " : " + i);

        i++;
        if (i >= 20) break;
    }
}


server.listen(3000, () => {
    console.log('listening on *:3000');
});