const openpgp = require('openpgp');

const getPublicKey = async (publicKeyArmored) => {
    return await openpgp.readKey({ armoredKey: publicKeyArmored });
}

const getPriavteKey = async (privateKeyArmored, passphrase) => {
    return await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase
    });
}

const fileEncrypt = async (publicKeyArmored, privateKeyArmored, passphrase, message) => {
    try {
        const publicKey = await getPublicKey(publicKeyArmored);
        const privateKey = await getPriavteKey(privateKeyArmored, passphrase);
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: message }), // input as Message object
            encryptionKeys: publicKey,
            signingKeys: privateKey // optional
        });
        return encrypted;
    } catch (err) {
        console.log(`fileEncrypt error: ${err}`);
        return null;
    }
}

const fileDecrypt = async (publicKey, privateKey, encrypted) => {
    try {
        const message = await openpgp.readMessage({
            armoredMessage: encrypted // parse armored message
        });
        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            verificationKeys: publicKey, // optional
            decryptionKeys: privateKey
        });
        try {
            await signatures[0].verified; // throws on invalid signature
            console.log('Signature is valid');
            return decrypted;
        } catch (e) {
            throw new Error('Signature could not be verified: ' + e.message);
        }
    } catch (err) {
        console.log(`fileEncrypt error: ${err}`);
        return null;
    }
}

module.exports = {
    getPublicKey,
    getPriavteKey,
    fileEncrypt,
    fileDecrypt
}