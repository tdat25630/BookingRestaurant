// websocket.js
const { WebSocketServer } = require('ws');
const clients = new Set();

let wss;

function setupWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
      console.log('client diconnected');
      clients.delete(ws);
    });
  });
}

function broadcastEvent(event) {
  console.log('emit event: ', event)
  //const message = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(event);
    }
  }
}

module.exports = {
  setupWebSocket,
  broadcastEvent,
};
