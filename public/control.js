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
    const sideAName = match.sides.sideA.players
        .map((player) => player.name)
        .join(' / ');

    const sideBName = match.sides.sideB.players
        .map((player) => player.name)
        .join(' / ');

    const allPlayers = [
        ...match.sides.sideA.players,
        ...match.sides.sideB.players
    ];

    const currentServer = allPlayers.find(
        (player) => player.id === match.service?.serverPlayerId
    );

    document.getElementById('current-server').textContent =
        currentServer?.name ?? 'Awaiting next game';

    document.getElementById('player-a-name').textContent = sideAName;
    document.getElementById('player-a-name').title = sideAName;
    document.getElementById('player-b-name').textContent = sideBName;
    document.getElementById('player-b-name').title = sideBName;
    document.getElementById('player-a-button-name').textContent = sideAName;
    document.getElementById('player-b-button-name').textContent = sideBName;
    document.getElementById('add-point-player-a').setAttribute('aria-label', `Add one point to ${sideAName}`);
    document.getElementById('add-point-player-b').setAttribute('aria-label', `Add one point to ${sideBName}`);
    
    document.getElementById('player-a-score').textContent = match.sides.sideA.score;
    document.getElementById('player-b-score').textContent = match.sides.sideB.score;
    
    document.getElementById('player-a-games-won').textContent = match.sides.sideA.gamesWon;
    document.getElementById('player-b-games-won').textContent = match.sides.sideB.gamesWon;
    
    document.getElementById('game-number').textContent = match.gameNumber;
    
    const playerACard = document.getElementById('player-a-card');
    const playerBCard = document.getElementById('player-b-card');
    const sideAServing = match.service?.servingSide === 'sideA';
    const sideBServing = match.service?.servingSide === 'sideB';

    playerACard.classList.toggle('is-serving', sideAServing);
    playerBCard.classList.toggle('is-serving', sideBServing);

    document.getElementById('player-a-serve').setAttribute('aria-hidden', String(!sideAServing));
    document.getElementById('player-b-serve').setAttribute('aria-hidden', String(!sideBServing));

    setStatusBadge('player-a', match.pointStatus.sideA, match.winnerSide === 'sideA');
    setStatusBadge('player-b', match.pointStatus.sideB, match.winnerSide === 'sideB');

    const scoringDisabled = match.status !== 'in-progress';

    document.getElementById('add-point-player-a').disabled = scoringDisabled;
    document.getElementById('add-point-player-b').disabled = scoringDisabled;

    document.getElementById('undo').disabled = !match.canUndo;

    if (match.status === 'between-games') {
        document.getElementById('next-game-panel').hidden = false;

        const servingSide = match.nextGameServingSide;
        const receiverSide = servingSide === 'sideA' ? 'sideB' : 'sideA';

        const servingPlayers = match.sides[servingSide].players;
        const receiverPlayers = match.sides[receiverSide].players;

        const serverSelect = document.getElementById('next-server');
        const receiverSelect = document.getElementById('next-receiver');

        serverSelect.replaceChildren(
            ...servingPlayers.map((player) => new Option(player.name, player.id))
        );

        receiverSelect.replaceChildren(
            ...receiverPlayers.map((player) => new Option(player.name, player.id))
        );

        document.getElementById('next-game-number').textContent = match.gameNumber;
    } else {
        document.getElementById('next-game-panel').hidden = true;
    }
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
    .addEventListener('click', () => addPoint('sideA'));
document.getElementById('add-point-player-b')
    .addEventListener('click', () => addPoint('sideB'));

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

async function createNewMatch(matchConfig) {
    const createButton = document.getElementById('create-match');
    createButton.disabled = true;
    createButton.textContent = 'Creating…';

    try {
        const response = await fetch('/api/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matchConfig)
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

        const format = document.getElementById('match-type').value;

        if (format === 'singles') {
            const sideAPlayer1 = document.getElementById('create-a1-name').value;
            const sideBPlayer1 = document.getElementById('create-b1-name').value;
            createNewMatch({
                format: 'singles',
                sideAPlayers: [{ id: 'a1', name: sideAPlayer1 }],
                sideBPlayers: [{ id: 'b1', name: sideBPlayer1 }],
                startingServerId: 'a1',
                startingReceiverId: 'b1'
            });
        } else if (format === 'doubles') {
            const sideAPlayer1 = document.getElementById('create-a1-name').value;
            const sideAPlayer2 = document.getElementById('create-a2-name').value;
            const sideBPlayer1 = document.getElementById('create-b1-name').value;
            const sideBPlayer2 = document.getElementById('create-b2-name').value;
            createNewMatch({
                format: 'doubles',
                sideAPlayers: [{ id: 'a1', name: sideAPlayer1 }, { id: 'a2', name: sideAPlayer2 }],
                sideBPlayers: [{ id: 'b1', name: sideBPlayer1 }, { id: 'b2', name: sideBPlayer2 }],
                startingServerId: 'a1',
                startingReceiverId: 'b1'
            });
        }
    });

document.getElementById('next-game-form')
    .addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const serverId = document.getElementById('next-server').value;
            const receiverId = document.getElementById('next-receiver').value;

            const response = await fetch(`/api/next-game/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startingServerId: serverId,
                    startingReceiverId: receiverId
                })
            });

            const data = await readResponse(response);

            clearError();
            renderMatch(data);
        } catch (error) {
            showError(error.message || 'Could not start the next game. Check the connection and try again.');
        }
    })

function updatePlayerInputs() {
    const isSingles = document.getElementById('match-type').value === 'singles';

    sideAPlayer2Input.hidden = isSingles;
    sideBPlayer2Input.hidden = isSingles;

    sideAPlayer2Input.disabled = isSingles;
    sideBPlayer2Input.disabled = isSingles;
}

const sideAPlayer2Input = document.getElementById('create-a2-name');
const sideBPlayer2Input = document.getElementById('create-b2-name');

updatePlayerInputs();
document
    .getElementById('match-type')
    .addEventListener('change', updatePlayerInputs);

const socket = io();

socket.on('matchUpdated', (match) => {
    clearError();
    renderMatch(match);
});
