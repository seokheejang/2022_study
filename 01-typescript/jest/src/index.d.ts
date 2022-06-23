declare module 'controller' {
  global {
    type Keyring = string;
  }
  
  export default class KeyringController {
    constructor(type: Keyring);

    getKeyringType(): string;
    
  }
}

// export as namespace controller;
// export = controller;

// declare namespace controller {
//   type Keyring = string;
  
//   class KeyringController {
//     constructor(type: Keyring);

//     getKeyringType(): string;
    
//   }
// }