var socket = io();
var cardsOfPlayer = [];

// const messages = document.getElementById('messages'); // Je sais plus ce que c'est
const form = document.getElementById('form');
const input = document.getElementById('Start');

const startMenu = document.getElementById('menu');
// const drawButton = document.getElementById('#draw');
var cardElements = document.getElementsByClassName('card');
const cardArea = document.getElementById('cards');

const turnState = document.getElementById('state');
const lastCardPlayedElement = document.getElementById('lastPlayedCard');

if (!cardElements.length <= 0) {
    console.log(cardElements)
    cardElements.forEach(el => {
        console.log("mince")
        el.addEventListener("click", l => {
            console.log("c'est un : ", l)
        })
    });
}


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
    console.log("?? ??")
    startMenu.remove();
})

socket.on("getDrewCard", (cards) => {
    console.log("! DREW !")
    regenerateCard(cards)
    console.log("! END DREW !")
})

socket.on("updateCard", (playerData,lastCardPlayed) => {
    console.log()
    console.log('data :', playerData )
    console.log('lastCardPlayed :')
    console.log(lastCardPlayed)
    console.log()
    regenerateCard(playerData.card);
    turnState.innerText = playerData.turn;

    lastCardPlayedElement.innerText = lastCardPlayed.number


})

socket.on("getStatue", (turn) => {
    console.log("turn : ", turn)
    turnState.innerText = turn
})

function Drew(number) {
    console.log(number)
    socket.emit('drewDeck', number);
}

function playCard(number,color) {
    console.log(number)
    socket.emit('playCard', number,color);
}

function regenerateCard(cards) {

    while (cardArea.firstChild) {
        cardArea.removeChild(cardArea.firstChild);
        console.log("bug")
    }

    cards.forEach(card => {
        console.log(card)

        cardHTML = document.createElement("button");
        cardHTML.className = "card";
        cardHTML.setAttribute("type", "button");

        let numberCard = document.createElement("h3");
        numberCard.className = "numberCard";
        numberCard.innerText = card.number

        numberCard.className = "card.color";

        numberCard.onclick = function() {
            playCard(this.innerText,card.color);
        };

        cardHTML.appendChild(numberCard);
        cardArea.appendChild(cardHTML);
        cardsOfPlayer.push({cards: card,color: "none"})

    })

}


