const fs = require('fs');
const https = require('https');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const ip = JSON.parse(data).ip;
    const env = `NEXT_PUBLIC_API_URL=http://${ip}:8086\n`;
    fs.writeFileSync('.env.local', env);
    console.log(`✅ API URL set to: http://${ip}:8086`);
  });
}).on('error', () => {
  console.log('⚠️ Could not get public IP, using localhost');
  fs.writeFileSync('.env.local', 'NEXT_PUBLIC_API_URL=http://localhost:8086\n');
});
