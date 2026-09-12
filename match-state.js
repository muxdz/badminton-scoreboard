function createMatch() {
    const playerA = {
        name: 'Player A',
        gamesWon: 0,
        score: 0
    }
    const playerB = {
        name: 'Player B',
        gamesWon: 0,
        score: 0
    }
    const matchStatus = {
        playerA,
        playerB,
        currentServer: 'playerA',
        currentReceiver: 'playerB',
        isMatchOver: false,
        winner: null,
        gameNumber: 1
    }
    return matchStatus;
}

module.exports = { createMatch };