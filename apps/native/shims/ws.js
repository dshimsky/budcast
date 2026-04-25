const NativeWebSocket = global.WebSocket;

class MissingWebSocket {
  constructor() {
    throw new Error("BudCast native expected a global WebSocket runtime.");
  }
}

const WebSocketShim = NativeWebSocket ?? MissingWebSocket;

module.exports = WebSocketShim;
module.exports.default = WebSocketShim;
