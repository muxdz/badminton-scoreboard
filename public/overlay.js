const socket = io();

function renderMatch(match) {
    document.getElementById('player-a-name').textContent = match.playerA.name;
    document.getElementById('player-b-name').textContent = match.playerB.name;
    document.getElementById('player-a-score').textContent = match.playerA.score;
    document.getElementById('player-b-score').textContent = match.playerB.score;
    document.getElementById('player-a-games-won').textContent = match.playerA.gamesWon;
    document.getElementById('player-b-games-won').textContent = match.playerB.gamesWon;
    document.getElementById('game-number').textContent = match.gameNumber;
    document.getElementById('player-a-serving')
        .classList.toggle(
            'is-serving', 
            match.currentServer === 'playerA'
        );
    document.getElementById('player-b-serving')
        .classList.toggle(
            'is-serving', 
            match.currentServer === 'playerB'
        );

    document.getElementById('winning-player').textContent = match.winningPlayer;
}

socket.on('matchUpdated', renderMatch);