const assert = require('node:assert/strict');
const { createMatch } = require('./match-engine.js');

// Creating a singles match
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

// Ensures that players can't be manipulated
{
    const sideAPlayers = [{ id: 'a1', name: '  Alice  ' }];

    const match = createMatch({
        format: 'singles',
        sideAPlayers,
        sideBPlayers: [{ id: 'b1', name: 'Beth' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    sideAPlayers[0].name = 'Changed';
    sideAPlayers.push({ id: 'a2', name: 'Alyssa' });

    assert.equal(match.sides.sideA.players[0].name, 'Alice');
    assert.equal(match.sides.sideA.players.length, 1);
    assert.notEqual(match.sides.sideA.players, sideAPlayers);
    assert.notEqual(match.sides.sideA.players[0], sideAPlayers[0]);

}

// Creates doubles match, side a serves first
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    assert.equal(match.format, 'doubles');
    assert.equal(match.sides.sideA.players.length, 2);
    assert.equal(match.sides.sideB.players.length, 2);
    assert.equal(match.service.servingSide, 'sideA');
    assert.equal(match.service.serverPlayerId, 'a1');
    assert.equal(match.service.receiverPlayerId, 'b1');

    assert.equal(match.positions.sideA.rightPlayerId, 'a1');
    assert.equal(match.positions.sideA.leftPlayerId, 'a2');
    assert.equal(match.positions.sideB.rightPlayerId, 'b1');
    assert.equal(match.positions.sideB.leftPlayerId, 'b2');

    assert.equal(match.sides.sideA.score, 0);
    assert.equal(match.sides.sideB.score, 0);
    assert.equal(match.sides.sideA.gamesWon, 0);
    assert.equal(match.sides.sideB.gamesWon, 0);

}

// Creates doubles match, side B serves first
{

    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'b2',
        startingReceiverId: 'a2'
    });

    assert.equal(match.format, 'doubles');
    assert.equal(match.sides.sideA.players.length, 2);
    assert.equal(match.sides.sideB.players.length, 2);
    assert.equal(match.service.servingSide, 'sideB');
    assert.equal(match.service.serverPlayerId, 'b2');
    assert.equal(match.service.receiverPlayerId, 'a2');

    assert.equal(match.positions.sideA.rightPlayerId, 'a2');
    assert.equal(match.positions.sideA.leftPlayerId, 'a1');
    assert.equal(match.positions.sideB.rightPlayerId, 'b2');
    assert.equal(match.positions.sideB.leftPlayerId, 'b1');

    assert.equal(match.sides.sideA.score, 0);
    assert.equal(match.sides.sideB.score, 0);
    assert.equal(match.sides.sideA.gamesWon, 0);
    assert.equal(match.sides.sideB.gamesWon, 0);

}


console.log('All new match engine tests passed.');