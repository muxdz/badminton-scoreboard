const express = require('express');
const http = require('http');
const { 
    createMatch, 
    scorePoint, 
    getPointStatus,
    startNextGame 
} = require('./match-engine.js');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

let currentMatch = createMatch({
        format: 'singles',
        sideAPlayers: [{ id: 'a1', name: 'Alice' }],
        sideBPlayers: [{ id: 'b1', name: 'Bob' }],
        startingServerId: 'a1',
        startingReceiverId: 'b1'
    });
let matchHistory = [];

function buildMatchPayload(match) {
    return {
        ...match,
        pointStatus: {
            sideA: getPointStatus(match, 'sideA'),
            sideB: getPointStatus(match, 'sideB')
        },
        canUndo: matchHistory.length > 0
    }
}


app.get('/api/match', (request, response) => {
    response.json(buildMatchPayload(currentMatch));
});

app.post('/api/match', (request, response) => {
    try {
        currentMatch = createMatch(request.body);

        matchHistory = [];

        io.emit('matchUpdated', buildMatchPayload(currentMatch));
        response.json(buildMatchPayload(currentMatch));
    } catch (error) {
        response.status(400).json({ error: error.message });
        return;
    }
});

app.post('/api/score/:side', (request, response) => {
    try {
        const updatedMatch = scorePoint(currentMatch, request.params.side);
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

app.post('/api/next-game', (request, response) => {
    try {
        const updatedMatch = startNextGame(currentMatch, request.body);
        matchHistory.push(currentMatch);
        currentMatch = updatedMatch;

        io.emit('matchUpdated', buildMatchPayload(currentMatch));
        response.json(buildMatchPayload(currentMatch));
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});


io.on('connection', (socket) => {
    socket.emit('matchUpdated', buildMatchPayload(currentMatch));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000);
