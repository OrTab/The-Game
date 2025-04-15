import { Request } from '@or-tab/my-server/lib/dist/types/types';
import { FRAME_TYPE_BY_OPCODE, MSB } from './constants';
import { randomUUID } from 'crypto';
import { app } from '@or-tab/my-server/lib/dist/setup/app';
import socketService from './socketService';
import { Socket } from './types';

export const extractDataFromFrame = (frameBuffer: Buffer) => {
  const firstByte = frameBuffer.readUint8(0);
  const secondsByte = frameBuffer.readUint8(1);
  // const FIN = firstByte & MSB;
  // const RSV1 = firstByte & 0b01000000;
  // const RSV2 = firstByte & 0b0010000;
  // const RSV3 = firstByte & 0b0001000;
  const mask = secondsByte & MSB;
  const payloadLength = secondsByte & 0b01111111;
  const opCode = firstByte & 0b00001111;
  const frameType =
    FRAME_TYPE_BY_OPCODE[<keyof typeof FRAME_TYPE_BY_OPCODE>opCode];
  if (frameType === 'CLOSE_FRAME') {
    return [true, null];
  }

  if (frameType !== 'TEXT_FRAME') {
    return [false, null];
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
    lastByte + Number(actualPayloadLength)
  );
  const finalPayload = Buffer.alloc(payload.length);

  for (let i = 0; i < payload.length; i++) {
    let value = payload[i];
    if (maskKey) {
      value = payload[i] ^ maskKey[i % 4];
    }
    finalPayload[i] = value;
  }
  const data = JSON.parse(finalPayload.toString());
  return [false, data];
};

const generateWebSocketResponseKey = (key: string) => {
  const salt = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const sha1 = require('crypto').createHash('sha1');
  sha1.update(key + salt);
  return sha1.digest('base64');
};

export const getWebSocketFrame = (data: unknown) => {
  const stringifyData = JSON.stringify(data);
  const payloadBuffer = Buffer.from(stringifyData, 'utf-8');
  const actualPayloadLength = payloadBuffer.byteLength;
  let headerBuffer;
  if (actualPayloadLength < 126) {
    headerBuffer = Buffer.alloc(2);
    headerBuffer.writeUInt8(actualPayloadLength, 1);
  } else if (actualPayloadLength < 65536) {
    headerBuffer = Buffer.alloc(4);
    const bytesLength = 0b01111110;
    headerBuffer.writeUInt8(bytesLength, 1);
    headerBuffer.writeUint16BE(actualPayloadLength, 2);
  } else {
    headerBuffer = Buffer.alloc(10);
    const bytesLength = 0b01111111;
    headerBuffer.writeUInt8(bytesLength, 1);
    headerBuffer.writeBigUInt64BE(BigInt(actualPayloadLength), 2);
  }
  headerBuffer.writeUInt8(0b10000001, 0);

  return Buffer.concat([headerBuffer, payloadBuffer]);
};

const handleResponse = (key: string, socket: Socket) => {
  const responseKey = generateWebSocketResponseKey(key);
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${responseKey}`,
    '\r\n',
  ];
  socket.write(headers.join('\r\n'), 'ascii');
};

export const handleWebSocketUpgrade = (req: Request, socket: Socket) => {
  const key = req.headers['sec-websocket-key'];
  if (
    !key ||
    (req.headers.origin && !app.authorizedOrigins[req.headers.origin])
  ) {
    // Send a 401 Unauthorized status code
    const response = 'HTTP/1.1 401 Unauthorized\r\n\r\n';
    socket.write(response);
    socket.end();
    socket.destroy();
    return;
  }
  socketService.addSocket(socket);
  handleResponse(key, socket);
};

export const addMetaDatoSocket = (socket: Socket) => {
  socket.id = randomUUID();
};
