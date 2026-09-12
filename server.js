const express = require('express');
const { createMatch, scorePoint } = require('./match-state.js');

const app = express();
app.use(express.static('public'));
app.use(express.json());

let currentMatch = createMatch('playerA', 'playerB');
let matchHistory = [];

app.get('/api/match', (request, response) => {
    response.json(currentMatch);
});

app.post('/api/match', (request, response) => {
    currentMatch = createMatch(
        request.body.playerAName,
        request.body.playerBName
    );
    
    matchHistory = [];

    response.json(currentMatch);
});

app.post('/api/score/:player', (request, response) => {
    try {
        updatedMatch = scorePoint(currentMatch, request.params.player);
        matchHistory.push(currentMatch);
        currentMatch = updatedMatch;

        response.json(currentMatch);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.post('/api/undo', (request, response) => {
    if (matchHistory.length === 0) {
        return response.status(400).json({ error: 'Nothing to undo' });
    }
    currentMatch = matchHistory.pop();
    response.json(currentMatch);
});

app.listen(3000);
