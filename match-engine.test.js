const assert = require('node:assert/strict');
const { createMatch } = require('./match-engine.js');

{
    const match = createMatch({
        format: 'singles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    assert.equal(match.format, 'singles');

    assert.equal(match.sides.sideA.players.length, 1);
    assert.equal(match.sides.sideB.players.length, 1);

    assert.equal(match.sides.sideA.players[0].name, 'Alice');
    assert.equal(match.sides.sideB.players[0].name, 'Beth');

    assert.equal(match.sides.sideA.score, 0);
    assert.equal(match.sides.sideB.score, 0);
    assert.equal(match.sides.sideA.gamesWon, 0);
    assert.equal(match.sides.sideB.gamesWon, 0);

    assert.equal(match.service.servingSide, 'sideA');
    assert.equal(match.service.serverPlayerId, 'a1');
    assert.equal(match.service.receiverPlayerId, 'b1');

    assert.equal(match.positions, null);
    assert.deepEqual(match.previousGames, []);
    assert.equal(match.gameNumber, 1);
    assert.equal(match.isMatchOver, false);
    assert.equal(match.winnerSide, null);
}

console.log('All new match engine tests passed.');