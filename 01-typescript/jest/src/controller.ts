//import KeyringController from 'controller';

type Keyring = string;

export function init() {
  let type: Keyring;
  let keyringController: Controller;

  type = 'Simeple keyring';
  keyringController = new Controller(type);

  let result = keyringController.getKeyringType();
  console.log('result', result);
};

export class Controller { 
  private type: Keyring
  constructor(type: Keyring) {
    this.type = type;
  };

  getKeyringType(): Keyring {
    return this.type;
  }
}

//init();