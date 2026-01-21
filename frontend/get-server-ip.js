const fs = require('fs');

// Sử dụng domain thay vì IP động
const env = `NEXT_PUBLIC_API_URL=https://api.snet.io.vn\nNEXT_PUBLIC_WS_URL=wss://api.snet.io.vn\n`;
fs.writeFileSync('.env.local', env);
console.log(`✅ API URL set to: https://api.snet.io.vn`);
console.log(`✅ WebSocket URL set to: wss://api.snet.io.vn`);
