const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// const getCards = require('./testcard.js');
// const StartGame = require('./game')

let ioSocket = io.sockets
const path = require('path')

let cardsDeck = [];
let cardsDiscard = [{
    color: "green",
    number: 10
}];
let playerCardMap = new Map;
// var wayToTurn = [];

app.use(express.static(path.join(__dirname , '/front')))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front/page.html');
})

// let buttonState = "lobby";
// let i = 0;

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // console.log(playerCardMap)

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

    socket.on("drewDeck", (number) => {
        console.log("Number : ", number)
        drewCards(number,socket.id)

        updateDeck()
    })

    socket.on("playCard", (card,color) => {
        console.log("bug 1")
        console.log("Player map : ", playerCardMap[socket.id])

        if (playerCardMap[socket.id].turn) {
            verifyPlayCard(card,color,socket.id)
        }else {
            console.log("Not your turn")
        }
    })
});

// function coldDown(s) {
//     setTimeout(() => {},s*1000)
// }

function StartGame() {
    // console.log(ioSocket.sockets.size)
    initGame(9)
    ioSocket.sockets.forEach(socket => {
        drewCards(2,socket.id)
    })

    console.log(" --- playerCardMap ---")
    console.log(playerCardMap)
    console.log()
}

function initGame(nbCards) {
    // colorsInGame = ["green","yellow","red","blue"]
    let colorsInGame = ["green"]

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

    ioSocket.emit("startGame")
}

function drewCards(nbCardDrew,player) {
    console.log(" --- Drew --- : ", player)
    for (let i = 1; i <= nbCardDrew; i++) {
        let randomNumberCard = Math.round(Math.random() * (cardsDeck.length - 1))
        // console.log("randomNumberCard : ", randomNumberCard, ", i : ",i, ", cardLength : ", cardsDeck.length)
        playerCardMap[player].card.push(cardsDeck[randomNumberCard])
        let cardRemoved = cardsDeck.splice(randomNumberCard,1)
        // console.log("-- ")
        // console.log("Drew : ", cardRemoved)
    }
    const socketPlayer = io.sockets.sockets.get(player);

    if (socketPlayer) {
        let cards = playerCardMap[player].card;

        socketPlayer.emit('getDrewCard', cards);
    } else {
        console.log('Socket non trouvé');
    }

    console.log(" -- End Drew --")

}

function turnSomeOne() {
    // console.log("Turn ! : ")
    let players = ioSocket.sockets
    let nbPlayer = Math.round(Math.random() * players.size)
    let i = 1

    console.log("players.size : ", players.size)
    console.log("turn : ",nbPlayer)

    ioSocket.sockets.forEach(socket => {
        const socketPlayer = io.sockets.sockets.get(socket.id);
        if (i === nbPlayer)  {
            playerCardMap[socket.id].turn = true
        }

        if (socketPlayer) {
            socketPlayer.emit('getStatue', playerCardMap[socket.id].turn);
        } else {
            console.log('Socket non trouvé');
        }
        console.log("i :",i, ",nbP : ", nbPlayer,",socket : ", socket.id)
        i++
    })
}

function verifyPlayCard(card,color,player) {

    console.log(cardsDiscard[cardsDiscard.length - 1].color)
    console.log(color)

    console.log(typeof cardsDiscard[cardsDiscard.length - 1].color)
    console.log(typeof color)

    if (cardsDiscard[cardsDiscard.length - 1].color === color || cardsDiscard[cardsDiscard.length - 1].number === card.number ) {

        const socketPlayer = io.sockets.sockets.get(player);
        if (socketPlayer) {
            cardsDiscard.push({
                number: card.number,
                color:color
            })

            let cardDeckPlayer = playerCardMap[player].card;
            console.log(playerCardMap[player])
            cardDeckPlayer.forEach((cards,i) => {
                console.log(i)
                if (color === cards.color && cards.number === cards.number) {
                    playerCardMap[player].card.splice(i,1)
                    playerCardMap[player].turn = false
                    console.log("CA MARCHE");
                }
            })
            console.log(playerCardMap[player])
            updateDeck()
        } else {
            console.log('Socket non trouvé');
        }
    }else {
        console.log("YEAH")
    }

}

function updateDeck() {
    console.log("Update Deck")
    ioSocket.sockets.forEach(socket => {
        const playerSocket = io.sockets.sockets.get(socket.id)
        playerSocket.emit("updateCard", playerCardMap[socket.id])
    })
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});