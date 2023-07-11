var socket = io();
var cardsOfPlayer = [];

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('Start');

var startMenu = document.getElementById('menu');
var buttonCard = document.getElementsByClassName('card');
var cardArea = document.getElementById('cards');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('start game', "start");
        console.log("Youpi")
    }
});

socket.on('disconnect', () => {
    console.log('Déconnecté du serveur');
    // socket.emit("disconnectRemoveCard", cardsOfPlayer)

});

socket.on('start game', () => {
    startMenu.remove();
    socket.emit('getInitCard');
});

socket.on('start game', () => {
    socket.emit('startGame');
});


socket.on("getInitCard", (cards) => {
    startMenu.remove();

    cards.cards.forEach(card => {
        let cardHTML = document.createElement("button");
        cardHTML.className = "card";
        cardHTML.setAttribute("type", "button");

        let numberCard = document.createElement("h3");
        numberCard.className = "numberCard";
        numberCard.innerText = card

        cardHTML.appendChild(numberCard);
        cardArea.appendChild(cardHTML);
        cardsOfPlayer.push({cards: card,color: "none"})
    })
    console.log(cardsOfPlayer)
})

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

