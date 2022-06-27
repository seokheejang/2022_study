import { strict as assert } from 'assert';
import sinon from 'ts-sinon';
import proxyquire from 'proxyquire';
import nock from 'nock';
import MetamaskController from './controller';
import { cloneDeep } from 'lodash';
import { NETWORK_TYPE_RPC } from '../../shared/constants/network';

const threeBoxSpies = {
  _registerUpdates: sinon.spy(),
  init: sinon.stub(),
  getLastUpdated: sinon.stub(),
  getThreeBoxSyncingState: sinon.stub().returns(true),
  restoreFromThreeBox: sinon.stub(),
  setShowRestorePromptToFalse: sinon.stub(),
  setThreeBoxSyncingPermission: sinon.stub(),
  turnThreeBoxSyncingOn: sinon.stub(),
};

class ThreeBoxControllerMock {
  private _registerUpdates;
  private init;
  private getLastUpdated;
  private getThreeBoxSyncingState;
  private restoreFromThreeBox;
  private setShowRestorePromptToFalse;
  private setThreeBoxSyncingPermission;
  private store;
  private turnThreeBoxSyncingOn;

  constructor() {
    this._registerUpdates = threeBoxSpies._registerUpdates;
    this.init = threeBoxSpies.init;
    this.getLastUpdated = threeBoxSpies.getLastUpdated;
    this.getThreeBoxSyncingState = threeBoxSpies.getThreeBoxSyncingState;
    this.restoreFromThreeBox = threeBoxSpies.restoreFromThreeBox;
    this.setShowRestorePromptToFalse =
      threeBoxSpies.setShowRestorePromptToFalse;
    this.setThreeBoxSyncingPermission =
      threeBoxSpies.setThreeBoxSyncingPermission;
    this.store = {
      subscribe: () => undefined,
      getState: () => ({}),
    };
    this.turnThreeBoxSyncingOn = threeBoxSpies.turnThreeBoxSyncingOn;
  }
}

const Controller = proxyquire('./controller', {
  './controllers/threebox': { default: ThreeBoxControllerMock },
}).default;

const currentNetworkId = '42';
const DEFAULT_LABEL = 'Account 1';
const TEST_SEED =
  'debris dizzy just program just float decrease vacant alarm reduce speak stadium';
const TEST_ADDRESS = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc';
const TEST_ADDRESS_2 = '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b';
const TEST_ADDRESS_3 = '0xeb9e64b93097bc15f01f13eae97015c57ab64823';
const TEST_SEED_ALT =
  'setup olympic issue mobile velvet surge alcohol burger horse view reopen gentle';
const TEST_ADDRESS_ALT = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';
const CUSTOM_RPC_URL = 'http://localhost:8545';
const CUSTOM_RPC_CHAIN_ID = '0x539';
const NOTIFICATION_ID = 'NHL8f2eSSTn9TKBamRLiU';

const firstTimeState = {
  config: {},
  NetworkController: {
    provider: {
      type: NETWORK_TYPE_RPC,
      rpcUrl: 'http://localhost:8545',
      chainId: '0x539',
    },
    networkDetails: {
      EIPS: {
        1559: false,
      },
    },
  },
  NotificationController: {
    notifications: {
      [NOTIFICATION_ID]: {
        id: NOTIFICATION_ID,
        origin: 'local:http://localhost:8086/',
        createdDate: 1652967897732,
        readDate: null,
        message: 'Hello, http://localhost:8086!',
      },
    },
  },
};

const browserPolyfillMock = {
  runtime: {
    id: 'fake-extension-id',
    onInstalled: {
      addListener: () => undefined,
    },
    onMessageExternal: {
      addListener: () => undefined,
    },
    getPlatformInfo: async () => 'mac',
  },
};

describe('MetaMaskController', () => {
  let metamaskController: any;
  const sandbox = sinon.createSandbox();
  beforeEach(async () => {
    metamaskController = new MetamaskController({
      encryptor: {
        encrypt(_: any, object: any) {
          this.object = object;
          return Promise.resolve('mock-encrypted');
        },
        decrypt() {
          return Promise.resolve(this.object);
        },
      },
      initState: cloneDeep(firstTimeState),
      platform: {
        showTransactionNotification: () => undefined,
        getVersion: () => 'foo',
      },
      browser: browserPolyfillMock,
      initLangCode: 'ko',
      infuraProjectId: 'foo',
    });

    // add sinon method spies
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndKeychain',
    );
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndRestore',
    );
  });

  afterEach(function () {
    nock.cleanAll();
    sandbox.restore();
  });

  it('sample', () => {
    expect(true).toBe(true);
  });

  describe('#getAccounts', () => {
    it('returns first address when dapp calls web3.eth.getAccounts', async function () {
      const password = 'a-fake-password';
      const result = await metamaskController.createNewVaultAndRestore(password, TEST_SEED);
      const accounts: string[] = result.keyrings[0].accounts;
      assert.equal(accounts.length, 1);
      assert.equal(accounts[0], '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc');
      /**
       * @TODO _baseProviderParams.getAccounts
       */
      // metamaskController.networkController._baseProviderParams.getAccounts
    });
  });

  describe('#createNewVaultAndKeychain', () => {
    it('can only create new vault on keyringController once', async () => {
      const selectStub = sandbox.stub(
        metamaskController,
        'selectFirstIdentity',
      );

      const password = 'a-fake-password';

      await metamaskController.createNewVaultAndKeychain(password);
      await metamaskController.createNewVaultAndKeychain(password);

      assert(
        metamaskController.keyringController.createNewVaultAndKeychain
          .calledOnce,
      );

      selectStub.reset();
    });
  });
});