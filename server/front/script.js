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
        socket.emit('startGame', "start");
        console.log("Youpi")
    }
});

socket.on('disconnect', () => {
    console.log('Déconnecté du serveur');
    // socket.emit("disconnectRemoveCard", cardsOfPlayer)
});

socket.on("startGame", () => {
    startMenu.remove()
})

socket.on("getDrewCard", (cards) => {
    regenerateCard(cards)
})

function regenerateCard(cards) {

    while (cardArea.firstChild) {
        cardArea.removeChild(cardArea.firstChild);
        console.log("bug")
    }

    cards.forEach(card => {
        cardHTML = document.createElement("button");
        cardHTML.className = "card";
        cardHTML.setAttribute("type", "button");

        let numberCard = document.createElement("h3");
        numberCard.className = "numberCard";
        numberCard.innerText = card.number

        cardHTML.appendChild(numberCard);
        cardArea.appendChild(cardHTML);
        cardsOfPlayer.push({cards: card,color: "none"})

    })

}
