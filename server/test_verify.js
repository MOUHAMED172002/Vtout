import http from 'http';

const data = JSON.stringify({ phone: '0194199020', code: '123456' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/whatsapp/verify-code',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', error => console.error(`Error: ${error.message}`));
req.write(data);
req.end();
