function createMatch(config) {
    const {
        format,
        sideAPlayers,
        sideBPlayers,
        startingServerId,
        startingReceiverId
    } = config;

    if (format !== 'singles' && format !== 'doubles') {
        throw new Error('Match format must be "singles" or "doubles"');
    }

    const requiredPlayers = format === 'singles' ? 1 : 2;
    if (format === 'singles') {
        if (sideAPlayers.length !== requiredPlayers || sideBPlayers.length !== requiredPlayers) {
            throw new Error('Singles requires exactly one player on each side');
        }
    } else if (format === 'doubles') {
        if (sideAPlayers.length !== requiredPlayers || sideBPlayers.length !== requiredPlayers) {
            throw new Error('Doubles requires exactly two players on each side');
        }
    }

    const allPlayers = [...sideAPlayers, ...sideBPlayers];
    for (let i = 0; i < allPlayers.length; i += 1) {
        let player = allPlayers[i];
        if (typeof player !== 'object' || player === null) {
            throw new Error('Players must be objects');
        }
        if (typeof player.id !== 'string' || !player.id.trim()) {
            throw new Error('Players must have an id');
        }
        if (typeof player.name !== 'string' || !player.name.trim()) {
            throw new Error('Players must have a name');
        }
    }

    const playerIds = allPlayers.map((player) => player.id);
    const uniquePlayerIds = new Set(playerIds);

    if (playerIds.length !== uniquePlayerIds.size) {
        throw new Error('Players must have unique ids');
    }

    const sides = {
        sideA: {
            players: sideAPlayers,
            score: 0,
            gamesWon: 0
        },
        sideB: {
            players: sideBPlayers,
            score: 0,
            gamesWon: 0
        }
    };

    const servingSide = findPlayerSide(sides, startingServerId);
    const receivingSide = findPlayerSide(sides, startingReceiverId);

    if (servingSide === null || receivingSide === null) {
        throw new Error('Starting player must be on one of the sides');
    } else if (servingSide === receivingSide) {
        throw new Error('Starting players must be on different sides');
    }

    let positions = null;

    const sideARightPlayerId =
        servingSide === 'sideA'
            ? startingServerId
            : startingReceiverId;

    const sideBRightPlayerId =
        servingSide === 'sideB'
            ? startingServerId
            : startingReceiverId;

    if (format === 'doubles') {
        positions = {
            sideA: createStartingPositions(
                sides.sideA.players,
                sideARightPlayerId
            ),
            sideB: createStartingPositions(
                sides.sideB.players,
                sideBRightPlayerId
            )
        };
    }

    return {
        format,
        sides,
        positions,
        service: {
            servingSide,
            serverPlayerId: startingServerId,
            receiverPlayerId: startingReceiverId
        },
        previousGames: [],
        gameNumber: 1,
        isMatchOver: false,
        winnerSide: null
    };
}

function findPlayerSide(sides, playerId) {
    if (sides.sideA.players.some((player) => player.id === playerId)) {
        return 'sideA';
    } else if (sides.sideB.players.some((player) => player.id === playerId)) {
        return 'sideB';
    }

    return null;
}

function createStartingPositions(players, rightPlayerId) {
    const leftPlayer = players.find(
        (player) => player.id !== rightPlayerId
    );

    return {
        rightPlayerId,
        leftPlayerId: leftPlayer.id
    };
}

module.exports = { createMatch };