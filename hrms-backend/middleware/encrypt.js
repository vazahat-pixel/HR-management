const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.AADHAAR_ENCRYPTION_KEY || 'default_key';

const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (cipherText) => {
    try {
        if (!cipherText) return cipherText;
        const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || cipherText; // Return original if decryption yields empty string
    } catch (error) {
        // console.error('Decryption error:', error.message);
        return cipherText; // Return original text if decryption fails
    }
};

const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return '';
    const decrypted = decrypt(aadhaar);
    if (decrypted.length >= 4) {
        return 'XXXX-XXXX-' + decrypted.slice(-4);
    }
    return decrypted;
};

const maskPan = (pan) => {
    if (!pan) return '';
    const decrypted = decrypt(pan);
    if (decrypted.length >= 4) {
        return 'XXXXXX' + decrypted.slice(-4);
    }
    return decrypted;
};

module.exports = { encrypt, decrypt, maskAadhaar, maskPan };
