const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/players') {
        response.end('Players page');
    } else if (request.method === 'GET' && request.url === '/') {
        fs.readFile('index.html', (error, data) => {
            response.setHeader('Content-Type', 'text/html');
            response.end(data)
        });
    } else {
        response.statusCode = 404;
        response.end('Not found');
    }
    console.log(request.method);
    console.log(request.url);
});

server.listen(3000);
