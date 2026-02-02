const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

/**
 * Encrypts a string
 * @param {string} text 
 * @returns {string} Encrypted text in hex format
 */
const encrypt = (text) => {
    if (!text) return text;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

/**
 * Decrypts a hex string
 * @param {string} encryptedText 
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;
    // Check if it's potentially encrypted (hex string of reasonable length)
    // Basic check to prevent errors with existing unencrypted data
    if (!/^[0-9a-fA-F]+$/.test(encryptedText) || encryptedText.length < 3) {
        return encryptedText;
    }

    try {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // If decryption fails, return original (might be old unencrypted data)
        return encryptedText;
    }
};

/**
 * Creates a SHA-256 hash for search/lookups
 * @param {string} text 
 * @returns {string} Hash
 */
const createHash = (text) => {
    if (!text) return text;
    return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
};

module.exports = { encrypt, decrypt, createHash };
