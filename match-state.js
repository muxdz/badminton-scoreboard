function createMatch(playerAName, playerBName) {
    if (!playerAName.trim() || !playerBName.trim()) {
        throw new Error('Player names are required');
    }

    const playerA = {
        name: playerAName,
        gamesWon: 0,
        score: 0
    }
    const playerB = {
        name: playerBName,
        gamesWon: 0,
        score: 0
    }
    const matchStatus = {
        playerA,
        playerB,
        previousGames: [],
        currentServer: 'playerA',
        currentReceiver: 'playerB',
        isMatchOver: false,
        winner: null,
        gameNumber: 1
    }
    return matchStatus;
}

function hasWonGame(playerScore, opponentScore) {
    if (playerScore === 30) {
        return true;
    }

    return playerScore >= 21 && playerScore - opponentScore >= 2;
}

function getPointStatus(match, player) {
    if (player !== 'playerA' && player !== 'playerB') {
        throw new Error('This player is not valid');
    }

    if (match.isMatchOver) {
        return null;
    }

    const opponent = player === 'playerA' ? 'playerB' : 'playerA';
    const playerScore = match[player].score;
    const opponentScore = match[opponent].score;

    const playerWins = match[player].gamesWon;

    if (hasWonGame(playerScore+1, opponentScore)) {
        return playerWins === 1 ? 'match-point' : 'game-point';
    } else {
        return null;
    }
}

function scorePoint(match, player) {
    if (player !== 'playerA' && player !== 'playerB') {
        throw new Error('This player is not valid');
    }

    if (match.isMatchOver) {
        throw new Error('Cannot score a point after the match is over');
    }

    const updatedMatch = {
        ...match,
        playerA: { ...match.playerA },
        playerB: { ...match.playerB },
        previousGames: [...(match.previousGames || [])]
    };
    const opponent = player === 'playerA' ? 'playerB' : 'playerA';

    updatedMatch.currentServer = player;
    updatedMatch.currentReceiver = opponent;
    updatedMatch[player].score += 1;

    const playerScore = updatedMatch[player].score;
    const opponentScore = updatedMatch[opponent].score;

    if (hasWonGame(playerScore, opponentScore)) {
        updatedMatch[player].gamesWon += 1;

        if (updatedMatch[player].gamesWon === 2) {
            updatedMatch.isMatchOver = true;
            updatedMatch.winner = player;
        } else {
            updatedMatch.previousGames.push({
                playerA: updatedMatch.playerA.score,
                playerB: updatedMatch.playerB.score,
                winner: player
            });
            updatedMatch.gameNumber += 1;
            updatedMatch.playerA.score = 0;
            updatedMatch.playerB.score = 0;
        }
    }

    return updatedMatch;
}

module.exports = { createMatch, scorePoint, getPointStatus };
