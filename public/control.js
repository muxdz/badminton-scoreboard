function renderMatch(match) {
    document.getElementById('player-a-name').textContent = match.playerA.name;
    document.getElementById('player-b-name').textContent = match.playerB.name;
    document.getElementById('player-a-score').textContent = match.playerA.score;
    document.getElementById('player-b-score').textContent = match.playerB.score;
    document.getElementById('player-a-games-won').textContent = match.playerA.gamesWon;
    document.getElementById('player-b-games-won').textContent = match.playerB.gamesWon;
    document.getElementById('game-number').textContent = match.gameNumber;
    document.getElementById('current-server').textContent = match[match.currentServer].name;

    if (match.isMatchOver) {
        document.getElementById('add-point-player-a').disabled = true;
        document.getElementById('add-point-player-b').disabled = true;
    } else {
        document.getElementById('add-point-player-a').disabled = false;
        document.getElementById('add-point-player-b').disabled = false;
    }
}

async function loadMatch() {
    const response = await fetch('/api/match');
    const match = await response.json();

    renderMatch(match);
}

loadMatch();

async function addPoint(player) {
    const response = await fetch(`/api/score/${player}`, {
        method: 'POST'
    });
    const data = await response.json();
    const errorMessage = document.getElementById('add-error-message');

    if (!response.ok) {
        errorMessage.textContent = data.error;
        return;
    }

    errorMessage.textContent = '';
    renderMatch(data);
}

document.getElementById('add-point-player-a')
    .addEventListener('click', () => addPoint('playerA'));
document.getElementById('add-point-player-b')
    .addEventListener('click', () => addPoint('playerB'));

async function undoPoint() {
    const response = await fetch('/api/undo', {
        method: 'POST'
    });
    const data = await response.json();
    const errorMessage = document.getElementById('undo-error-message');

    if (!response.ok) {
        errorMessage.textContent = data.error;
        return;
    }

    errorMessage.textContent = '';
    renderMatch(data);
}

document.getElementById('undo')
    .addEventListener('click', () => undoPoint());

async function createNewMatch(playerAName, playerBName) {
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
    const data = await response.json();
    const errorMessage = document.getElementById('create-error-message');

    if (!response.ok) {
        errorMessage.textContent = data.error;
        return;
    }

    errorMessage.textContent = '';
    renderMatch(data);
}

document.getElementById('create-match')
    .addEventListener('click', () => {
        const playerAName = document.getElementById('create-a-name').value;
        const playerBName = document.getElementById('create-b-name').value;
        createNewMatch(playerAName, playerBName);
})