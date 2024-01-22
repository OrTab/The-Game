const hostname = '127.0.0.1';
const port = 4001;
import { noDep } from '@or-tab/my-server';
import { Request } from '@or-tab/my-server/lib/dist/types/types';
const { app, server } = noDep();
import type { Socket } from 'net';
import { randomUUID } from 'crypto';

app.enableCorsForOrigins({ 'http://localhost:4000': ['*'] });

const MSB = 0b10000000;
const FRAME_TYPE_BY_OPCODE = {
  0x0: 'CONTINUATION_FRAME',
  0x1: 'TEXT_FRAME',
  0x2: 'BINARY_FRAME',
  0x8: 'CLOSE_FRAME',
  0x9: 'PING_FRAME',
  0xa: 'PONG_FRAME',
} as const;

const extractDataFromFrame = (frameBuffer: Buffer) => {
  const firstByte = frameBuffer.readUint8(0);
  const secondsByte = frameBuffer.readUint8(1);
  // const FIN = firstByte & MSB;
  // const RSV1 = firstByte & 0b01000000;
  // const RSV2 = firstByte & 0b0010000;
  // const RSV3 = firstByte & 0b0001000;
  const mask = secondsByte & MSB;
  const payloadLength = secondsByte & 0b01111111;
  const opCode = firstByte & 0b00001111;
  const frameType = FRAME_TYPE_BY_OPCODE[opCode];
  if (frameType !== 'TEXT_FRAME') {
    return;
  }
  let actualPayloadLength;
  let lastByte = 2;
  let maskKey;
  if (payloadLength <= 125) {
    actualPayloadLength = payloadLength;
  } else if (payloadLength === 126) {
    lastByte += 2;
    actualPayloadLength = frameBuffer.subarray(2, lastByte).readUInt16BE();
  } else if (payloadLength === 127) {
    lastByte += 8;
    actualPayloadLength = frameBuffer.subarray(2, lastByte).readBigUInt64BE();
  }

  if (mask) {
    maskKey = frameBuffer.subarray(lastByte, lastByte + 4);
    lastByte += 4;
  }

  const payload = frameBuffer.subarray(
    lastByte,
    lastByte + actualPayloadLength
  );
  const finalPayload = Buffer.alloc(payload.length);

  for (let i = 0; i < payload.length; i++) {
    let value = payload[i];
    if (maskKey) {
      //@ts-ignore
      value = payload[i] ^ maskKey[i % 4];
    }
    //@ts-ignore
    finalPayload[i] = value;
  }
  const data = JSON.parse(finalPayload.toString());
  return data;
};

export const handleWebSocketUpgrade = (req: Request, socket: Socket) => {
  if (req.headers.origin && !app.authorizedOrigins[req.headers.origin]) {
    // Send a 401 Unauthorized status code
    const response = 'HTTP/1.1 401 Unauthorized\r\n\r\n';
    socket.write(response);
    socket.end();
    socket.destroy();
    return;
  }
  console.log('New Socket');
  const key = req.headers['sec-websocket-key'];
  const responseKey = generateWebSocketResponseKey(key);
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${responseKey}`,
    '\r\n',
  ];
  socket['id'] = randomUUID();
  socket.write(headers.join('\r\n'));

  socket.on('data', (frameBuffer) => {
    const data = extractDataFromFrame(frameBuffer);
    console.log(data);
  });

  socket.on('end', () => {
    // Handle WebSocket connection closing
    console.log('WebSocket connection closed');
    socket.end();
    socket.destroy();
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
