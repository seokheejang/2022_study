const { 
    generateECCKeyPair, 
    generateRSAKeyPair, 
    exportFile, 
    importFile } = require('../libs/libOpenPGPKeyFile.js');
const { 
    getPublicKey,
    getPriavteKey,
    fileEncrypt,
    fileDecrypt } = require('../libs/libOpenPGPGeneral.js');

let category = undefined;

const proc_generateKeyPair = async () => {
    try {
        if (process.argv.length != 7) {
            throw new Error("Invalid Parameters!");
        }
        console.log(`.................name: [${process.argv[3]}]`);
        console.log(`................email: [${process.argv[4]}]`);
        console.log(`.............password: [${process.argv[5]}]`);
        console.log(`.................type: [${process.argv[6]}]`);
        const name = process.argv[3];  // test data : jang
        const email = process.argv[4]; // test data : jang@dkargo.io
        const pass = process.argv[5];  // test data : jang123
        const type = process.argv[6];  // test data : ECC,RSA

        if (type === 'ECC') {
            await generateECCKeyPair(name, email, pass);
        } else if (type === 'RSA') {
            await generateRSAKeyPair(name, email);
        } else {
            console.log(`Invalid Type [${type}]`)
        }
        return true;
    } catch (err) {
        console.log(`proc_generateKeyPair error: ${err}`);
        return false;
    }
}

const proc_encryptFile = async () => {
    try {
        if (process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        console.log(`.................file: [${process.argv[3]}]`);
        const file = process.argv[3];  // test data : ../data/hello.txt
        
        const publicKeyArmored = await importFile('ECC_PublicKeyArmor.key');
        const privateKeyArmored  = await importFile('ECC_PrivateKeyArmor.key');
        const pass = 'jang123';  // test data : jang123
        const message = await importFile(file); 
        const result = await fileEncrypt(publicKeyArmored, privateKeyArmored, pass, message);
        await exportFile(result, `${file}.pgp`);
        return true;
    } catch (err) {
        console.log(`proc_encryptFile error: ${err}`);
        return false;
    }
}

const proc_decryptFile = async () => {
    try {
        if (process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        console.log(`.................file: [${process.argv[3]}]`);
        const file = process.argv[3];  // test data : ../data/hello.txt.pgp
        const publicKeyArmored = await importFile('ECC_PublicKeyArmor.key');
        const privateKeyArmored  = await importFile('ECC_PrivateKeyArmor.key');
        const pass = 'jang123';  // test data : jang123
        const publicKey = await getPublicKey(publicKeyArmored);
        const privateKey = await getPriavteKey(privateKeyArmored, pass);
        const encrypted = await importFile(file); 
        const result = await fileDecrypt(publicKey, privateKey, encrypted);
        console.log(result);
        return true;
    } catch (err) {
        console.log(`proc_decryptFile error: ${err}`);
        return false;
    }
}

(async () => {
    try {
        if (process.argv.length < 3) {
            throw new Error("Invalid Parameters");
        }
        category = process.argv[2];
        switch (category) {
            case "newKey": {await proc_generateKeyPair(process.argv[3], process.argv[4], process.argv[5], process.argv[6]);break;}
            case "encrypt": {await proc_encryptFile(process.argv[3]);break;}
            case "decrypt": {await proc_decryptFile(process.argv[3]);break;}
        }
        process.exit(0);
    } catch (err) {
        console.log(`main error: ${err}`);
        process.exit(1);
    }
})();