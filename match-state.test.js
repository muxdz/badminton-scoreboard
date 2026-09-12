const assert = require('node:assert/strict');
const { createMatch } = require('./match-state.js');

const match = createMatch();

assert.equal(match.playerA.score, 0);
assert.equal(match.playerB.score, 0);
assert.equal(match.playerA.gamesWon, 0);
assert.equal(match.playerB.gamesWon, 0);
assert.equal(match.currentServer, 'playerA');
assert.equal(match.isMatchOver, false);
assert.equal(match.winner, null);

console.log('All match state tests passed.');