//import { KeyringController, Vault } from 'eth-keyring-controller';
import KeyringController from 'eth-keyring-controller';

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

        const accounts: string = await keyringObj.getAccounts();
        console.log("account", accounts);
        if (accounts.length > 0) {
            vault = await keyringObj.fullUpdate();
        } else {
            vault = await keyringObj.createNewVaultAndKeychain(password);
            console.log(`accounts.length[${accounts.length}], createNewVaultAndKeychain flow`);
        }
        
        console.log("vault", vault);
        console.log("vault.keyrings.accounts", vault.keyrings[0].accounts);
        
    } catch (e) {
        console.log('setupController:', e);
    }
}

initialize()