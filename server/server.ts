const hostname = '127.0.0.1';
const port = 4000;
import { app, server } from '@or-tab/my-server';
app.enableCorsForOrigins(['http://localhost:4001', 'https://localhost:4001']);

// const net = require('net')

// const client = net.createConnection({ port: 4001 }, () => {
//     // 'connect' listener.
//     console.log('connected to server!');
//     client.write('world!\r\n');
// });

// client.on('data', (data) => {
//     console.log(data.toString());
// })

app.get('/', (req, res) => res.send({ msg: 'hey from server' }));

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

server.on('upgrade', (req, socket) => {
  console.log(req.headers);
  console.log(req.headers.upgrade === 'websocket');
});
