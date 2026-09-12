const express = require('express');
const { createMatch, scorePoint } = require('./match-state.js');

const app = express();

let currentMatch = createMatch();

app.get('/api/match', (request, response) => {
    response.json(currentMatch);
});

app.post('/api/score/:player', (request, response) => {
    try {
        currentMatch = scorePoint(currentMatch, request.params.player);

        response.json(currentMatch);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.listen(3000);
