const http = require('http');
const server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('handled by child, pid is ' + process.pid + '\n'); 
})
let worket;

process.on('message', (m, tcp) => {
  if (m === 'server') {
    worket = tcp;
    tcp.on('connection', socket => {
      server.emit('connection', socket);
    })
  }
})

process.on('uncaughtException', () => {
  process.send({act: 'suicide'})
  worket.close(() => {
    process.exit(1);
  })
})