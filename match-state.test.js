const assert = require('node:assert/strict');
const { createMatch, scorePoint, getPointStatus } = require('./match-state.js');

function scorePoints(match, player, numberOfPoints) {
    let updatedMatch = match;

    for (let point = 0; point < numberOfPoints; point += 1) {
        updatedMatch = scorePoint(updatedMatch, player);
    }

    return updatedMatch;
}

// New match is created with default values
{
    const match = createMatch('playerA', 'playerB');

    assert.equal(match.playerA.score, 0);
    assert.equal(match.playerB.score, 0);
    assert.equal(match.playerA.gamesWon, 0);
    assert.equal(match.playerB.gamesWon, 0);
    assert.deepEqual(match.previousGames, []);
    assert.equal(match.currentServer, 'playerA');
    assert.equal(match.isMatchOver, false);
    assert.equal(match.winner, null);
}

// Completed game scores are retained when the next game begins.
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 19;
    match.playerB.score = 20;

    const nextGame = scorePoint(match, 'playerB');

    assert.deepEqual(nextGame.previousGames, [
        { playerA: 19, playerB: 21, winner: 'playerB' }
    ]);
}

// The deciding game stays live instead of being duplicated in history.
{
    let match = createMatch('playerA', 'playerB');
    match = scorePoints(match, 'playerA', 21);
    match = scorePoints(match, 'playerA', 21);

    assert.equal(match.previousGames.length, 1);
    assert.equal(match.playerA.score, 21);
    assert.equal(match.playerB.score, 0);
}

// Scoring a point updates the player's score with a new match
{
    const match = createMatch('playerA', 'playerB');
    const updatedMatch = scorePoint(match, 'playerA');
    assert.equal(updatedMatch.playerA.score, 1);
}

// Player must lead by 2 points to win a game
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 20;
    match.playerB.score = 20;

    const atTwentyOne = scorePoint(match, 'playerA');
    assert.equal(atTwentyOne.playerA.gamesWon, 0);
    assert.equal(atTwentyOne.playerB.gamesWon, 0);

    const gameWon = scorePoint(atTwentyOne, 'playerA');
    assert.equal(gameWon.playerA.gamesWon, 1);
    assert.equal(gameWon.playerB.gamesWon, 0);
}

// Reaching 30 points wins a game even without a two-point lead.
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 29;
    match.playerB.score = 29;

    const updatedMatch = scorePoint(match, 'playerB');

    assert.equal(updatedMatch.playerA.gamesWon, 0);
    assert.equal(updatedMatch.playerB.gamesWon, 1);
}

// Player B wins the second game and becomes the match winner.
{
    let match = createMatch('playerA', 'playerB');
    match = scorePoints(match, 'playerB', 21);
    match = scorePoints(match, 'playerB', 21);

    assert.equal(match.playerB.gamesWon, 2);
    assert.equal(match.isMatchOver, true);
    assert.equal(match.winner, 'playerB');
}

// A completed match rejects further points.
{
    let match = createMatch('playerA', 'playerB');
    match = scorePoints(match, 'playerA', 21);
    match = scorePoints(match, 'playerA', 21);

    assert.throws(
        () => scorePoint(match, 'playerB'),
        /match is over/
    );
}

// An invalid player is rejected.
{
    const match = createMatch('playerA', 'playerB');

    assert.throws(
        () => scorePoint(match, 'playerC'),
        /not valid/
    );
}

// A new game increments its number, resets scores, and keeps the winner serving.
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 10;
    match.playerB.score = 20;

    const nextGame = scorePoint(match, 'playerB');

    assert.equal(nextGame.gameNumber, 2);
    assert.equal(nextGame.playerA.score, 0);
    assert.equal(nextGame.playerB.score, 0);
    assert.equal(nextGame.currentServer, 'playerB');
    assert.equal(nextGame.currentReceiver, 'playerA');
}

// Scoring does not mutate the input match or its nested player state.
{
    const match = createMatch('playerA', 'playerB');
    const originalSnapshot = structuredClone(match);
    const updatedMatch = scorePoint(match, 'playerB');

    assert.deepEqual(match, originalSnapshot);
    assert.notEqual(updatedMatch, match);
    assert.notEqual(updatedMatch.playerA, match.playerA);
    assert.notEqual(updatedMatch.playerB, match.playerB);
}

// Custom names are stored in the match state.
{
    const match = createMatch('customA', 'customB');
    assert.equal(match.playerA.name, 'customA');
    assert.equal(match.playerB.name, 'customB');
}

// Empty names throw an error.
{
    assert.throws(
        () => createMatch('', ''),
        /Player names are required/
    );
}

// 19-19, neither has game point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 19;
    match.playerB.score = 19;

    assert.equal(getPointStatus(match, 'playerA'), null);
    assert.equal(getPointStatus(match, 'playerB'), null);
}

// 20-19, playerA has game point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 20;
    match.playerB.score = 19;

    assert.equal(getPointStatus(match, 'playerA'), 'game-point');
    assert.equal(getPointStatus(match, 'playerB'), null);
}

// 20-20, neither has game point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 20;
    match.playerB.score = 20;

    assert.equal(getPointStatus(match, 'playerA'), null);
    assert.equal(getPointStatus(match, 'playerB'), null);
}

// 21-20, playerA has game point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 21;
    match.playerB.score = 20;

    assert.equal(getPointStatus(match, 'playerA'), 'game-point');
    assert.equal(getPointStatus(match, 'playerB'), null);
}

// 29-29, both have game point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 29;
    match.playerB.score = 29;

    assert.equal(getPointStatus(match, 'playerA'), 'game-point');
    assert.equal(getPointStatus(match, 'playerB'), 'game-point');
}

// One game won at 20-19, leading player has match point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 20;
    match.playerB.score = 19;

    match.playerA.gamesWon = 1;

    assert.equal(getPointStatus(match, 'playerA'), 'match-point');
    assert.equal(getPointStatus(match, 'playerB'), null);
}

// One game each at 29-29, both have match point
{
    const match = createMatch('playerA', 'playerB');
    match.playerA.score = 29;
    match.playerB.score = 29;

    match.playerA.gamesWon = 1;
    match.playerB.gamesWon = 1;

    assert.equal(getPointStatus(match, 'playerA'), 'match-point');
    assert.equal(getPointStatus(match, 'playerB'), 'match-point');
}

// Completed match, neither player has a point status
{
    const match = createMatch('playerA', 'playerB');
    match.isMatchOver = true;

    assert.equal(getPointStatus(match, 'playerA'), null);
    assert.equal(getPointStatus(match, 'playerB'), null);
}

console.log('All match state tests passed.');
