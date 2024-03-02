export const SOCKET_EVENTS = {
  UPDATE_PLAYER: 'update_player',
  JOIN_LOBBY: 'join_lobby',
  LEAVE_LOBBY: 'leave_lobby',
  LOBBY_PLAYERS: 'lobby_players',
  ACKNOWLEDGMENT: 'acknowledgment',
  MATCH_START: 'match_start',
} as const;

export const SOCKET_ROOMS = {
  LOBBY: 'lobby',
} as const;
