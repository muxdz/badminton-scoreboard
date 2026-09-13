const socket = io();

function renderCompletedGames(completedGames) {
    const historyElement = document.getElementById('completed-games');
    historyElement.replaceChildren();

    completedGames.forEach((game, index) => {
        const column = document.createElement('div');
        const playerAScore = document.createElement('span');
        const playerBScore = document.createElement('span');

        column.className = 'game-score-pair';
        column.setAttribute('aria-label', `Game ${index + 1}`);

        playerAScore.className = 'game-score';
        playerAScore.textContent = game.playerA;
        playerAScore.classList.toggle('is-game-winner', game.winner === 'playerA');

        playerBScore.className = 'game-score';
        playerBScore.textContent = game.playerB;
        playerBScore.classList.toggle('is-game-winner', game.winner === 'playerB');

        column.append(playerAScore, playerBScore);
        historyElement.append(column);
    });
}

function renderMatch(match) {
    const playerAName = document.getElementById('player-a-name');
    const playerBName = document.getElementById('player-b-name');

    playerAName.textContent = match.playerA.name;
    playerAName.title = match.playerA.name;
    playerBName.textContent = match.playerB.name;
    playerBName.title = match.playerB.name;

    const playerAScore = document.getElementById('player-a-score');
    const playerBScore = document.getElementById('player-b-score');

    playerAScore.textContent = match.playerA.score;
    playerBScore.textContent = match.playerB.score;
    playerAScore.classList.toggle(
        'is-match-winner',
        match.isMatchOver && match.winner === 'playerA'
    );
    playerBScore.classList.toggle(
        'is-match-winner',
        match.isMatchOver && match.winner === 'playerB'
    );
    document.getElementById('game-number').textContent = match.gameNumber;

    const playerAServing = match.currentServer === 'playerA';
    const playerBServing = match.currentServer === 'playerB';
    const playerAServeElement = document.getElementById('player-a-serving');
    const playerBServeElement = document.getElementById('player-b-serving');

    playerAServeElement.classList.toggle('is-serving', playerAServing);
    playerAServeElement.setAttribute('aria-hidden', String(!playerAServing));
    playerBServeElement.classList.toggle('is-serving', playerBServing);
    playerBServeElement.setAttribute('aria-hidden', String(!playerBServing));

    renderCompletedGames(match.completedGames || []);

    const winnerElement = document.getElementById('winning-player');
    winnerElement.hidden = !match.isMatchOver;

    if (match.isMatchOver) {
        winnerElement.textContent = `${match[match.winner].name} wins the match`;
    } else {
        winnerElement.textContent = '';
    }
}

socket.on('matchUpdated', renderMatch);
