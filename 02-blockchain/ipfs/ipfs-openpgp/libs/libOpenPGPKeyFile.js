const openpgp = require('openpgp');
const fs = require('fs');
const path = require('path');

const exportFile = async (keyBlcok, fileName) => {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        fs.writeFileSync(filePath, keyBlcok);
    } catch (err) {
        console.log(`exportFile error: ${err}`);
        return null;
    }
}

const importFile = async (fileName) => {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        console.log(filePath)
        const keyFile = fs.readFileSync(filePath).toString();
        return keyFile;
    } catch (err) {
        console.log(`exportFile error: ${err}`);
        return null;
    }
}

const generateECCKeyPair = async (name, email, pass) => {
    try {
        const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{ name: name, email: email }], // you can pass multiple user IDs
            passphrase: pass, // protects the private key
            format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
        });
    
        console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

        await exportFile(privateKey, 'ECC_PrivateKeyArmor.key');
        await exportFile(publicKey, 'ECC_PublicKeyArmor.key');
        await exportFile(revocationCertificate, 'ECC_RevocationCertKeyArmor.key');
        return true;
    } catch (err) {
        console.log(`generateKeyPair error: ${err}`);
        return null;
    }
}

const generateRSAKeyPair = async (name, email, pass) => {
    try {
        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'rsa', // Type of the key
            rsaBits: 4096, // RSA key size (defaults to 4096 bits)
            userIDs: [{ name: name, email: email }], // you can pass multiple user IDs
            passphrase: pass // protects the private key
        });

        console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

        await exportFile(privateKey, 'RSA_PrivateKey.key');
        await exportFile(publicKey, 'RSA_PublicKey.key');
        return true;
    } catch (err) {
        console.log(`generateKeyPair error: ${err}`);
        return null;
    }
}

module.exports = {
    generateECCKeyPair,
    generateRSAKeyPair,
    exportFile,
    importFile
}