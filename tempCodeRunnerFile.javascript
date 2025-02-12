const crypto = require('crypto');
const blacklistSecret = crypto.randomBytes(32).toString('hex');
console.log('Blacklist Encryption Secret:', blacklistSecret);
