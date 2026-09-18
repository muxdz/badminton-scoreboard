const assert = require('node:assert/strict');
const { createMatch, scorePoint, hasWonGame } = require('./match-engine.js');

/**
 * Tests for the match engine
 */

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

// Throws format error for unknown format
{
    assert.throws(
        () => createMatch({ format: 'unknown', sideAPlayers: [], sideBPlayers: [] }),
        /must be "singles" or "doubles"/
    );
}

// Throws error for wrong number of players in singles
{
    assert.throws(
        () => createMatch({ 
            format: 'singles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'b1'
        }),
        /one player/
    );

    assert.throws(
        () => createMatch({ format: 'singles', sideAPlayers: [], sideBPlayers: [] }),
        /one player/
    );
}

// Throws error for wrong number of players in doubles
{
    assert.throws(
        () => createMatch({ format: 'doubles', sideAPlayers: [], sideBPlayers: [] }),
        /two players/
    );

    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }, { id: 'a3', name: 'Amy' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }, { id: 'b3', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'b1'
        }),
        /two players/
    );
}

// Throws error for blank player name
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: '' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'b1'
        }),
        /must have a name/
    );
}

// Throws error for blank player ID
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: '', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'b1'
        }),
        /must have an id/
    );
}

// Throws error for duplicate player ID
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a1', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'b1'
        }),
        /unique ids/
    );
}

// Throws error if server and receiver are on the same side
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'b1',
            startingReceiverId: 'b2'
        }),
        /different side/
    );
}

// Throws error for unknown starting server
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'c1',
            startingReceiverId: 'b1'
        }),
        /unknown/i
    );
}

// Throws error for unknown starting receiver
{
    assert.throws(
        () => createMatch({ 
            format: 'doubles', 
            sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }], 
            sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
            startingServerId: 'a1',
            startingReceiverId: 'c1'
        }),
        /unknown/i
    );
}

// Error when sideAPlayers is not an array
{
    assert.throws(
        () => createMatch({ format: 'doubles', sideAPlayers: 'not an array', sideBPlayers: [], startingServerId: 'a1', startingReceiverId: 'b1' }),
        /arrays/
    );
}

// Error when sideBPlayers is not an array
{
    assert.throws(
        () => createMatch({ format: 'doubles', sideAPlayers: [], sideBPlayers: 'not an array', startingServerId: 'a1', startingReceiverId: 'b1' }),
        /arrays/
    );
}

/**
 * Tests for scorePoint
 */

// Singles match increments score
{
    const match = createMatch({ 
        format: 'singles', 
        sideAPlayers: [{ id: 'a1', name: 'Alice' }], 
        sideBPlayers: [{ id: 'b1', name: 'Beth' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideA');
    
    assert.equal(newMatch.sides.sideA.score, 1);
    assert.equal(newMatch.sides.sideB.score, 0);

    assert.equal(match.sides.sideA.score, 0);
    assert.equal(match.sides.sideB.score, 0);
}

// Singles receiver wins rally
{
    const match = createMatch({ 
        format: 'singles', 
        sideAPlayers: [{ id: 'a1', name: 'Alice' }], 
        sideBPlayers: [{ id: 'b1', name: 'Beth' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideB');
    
    assert.equal(newMatch.sides.sideA.score, 0);
    assert.equal(newMatch.sides.sideB.score, 1);

    assert.equal(newMatch.service.servingSide, 'sideB');
    assert.equal(newMatch.service.serverPlayerId, 'b1');
    assert.equal(newMatch.service.receiverPlayerId, 'a1');
}

// Doubles serving side wins rally
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideA');
    
    assert.equal(newMatch.sides.sideA.score, 1);
    assert.equal(newMatch.sides.sideB.score, 0);

    assert.equal(newMatch.service.servingSide, 'sideA');
    assert.equal(newMatch.service.serverPlayerId, 'a1');
    assert.equal(newMatch.service.receiverPlayerId, 'b2');
    
    assert.equal(newMatch.positions.sideA.leftPlayerId, 'a1');
    assert.equal(newMatch.positions.sideA.rightPlayerId, 'a2');

    assert.equal(newMatch.positions.sideB.leftPlayerId, 'b2');
    assert.equal(newMatch.positions.sideB.rightPlayerId, 'b1');
}

// Doubles receiver wins rally
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideB');
    
    assert.equal(newMatch.sides.sideA.score, 0);
    assert.equal(newMatch.sides.sideB.score, 1);

    assert.equal(newMatch.service.servingSide, 'sideB');
    assert.equal(newMatch.service.serverPlayerId, 'b2');
    assert.equal(newMatch.service.receiverPlayerId, 'a2');

    assert.equal(newMatch.positions.sideA.leftPlayerId, 'a2');
    assert.equal(newMatch.positions.sideA.rightPlayerId, 'a1');

    assert.equal(newMatch.positions.sideB.leftPlayerId, 'b2');
    assert.equal(newMatch.positions.sideB.rightPlayerId, 'b1');
}

// Invalid side throws an error
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    assert.throws(
        () => scorePoint(match, 'sideC'),
        /invalid side/i
    );

}

// Completed match sets isMatchOver to true
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.isMatchOver = true;

    assert.throws(
        () => scorePoint(match, 'sideA'),
        /match is already over/i
    )

}

// Immutability tests
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideA');

    assert.notEqual(match, newMatch);
    assert.notEqual(match.sides, newMatch.sides);
    assert.notEqual(match.sides.sideA, newMatch.sides.sideA);
    assert.notEqual(match.sides.sideB, newMatch.sides.sideB);
    assert.notEqual(match.positions, newMatch.positions);
    assert.notEqual(match.service, newMatch.service);
}

// Server and receiver doubles rotation
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    const newMatch = scorePoint(match, 'sideA');

    assert.equal(newMatch.service.serverPlayerId, 'a1');
    assert.equal(newMatch.service.receiverPlayerId, 'b2');

    const newMatch2 = scorePoint(newMatch, 'sideB');

    assert.equal(newMatch2.service.serverPlayerId, 'b2');
    assert.equal(newMatch2.service.receiverPlayerId, 'a1');

    const newMatch3 = scorePoint(newMatch2, 'sideA');

    assert.equal(newMatch3.service.serverPlayerId, 'a2');
    assert.equal(newMatch3.service.receiverPlayerId, 'b1');
}

/**
 * Tests for game win detection
 */

// 20-19 has not won yet
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 20;
    match.sides.sideB.score = 19;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), false);
}

// 21-19 has won
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 21;
    match.sides.sideB.score = 19;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), true);
}

// 21-20 has not won yet
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 21;
    match.sides.sideB.score = 20;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), false);
}

// 22-20 has won
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 22;
    match.sides.sideB.score = 20;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), true);
}

// 29-29 has not won yet
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 29;
    match.sides.sideB.score = 29;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), false);
}

// 30-29 has won
{
    const match = createMatch({
        format: 'doubles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }, { id: 'a2', name: 'Alyssa' }],
        sideBPlayers: [{ id: 'b1', name: 'Beth' }, { id: 'b2', name: 'Betsy' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });

    match.sides.sideA.score = 30;
    match.sides.sideB.score = 29;

    assert.equal(hasWonGame(match.sides.sideA.score, match.sides.sideB.score), true);
}


console.log('All new match engine tests passed.');