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
        status: 'in-progress',
        nextGameServingSide: null,
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
    if (match.status !== 'in-progress') {
        throw new Error('Match is not in progress');
    }

    if (side !== 'sideA' && side !== 'sideB') {
        throw new Error('Side entered is an invalid side');
    }

    const matchCopy = structuredClone(match);

    const otherSide = getOtherSide(side);
    const winnerAlreadyServing = match.service.servingSide === side;

    if (matchCopy.format === 'singles') {
        matchCopy.sides[side].score += 1;

        matchCopy.service.servingSide = side;
        matchCopy.service.serverPlayerId = matchCopy.sides[side].players[0].id;
        matchCopy.service.receiverPlayerId = matchCopy.sides[otherSide].players[0].id;
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

    const hasWon = hasWonGame(
        matchCopy.sides[side].score,
        matchCopy.sides[otherSide].score
    );

    if (hasWon) {
        matchCopy.sides[side].gamesWon += 1;

        if (matchCopy.sides[side].gamesWon === 2) {
            matchCopy.winnerSide = side;
            matchCopy.status = 'complete';
            matchCopy.nextGameServingSide = null;
            return matchCopy;
        }

        const completedGame = {
            gameNumber: matchCopy.gameNumber,
            sideAScore: matchCopy.sides.sideA.score,
            sideBScore: matchCopy.sides.sideB.score,
            winnerSide: side
        };

        matchCopy.previousGames.push(completedGame);
        
        matchCopy.gameNumber += 1;
        matchCopy.sides.sideA.score = 0;
        matchCopy.sides.sideB.score = 0;
        matchCopy.status = 'between-games';

        matchCopy.nextGameServingSide = side;
        matchCopy.service = null;
        matchCopy.positions = null;

    }

    return matchCopy;
}

function getOtherSide(side) {
    return side === 'sideA' ? 'sideB' : 'sideA';
}

function hasWonGame(playerScore, opponentScore) {
    if (playerScore === 30) {
        return true;
    }

    return playerScore >= 21 && playerScore - opponentScore >= 2;
}

function startNextGame(match, {
    startingServerId,
    startingReceiverId
}) {
    if (match.status !== 'between-games') {
        throw new Error('Match is not between games');
    }

    const allPlayers = [
        ...match.sides.sideA.players,
        ...match.sides.sideB.players
    ];

    if (!allPlayers.some((player) => player.id === startingServerId)) {
        throw new Error('Starting server is not a player');
    }

    if (!allPlayers.some((player) => player.id === startingReceiverId)) {
        throw new Error('Starting receiver is not a player');
    }

    const serverSide = findPlayerSide(match.sides, startingServerId);
    const receiverSide = findPlayerSide(match.sides, startingReceiverId);

    if (serverSide !== match.nextGameServingSide) {
        throw new Error('Starting server is on the serving side');
    } 
    if (receiverSide !== getOtherSide(match.nextGameServingSide)) {
        throw new Error('Starting receiver is not on the receiving side');
    }
    if (serverSide === receiverSide) {
        throw new Error('Starting server and receiver must be on opposite sides');
    }

    const matchCopy = structuredClone(match);

    const service = {
        servingSide: serverSide,
        serverPlayerId: startingServerId,
        receiverPlayerId: startingReceiverId
    };

    let positions = null;

    const sideARightPlayerId =
        serverSide === 'sideA'
            ? startingServerId
            : startingReceiverId;

    const sideBRightPlayerId =
        serverSide === 'sideB'
            ? startingServerId
            : startingReceiverId;

    if (matchCopy.format === 'doubles') {
        positions = {
            sideA: createStartingPositions(
                matchCopy.sides.sideA.players,
                sideARightPlayerId
            ),
            sideB: createStartingPositions(
                matchCopy.sides.sideB.players,
                sideBRightPlayerId
            )
        };
    }

    matchCopy.status = 'in-progress';
    matchCopy.nextGameServingSide = null;
    
    matchCopy.service = service;
    matchCopy.positions = positions;

    return matchCopy;
}

module.exports = { createMatch, scorePoint, hasWonGame, startNextGame };