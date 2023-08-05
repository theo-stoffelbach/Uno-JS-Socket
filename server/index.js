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

let wayTurn = [];
let cardsDeck = [];
let cardsDiscard = [];
let playerCardMap = new Map;
let countTurn = 0;

app.use(express.static(path.join(__dirname , '/front')))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front/page.html');
})

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
        console.log(socket.id)
        if (!playerCardMap[socket.id].alreadyDraw && playerCardMap[socket.id].turn ) {
            drewCards(number,socket.id);
            playerCardMap[socket.id].alreadyDraw = true

            if (!testIfPlayerCanPlay(socket)) {
                nextTurn();
            }
        }

        updateCard();
    })

    socket.on("playCard", card => {
        console.log("bug 1")
        if (playerCardMap[socket.id].turn) {
            verifyPlayCard(card,socket.id)
        }else {
            console.log("Not your turn")
        }
    })
});

function StartGame() {
    initGame(9)
    ioSocket.sockets.forEach(socket => {
        drewCards(2,socket.id)
    })
    console.log(" -- Game Start -- ")
}

function initGame(nbCards) {
    // colorsInGame = ["green","yellow","red","blue"]
    let colorsInGame = ["green"]

    colorsInGame.forEach(color => {
        for (let i = 0; i <= nbCards; i++) {
            cardsDeck.push({color : color, number: i})
        }
    })

    ioSocket.sockets.forEach(socket => {
        playerCardMap[socket.id] = {
            card : [],
            turn : false,
            alreadyDraw: false
        }
    })

    wayTurn = CreateWayTurn()
    pickRandomStartDiscard();

    turnSomeOne();

    ioSocket.emit("startGame")
}

function drewCards(nbCardDrew,player) {
    // console.log(" --- Drew --- : ", player)
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

function CreateWayTurn() {
    let playersList = []

    ioSocket.sockets.forEach(socketPlayer => {
        playersList.push(socketPlayer.id);
    })
    playersList = shuffle(playersList);

    return playersList;
}

function turnSomeOne() {

    let turnOfPlayer = wayTurn[countTurn % (wayTurn.length - 1)];

    playerCardMap[turnOfPlayer].turn = true;

    updateCard()
}

function nextTurn() {
    playerCardMap[wayTurn[countTurn % ( wayTurn.length)]].turn = false
    countTurn++
    playerCardMap[wayTurn[countTurn % ( wayTurn.length)]].turn = true
    playerCardMap[wayTurn[countTurn % ( wayTurn.length)]].alreadyDraw = false
    console.log(playerCardMap[wayTurn[countTurn % ( wayTurn.length)]])
    console.log(" --- ")
}

function shuffle(el) {
    let shuffledElement = [];

    for (let i = 0;0 !== el.length; i++) {
        let randomEl = Math.floor(Math.random() * el.length)
        shuffledElement.push(el[randomEl]);
        el.splice(randomEl,1);
    }

    return shuffledElement
}

function verifyPlayCard(card,player) {
    console.log("color : ",cardsDiscard[cardsDiscard.length - 1].color, " : ", card.color )
    if (cardsDiscard[cardsDiscard.length - 1].color === card.color || cardsDiscard[cardsDiscard.length - 1].number === card ) {
        console.log("mince ca marche !!")
        const socketPlayer = io.sockets.sockets.get(player);
        if (socketPlayer) {
            playCard(player,card)
            updateCard()
        } else {
            console.log('Socket non trouvé');
        }
    }else {
        console.log("YEAH")
    }
}

function updateCard() {
    ioSocket.sockets.forEach(socket => {
        const playerSocket = io.sockets.sockets.get(socket.id)
        playerSocket.emit("updateCard", playerCardMap[socket.id],cardsDiscard[cardsDiscard.length - 1])
    })
}

function playCard(playerId,cardPlayer) {
    playerCardMap[playerId].card.forEach((card,i) => {
        console.log(cardPlayer)
        console.log("card : ", card.number,":",card.color,"| ",cardPlayer.number, ":",cardPlayer.color)
        if (card.number === parseInt(cardPlayer.number) && card.color === cardPlayer.color) {
            playerCardMap[playerId].card.splice(i,1);
            nextTurn();
            updateCard();
        }
    })
}

function testIfPlayerCanPlay(socket) {
    let canPlay = false
    playerCardMap[socket.id].card.forEach(card => {
        if (card.color === cardsDiscard[cardsDiscard.length - 1].color || card.number === cardsDiscard[cardsDiscard.length - 1].number) {
            canPlay = true
        }
    })
    return canPlay
}

function pickRandomStartDiscard() {
    let randomNumberCard = Math.round(Math.random() * (cardsDeck.length - 1))
    cardsDiscard.push(cardsDeck[randomNumberCard])
    cardsDeck.splice(randomNumberCard,1)
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});