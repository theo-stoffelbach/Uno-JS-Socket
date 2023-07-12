const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server, Socket} = require("socket.io");
const io = new Server(server);
const getCards = require('./testcard.js');
// const StartGame = require('./game')

var ioSocket = io.sockets
const path = require('path')

var cardsDeck = [];
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
        console.log(playerCardMap)

        if (String(playerCardMap.get(socket.id )) !== undefined) {
            return;
        }

        playerCardMap.get(socket.id).forEach(card => {
            console.log("card : ", card)
        })
        playerCardMap.delete(socket.id)
        console.log(socket.id)
        console.log(playerCardMap)
    });

    socket.on("startGame", () => {
        StartGame()
    })

});

function cooldown(s) {
    setTimeout(() => {},s*1000)
}

function StartGame() {
    console.log(ioSocket.sockets.size)
    initGame(9)
    ioSocket.sockets.forEach(socket => {
        drewCards(2,socket.id)
    })

    console.log(" --- playerCardMap ---")
    console.log(playerCardMap)

    // console.log()
}

function initGame(nbCards = 9,playersSockets) {
    // colorsInGame = ["green","yellow","red","blue"]
    colorsInGame = ["green"]

    colorsInGame.forEach(color => {
        for (let i = 0; i <= nbCards; i++) {
            cardsDeck.push({color : color, number: i})
        }
    })

    //player :

    ioSocket.sockets.forEach(socket => {
        playerCardMap[socket.id] = {
            card : [],
            turn : false
        }
    })

    turnSomeOne()


    console.log("\n\n")
    console.log("cardsDeck : ", cardsDeck)
    console.log("playerCardMap : ", playerCardMap)
    console.log("\n\n");
    ioSocket.emit("startGame")



    return
}

function drewCards(nbCardDrew,player) {
    console.log(" --- Drew ---")
    for (let i = 1; i <= nbCardDrew; i++) {
        let randomNumberCard = Math.round(Math.random() * cardsDeck.length - 1)
        console.log("randomNumberCard : ", randomNumberCard)
        playerCardMap[player].card.push(cardsDeck[randomNumberCard])
        cardsDeck.splice(randomNumberCard,1)
    }
    const socketPlayer = io.sockets.sockets.get(player); // Récupère la socket avec l'ID donné

    if (socketPlayer) {
        let cards = playerCardMap[player].card;

        socketPlayer.emit('getDrewCard', cards);
    } else {
        console.log('Socket non trouvé');
    }

}

function turnSomeOne() {
    let players = ioSocket.sockets
    let nbPlayer = Math.round(Math.random() * players.size - 1)
    let i = 0
    for (const player of players) {
        if (i !== nbPlayer) i++
        else {
            player.turn = true
            break
        }
    }


}

server.listen(3000, () => {
    console.log('listening on *:3000');
});