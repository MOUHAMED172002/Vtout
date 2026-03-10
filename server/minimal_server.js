const express = require('express');
const app = express();
app.get('/ping', (req, res) => res.send('pong'));
app.listen(3001, () => console.log('Minimal server on 3001'));
