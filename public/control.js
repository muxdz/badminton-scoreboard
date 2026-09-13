function setStatusBadge(player, status, isWinner) {
    const badge = document.getElementById(`${player}-point-status`);
    const label = isWinner
        ? 'Match won'
        : status?.replace('-', ' ');

    badge.textContent = label ?? '';
    badge.hidden = !label;
}

function showError(message) {
    document.getElementById('control-error-message').textContent = message;
    document.getElementById('control-error').hidden = false;
}

function clearError() {
    document.getElementById('control-error-message').textContent = '';
    document.getElementById('control-error').hidden = true;
}

async function readResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Please try again.');
    }

    return data;
}

function renderMatch(match) {
    document.getElementById('player-a-name').textContent = match.playerA.name;
    document.getElementById('player-b-name').textContent = match.playerB.name;
    document.getElementById('player-a-button-name').textContent = match.playerA.name;
    document.getElementById('player-b-button-name').textContent = match.playerB.name;
    
    document.getElementById('player-a-score').textContent = match.playerA.score;
    document.getElementById('player-b-score').textContent = match.playerB.score;
    
    document.getElementById('player-a-games-won').textContent = match.playerA.gamesWon;
    document.getElementById('player-b-games-won').textContent = match.playerB.gamesWon;
    
    document.getElementById('game-number').textContent = match.gameNumber;
    document.getElementById('current-server').textContent = match[match.currentServer].name;

    const playerACard = document.getElementById('player-a-card');
    const playerBCard = document.getElementById('player-b-card');
    const playerAServing = match.currentServer === 'playerA';
    playerACard.classList.toggle('is-serving', playerAServing);
    playerBCard.classList.toggle('is-serving', !playerAServing);
    document.getElementById('player-a-serve').setAttribute('aria-hidden', String(!playerAServing));
    document.getElementById('player-b-serve').setAttribute('aria-hidden', String(playerAServing));

    setStatusBadge('player-a', match.pointStatus.playerA, match.winner === 'playerA');
    setStatusBadge('player-b', match.pointStatus.playerB, match.winner === 'playerB');

    if (match.isMatchOver) {
        document.getElementById('add-point-player-a').disabled = true;
        document.getElementById('add-point-player-b').disabled = true;
    } else {
        document.getElementById('add-point-player-a').disabled = false;
        document.getElementById('add-point-player-b').disabled = false;
    }

    document.getElementById('undo').disabled = !match.canUndo;
}

async function loadMatch() {
    try {
        const response = await fetch('/api/match');
        const match = await readResponse(response);
        clearError();
        renderMatch(match);
    } catch (error) {
        showError(error.message || 'Could not load the match. Check the connection and refresh.');
    }
}

loadMatch();

async function addPoint(player) {
    try {
        const response = await fetch(`/api/score/${player}`, {
            method: 'POST'
        });
        const data = await readResponse(response);
        clearError();
        renderMatch(data);
    } catch (error) {
        showError(error.message || 'Could not add the point. Check the connection and try again.');
    }
}

document.getElementById('add-point-player-a')
    .addEventListener('click', () => addPoint('playerA'));
document.getElementById('add-point-player-b')
    .addEventListener('click', () => addPoint('playerB'));

async function undoPoint() {
    try {
        const response = await fetch('/api/undo', {
            method: 'POST'
        });
        const data = await readResponse(response);
        clearError();
        renderMatch(data);
    } catch (error) {
        showError(error.message || 'Could not undo the point. Check the connection and try again.');
    }
}

document.getElementById('undo')
    .addEventListener('click', () => undoPoint());

async function createNewMatch(playerAName, playerBName) {
    const createButton = document.getElementById('create-match');
    createButton.disabled = true;
    createButton.textContent = 'Creating…';

    try {
        const response = await fetch('/api/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerAName,
                playerBName
            })
        });
        const data = await readResponse(response);
        clearError();
        renderMatch(data);
    } catch (error) {
        showError(error.message || 'Could not create the match. Check both names and try again.');
    } finally {
        createButton.disabled = false;
        createButton.textContent = 'Create match';
    }
}

document.getElementById('new-match-form')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        const playerAName = document.getElementById('create-a-name').value;
        const playerBName = document.getElementById('create-b-name').value;
        createNewMatch(playerAName, playerBName);
    });

const socket = io();

socket.on('matchUpdated', (match) => {
    clearError();
    renderMatch(match);
});
