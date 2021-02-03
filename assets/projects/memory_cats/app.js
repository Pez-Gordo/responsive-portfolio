document.addEventListener('DOMContentLoaded', () => {

    //card options
    const cardArray = [
        {
            name: 'cat_1',
            img: 'images/cat_1.jpeg'
        },
        {
            name: 'cat_1',
            img: 'images/cat_1.jpeg'
        },
        {
            name: 'cat_2',
            img: 'images/cat_2.jpeg'
        },
        {
            name: 'cat_2',
            img: 'images/cat_2.jpeg'
        },
        {
            name: 'cat_3',
            img: 'images/cat_3.jpeg'
        },
        {
            name: 'cat_3',
            img: 'images/cat_3.jpeg'
        },
        {
            name: 'cat_4',
            img: 'images/cat_4.jpeg'
        },
        {
            name: 'cat_4',
            img: 'images/cat_4.jpeg'
        },
        {
            name: 'cat_5',
            img: 'images/cat_5.jpeg'
        },
        {
            name: 'cat_5',
            img: 'images/cat_5.jpeg'
        },
        {
            name: 'cat_6',
            img: 'images/cat_6.jpeg'
        },
        {
            name: 'cat_6',
            img: 'images/cat_6.jpeg'
        },
    ]

    cardArray.sort(() => 0.5 - Math.random());

    const grid = document.querySelector('.grid');
    const resultDisplay = document.querySelector('#result');
    var cardsChosen = [];
    var cardsChosenId = [];
    var cardsWon = [];

    //create the board
    function createBoard() {
        for (let i = 0; i < cardArray.length; i++) {
            var card = document.createElement('img');
            card.setAttribute('src', 'images/blank.png');
            card.setAttribute('data-id', i);
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
    }

    //check for matches
    function checkForMatch() {
        var cards = document.querySelectorAll('img');
        const optionOneId = cardsChosenId[0];
        const optionTwoId = cardsChosenId[1];
        if (cardsChosen[0] === cardsChosen[1]) {
            alert('your found a match');
            cards[optionOneId].setAttribute('src', 'images/white.png');
            cards[optionTwoId].setAttribute('src', 'images/white.png');
            cardsWon.push(cardsChosen);
        } else {
            cards[optionOneId].setAttribute('src', 'images/blank.png');
            cards[optionTwoId].setAttribute('src', 'images/blank.png');
            alert('Sorry try again');
        }
        cardsChosen = [];
        cardsChosenId = [];
        resultDisplay.textContent = cardsWon.length;
        if (cardsWon.length === cardArray.length / 2) {
            resultDisplay.textContent = 'Congratulations! You found them all';
        }
    }
    //flip ypur card
    function flipCard() {
        var cardId = this.getAttribute('data-id');
        cardsChosen.push(cardArray[cardId].name)
        cardsChosenId.push(cardId);
        this.setAttribute('src', cardArray[cardId].img);
        if(cardsChosen.length === 2) {
            setTimeout(checkForMatch, 500)
        }
    }


    createBoard();








})