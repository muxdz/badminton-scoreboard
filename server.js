const express = require('express');
const http = require('http');
const { createMatch, scorePoint, getPointStatus } = require('./match-state.js');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

let currentMatch = createMatch('playerA', 'playerB');
let matchHistory = [];

function buildMatchPayload(match) {
    return {
        ...match,
        pointStatus: {
            playerA: getPointStatus(match, 'playerA'),
            playerB: getPointStatus(match, 'playerB')
        },
        canUndo: matchHistory.length > 0
    }
}


app.get('/api/match', (request, response) => {
    response.json(buildMatchPayload(currentMatch));
});

app.post('/api/match', (request, response) => {
    try {
        currentMatch = createMatch(
            request.body.playerAName,
            request.body.playerBName
        );

        matchHistory = [];

        io.emit('matchUpdated', buildMatchPayload(currentMatch));
        response.json(buildMatchPayload(currentMatch));
    } catch (error) {
        response.status(400).json({ error: error.message });
        return;
    }
});

app.post('/api/score/:player', (request, response) => {
    try {
        const updatedMatch = scorePoint(currentMatch, request.params.player);
        matchHistory.push(currentMatch);
        currentMatch = updatedMatch;

        io.emit('matchUpdated', buildMatchPayload(currentMatch));
        response.json(buildMatchPayload(currentMatch));
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.post('/api/undo', (request, response) => {
    if (matchHistory.length === 0) {
        return response.status(400).json({ error: 'Nothing to undo' });
    }
    currentMatch = matchHistory.pop();

    io.emit('matchUpdated', buildMatchPayload(currentMatch));
    response.json(buildMatchPayload(currentMatch));
});

io.on('connection', (socket) => {
    socket.emit('matchUpdated', buildMatchPayload(currentMatch));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000);
