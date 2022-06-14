import KeyringController from 'eth-keyring-controller';

export async function initialize() {
    console.log("background: initialize");
    await setupController();
};

async function setupController() {
    try {
        console.log("background: setupController");
        
        const password = '1234';
        /**
         * @TODO Promise type
         */
        const encryptor = {
            encrypt(password: string, object: unknown): Promise<string> {
                return new Promise('encrypted!');
              },
            decrypt(password: string, encryptedString: string) {
                return new Promise({ foo: 'bar' });
            },
        }

        const keyringObj: KeyringController = new KeyringController({
            keyringTypes: '',
            initState: {},
            encryptor: undefined,
        });
        console.log("keyringObj", keyringObj);
    
        let vault: unknown;
    
        const accounts: string = await keyringObj.getAccounts();
        console.log("account", accounts);
        if (accounts.length > 0) {
            vault = await keyringObj.fullUpdate();
        } else {
            vault = await keyringObj.createNewVaultAndKeychain(password);
        }
        
        console.log("vault", vault);
    } catch (e) {
        console.log('setupController:', e);
    }
}

initialize()