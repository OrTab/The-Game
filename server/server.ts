const hostname = '127.0.0.1';
const port = 4001;
import { noDep } from '@or-tab/my-server';
import { Request } from '@or-tab/my-server/lib/dist/types/types';
const { app, server } = noDep();
import type { Socket } from 'net';

app.enableCorsForOrigins({ 'http://localhost:4000': ['*'] });

export const handleWebSocketUpgrade = (req: Request, socket: Socket) => {
  const key = req.headers['sec-websocket-key'];
  const responseKey = generateWebSocketResponseKey(key);
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${responseKey}`,
    '\r\n',
  ];

  socket.write(headers.join('\r\n'));

  socket.on('data', (data) => {
    // Handle incoming WebSocket data
    console.log(`Received data`, data);
  });

  socket.on('end', () => {
    // Handle WebSocket connection closing
    console.log('WebSocket connection closed');
  });
};

function generateWebSocketResponseKey(key) {
  const magicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const sha1 = require('crypto').createHash('sha1');
  sha1.update(key + magicString);
  return sha1.digest('base64');
}

server.on('upgrade', (req: Request, socket: Socket) => {
  handleWebSocketUpgrade(req, socket);
});

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
