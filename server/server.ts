const hostname = '127.0.0.1';
const port = 4000;
import { noDep } from '@or-tab/my-server';
const { app, server } = noDep();

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

app.get('/:nice', (req, res) => {
  const { nice } = req.params;
  res.send({
    msg: `Hey its the nice server that sends you the id - ${nice}`,
  });
});

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

server.on('upgrade', (req, socket) => {
  console.log(req.headers);
  console.log(req.headers.upgrade === 'websocket');
});
