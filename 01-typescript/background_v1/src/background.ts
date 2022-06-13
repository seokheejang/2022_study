import KeyringController from 'eth-keyring-controller';

export async function initialize() {
    console.log("background: initialize");
    await setupController();
};

async function setupController() {
    console.log("background: setupController");

    const keyringObj = new KeyringController({
        //keyringTypes: additionalKeyrings,
        initState: {},
        encryptor: undefined,
    });
    console.log("keyringObj", keyringObj)
}

initialize()