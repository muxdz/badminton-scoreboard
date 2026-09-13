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
    const wonAtThirty = playerScore === 30;
    const wonByTwo = playerScore >= 21 && playerScore - opponentScore >= 2;

    if (wonAtThirty || wonByTwo) {
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

module.exports = { createMatch, scorePoint };
