import KeyringController from 'eth-keyring-controller';
import seedPhraseVerifier from './lib/seed-phrase-verifier';

export async function initialize() {
    console.log("background: initialize");
    await setupController();
};

async function setupController() {
    try {
        console.log("background: setupController");
        
        const password = '1234';
        const encryptor = {
            encrypt(): Promise<string> {
                return Promise.resolve('encrypted!');
              },
            decrypt() {
                return Promise.resolve({ foo: 'bar' });
            },
        }
        console.log("KeyringController", typeof KeyringController, KeyringController);

        const keyringObj = new KeyringController({ 
            keyringTypes: '',
            initState: {},
            encryptor: encryptor,
        });
        console.log("keyringObj", keyringObj);
    
        let vault: Vault;
        const accounts = await keyringObj.getAccounts();
        if (accounts.length > 0) {
            vault = await keyringObj.fullUpdate();
        } else {
            vault = await keyringObj.createNewVaultAndKeychain(password);
            console.log(`accounts.length[${accounts.length}], createNewVaultAndKeychain flow`);
        }
        console.log("vault", vault);
        const address: string = vault.keyrings[0].accounts;
        console.log("vault.keyrings.accounts", address);

        /**
         * @TODO keyring, serialize, buffer type ...
         */
        const primaryKeyring = keyringObj.getKeyringsByType('HD Key Tree')[0];
        if (!primaryKeyring) {
            throw new Error('MetamaskController - No HD Key Tree found');
        }
        console.log("primaryKeyring",primaryKeyring)
        const serialized = await primaryKeyring.serialize();
        const seedPhraseAsBuffer = Buffer.from(serialized.mnemonic);

        console.log("primaryKeyring.mnemonic", seedPhraseAsBuffer);

        const primaryAccounts = await primaryKeyring.getAccounts();
        let seedPhraseMnemonic: any;
        if (primaryAccounts.length < 1) {
            throw new Error('MetamaskController - No primaryAccounts found');
        }
        try {
            await seedPhraseVerifier.verifyAccounts(primaryAccounts, seedPhraseAsBuffer);
            //return Array.from(seedPhraseAsBuffer.values());
            seedPhraseMnemonic = seedPhraseAsBuffer.values();
        } catch (err) {
            console.log("seedPhraseVerifier", err);
        throw err;
        }
        console.log("seedPhraseMnemonic", seedPhraseMnemonic);



        
    } catch (e) {
        console.log('setupController:', e);
    }
}

initialize();