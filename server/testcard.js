let card = [1,2,3,4,5,6,7,8,9,10]

let cardPlayers = {};

function getCards(uuid) {
    let cardPlayer = []
    for (let i = 0; i < 2; i++) {
        let mathrandom = Math.floor(Math.random() * (card.length -1))
        console.log(mathrandom)
        cardPlayer.push(card[mathrandom]);
        card.splice(mathrandom,1)
    }
    cardPlayer.forEach(value => console.log("value : " + value))
    console.log(card)
    cardPlayers = {uuid : cardPlayer};

    console.log(cardPlayers)
    return cardPlayers
}

module.exports = getCards;
