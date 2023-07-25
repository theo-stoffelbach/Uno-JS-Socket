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

let wayTurn = []
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

    socket.on("connect", () => {
        console.log("log : " + socket.id)
    })

    socket.on("startGame", () => {
        StartGame()
    })

    socket.on("drewDeck", (number) => {
        console.log("Number : ", number)
        drewCards(number,socket.id)

        updateCard()
    })

    socket.on("playCard", (card,color) => {
        console.log("bug 1")
        console.log("Player map : ", playerCardMap[socket.id])

        if (playerCardMap.get(socket.id).turn) {
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
    console.log(ioSocket.sockets);
    initGame(9)
    console.log(ioSocket.sockets);
    console.log("------")
    ioSocket.sockets.forEach(socket => {
        drewCards(2,socket.id)
    })
    console.log("------")
    console.log("Game Start")
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
        playerCardMap[player].card.push(cardsDeck[randomNumberCard])
        cardsDeck.splice(randomNumberCard,1)
    }
    const socketPlayer = io.sockets.sockets.get(player);

    if (socketPlayer) {
        let cards = playerCardMap[player].card;

        socketPlayer.emit('getDrewCard', cards);
    } else {
        console.log('Socket non trouvé');
    }


}

function turnSomeOne() {
    var players = new Map(ioSocket.sockets)

    let nbPlayer;
    if (players.size === 1) nbPlayer = 1
    else {
        nbPlayer = (Math.round(Math.random() * (players.size - 1))) + 1;
    }
    let i = 1;

    ioSocket.sockets.forEach(socket => {
        const socketPlayer = io.sockets.sockets.get(socket.id);
        if (i === nbPlayer)  {
            playerCardMap[socket.id].turn = true;
            players.delete(socket.id)

        }

        if (socketPlayer) {
            socketPlayer.emit('getStatue', playerCardMap[socket.id].turn);
        } else {
            console.log('Socket non trouvé');
        }
        i++;
    })
}

function verifyPlayCard(card,color,player) {
    if (cardsDiscard[cardsDiscard.length - 1].color === color || cardsDiscard[cardsDiscard.length - 1].number === card ) {
        const socketPlayer = io.sockets.sockets.get(player);
        if (socketPlayer) {
            cardsDiscard.push({
                number: card,
                color:color
            })

            let cardDeckPlayer = playerCardMap[player].card;
            cardDeckPlayer.forEach((cards,i) => {
                if (color === cards.color && cards.number === cards.number) {
                    playerCardMap[player].card.splice(i,1);
                    playerCardMap[player].turn = false;
                }
            })
            updateCard()
        } else {
            console.log('Socket non trouvé');
        }
    }else {
        console.log("YEAH")
    }

}

function updateCard() {
    console.log("Update Deck")
    ioSocket.sockets.forEach(socket => {
        const playerSocket = io.sockets.sockets.get(socket.id)
        console.log(cardsDiscard[cardsDiscard.length - 1])
        playerSocket.emit("updateCard", playerCardMap[socket.id],cardsDiscard[cardsDiscard.length - 1])
    })
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});