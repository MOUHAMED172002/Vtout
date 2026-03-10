const fs = require('fs');
try {
    const content = fs.readFileSync('debug_server.log', 'utf16le');
    console.log(content.slice(-2000));
} catch (e) {
    console.error(e);
}
