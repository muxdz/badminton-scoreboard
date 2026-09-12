const express = require('express');
const { createMatch, scorePoint } = require('./match-state.js');

const app = express();
app.use(express.static('public'));

let currentMatch = createMatch();
let matchHistory = [];

app.get('/api/match', (request, response) => {
    response.json(currentMatch);
});

app.post('/api/score/:player', (request, response) => {
    try {
        matchHistory.push(currentMatch);
        currentMatch = scorePoint(currentMatch, request.params.player);

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
