export const MSB = 0b10000000;
export const FRAME_TYPE_BY_OPCODE = {
  0x0: 'CONTINUATION_FRAME',
  0x1: 'TEXT_FRAME',
  0x2: 'BINARY_FRAME',
  0x8: 'CLOSE_FRAME',
  0x9: 'PING_FRAME',
  0xa: 'PONG_FRAME',
} as const;
