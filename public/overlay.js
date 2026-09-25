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
        playerAScore.textContent = game.sideAScore;
        playerAScore.classList.toggle('is-game-winner', game.winnerSide === 'sideA');

        playerBScore.className = 'game-score';
        playerBScore.textContent = game.sideBScore;
        playerBScore.classList.toggle('is-game-winner', game.winnerSide === 'sideB');

        column.append(playerAScore, playerBScore);
        historyElement.append(column);
    });
}

function renderMatch(match) {
    const playerAName = document.getElementById('player-a-name');
    const playerBName = document.getElementById('player-b-name');

    const sideAPlayers = match.sides.sideA.players
        .map((player) => player.name)
        .join(' / ');

    const sideBPlayers = match.sides.sideB.players
        .map((player) => player.name)
        .join(' / ');

    playerAName.textContent = sideAPlayers;
    playerAName.title = sideAPlayers;
    playerBName.textContent = sideBPlayers;
    playerBName.title = sideBPlayers;

    const playerAScore = document.getElementById('player-a-score');
    const playerBScore = document.getElementById('player-b-score');

    const matchComplete = match.status === 'complete';

    playerAScore.textContent = match.sides.sideA.score;
    playerBScore.textContent = match.sides.sideB.score;
    playerAScore.classList.toggle(
        'is-match-winner',
        matchComplete && match.winnerSide === 'sideA'
    );
    playerBScore.classList.toggle(
        'is-match-winner',
        matchComplete && match.winnerSide === 'sideB'
    );
    document.getElementById('game-number').textContent = match.gameNumber;

    const playerAServing = match.service?.servingSide === 'sideA';
    const playerBServing = match.service?.servingSide === 'sideB';
    const playerAServeElement = document.getElementById('player-a-serving');
    const playerBServeElement = document.getElementById('player-b-serving');

    playerAServeElement.classList.toggle('is-serving', playerAServing);
    playerAServeElement.setAttribute('aria-hidden', String(!playerAServing));
    playerBServeElement.classList.toggle('is-serving', playerBServing);
    playerBServeElement.setAttribute('aria-hidden', String(!playerBServing));

    const playerAPointStatus = document.getElementById('player-a-point-status');
    const playerBPointStatus = document.getElementById('player-b-point-status');

    playerAPointStatus.textContent = match.pointStatus.sideA ?? '';
    playerBPointStatus.textContent = match.pointStatus.sideB ?? '';

    renderCompletedGames(match.previousGames || []);

    const winnerElement = document.getElementById('winning-player');
    winnerElement.hidden = !matchComplete;

    if (matchComplete) {
        winnerElement.textContent = `${match.winnerSide} wins the match`;
    } else {
        winnerElement.textContent = '';
    }
}

socket.on('matchUpdated', renderMatch);
