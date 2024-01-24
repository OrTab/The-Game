const hostname = '127.0.0.1';
const port = 4001;
import { noDep } from '@or-tab/my-server';
import { Request } from '@or-tab/my-server/lib/dist/types/types';
import type { Socket } from 'net';
import { handleWebSocketUpgrade } from './services/socket/utils';

const { app, server } = noDep();

app.enableCorsForOrigins({ 'http://localhost:4000': ['*'] });

server.on('upgrade', (req: Request, socket: Socket) => {
  handleWebSocketUpgrade(req, socket);
});

server.listen(port, hostname);
server.on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
