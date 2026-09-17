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

    if (!Array.isArray(sideAPlayers) || !Array.isArray(sideBPlayers)) {
        throw new Error('Players must be arrays');
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

    const copiedSideAPlayers = sideAPlayers.map((player) => ({
        id: player.id,
        name: player.name.trim()
    }));

    const copiedSideBPlayers = sideBPlayers.map((player) => ({
        id: player.id,
        name: player.name.trim()
    }));

    const sides = {
        sideA: {
            players: copiedSideAPlayers,
            score: 0,
            gamesWon: 0
        },
        sideB: {
            players: copiedSideBPlayers,
            score: 0,
            gamesWon: 0
        }
    };

    const servingSide = findPlayerSide(sides, startingServerId);
    const receivingSide = findPlayerSide(sides, startingReceiverId);

    if (servingSide === null) {
        throw new Error('Unknown starting server player');
    } else if (receivingSide === null) {
        throw new Error('Unknown starting receiver player');
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

function scorePoint(match, side) {
    if (side !== 'sideA' && side !== 'sideB') {
        throw new Error('Side entered is an invalid side');
    }

    if (match.isMatchOver) {
        throw new Error('Match is already over');
    }

    const matchCopy = {
        ...match
    };

    const otherSide = getOtherSide(side);
    const winnerAlreadyServing = match.service.servingSide === side;

    if (matchCopy.format === 'singles') {
        matchCopy.sides[side].score += 1;

        matchCopy.service.servingSide = side;
        matchCopy.service.serverPlayerId = matchCopy.sides[otherSide].players[0].id;
        matchCopy.service.receiverPlayerId = matchCopy.sides[side].players[0].id;
    } else {
        matchCopy.sides[side].score += 1;
        
        if (winnerAlreadyServing) {
            const temp = matchCopy.positions[side].rightPlayerId;
            matchCopy.positions[side].rightPlayerId = matchCopy.positions[side].leftPlayerId;
            matchCopy.positions[side].leftPlayerId = temp;
        }

        matchCopy.service.servingSide = side;

        const rightSide = matchCopy.positions[side].rightPlayerId;
        const leftSide = matchCopy.positions[side].leftPlayerId;

        const rightOtherSide = matchCopy.positions[otherSide].rightPlayerId;
        const leftOtherSide = matchCopy.positions[otherSide].leftPlayerId;
        
        if (matchCopy.sides[side].score%2 === 0) {
            matchCopy.service.serverPlayerId = rightSide;
            matchCopy.service.receiverPlayerId = rightOtherSide;
        } else {
            matchCopy.service.serverPlayerId = leftSide;
            matchCopy.service.receiverPlayerId = leftOtherSide;
        }
    }

    return matchCopy;
}

function getOtherSide(side) {
    return side === 'sideA' ? 'sideB' : 'sideA';
}

module.exports = { createMatch, scorePoint };