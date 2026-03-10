const crypto = require('crypto');
try {
    console.log("UUID:", crypto.randomUUID());
} catch (e) {
    console.error("crypto.randomUUID failed:", e.message);
}
