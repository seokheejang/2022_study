import EventEmitter from 'events';
import { debounce } from 'ts-debounce';
import { Mutex } from 'async-mutex';
import { MILLISECOND } from '../../shared/constants/time';
import {
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  MESSAGE_TYPE,
  ///: END:ONLY_INCLUDE_IN
} from '../../shared/constants/app';
import {
  RestrictedMethods,
} from '../../shared/constants/permissions';
import {
  NOTIFICATION_NAMES,
  getCaveatSpecifications,
  getPermissionSpecifications,
  unrestrictedMethods,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications,
  ///: END:ONLY_INCLUDE_IN
} from './controllers/permissions'
import {
  ApprovalController,
  ControllerMessenger,
  PreferencesController,
  PermissionController,
} from '@metamask/controllers';
import KeyringController from 'eth-keyring-controller';
import ComposableObservableStore from './lib/ComposableObservableStore';
import {
  errorCodes as rpcErrorCodes,
  EthereumRpcError,
  ethErrors,
} from 'eth-rpc-errors';

type initState = any;

interface MetamaskControllerOptions {
  infuraProjectId: string;
  showUserConfirmation?: any;
  openPopup?: any;
  initState: initState;
  initLangCode: string;
  platform: any;
  notificationManager?: any;
  browser: any;
  getRequestAccountTabIds?: any;
  getOpenMetamaskTabsIds?: any;
  encryptor: any;
}

export default class MetamaskController extends EventEmitter {
  private readonly defaultMaxListeners;

  private sendUpdate;

  private privateSendUpdate: any;

  private opts: MetamaskControllerOptions;

  private extension;

  private platform;

  private notificationManager;

  private activeControllerConnections;

  private getRequestAccountTabIds;

  private getOpenMetamaskTabsIds;

  private controllerMessenger: any;

  private store;

  private connections: any;

  private createVaultMutex;

  public keyringController;

  // private preferencesController;

  private permissionController;

  private approvalController;

  private isClientOpenAndUnlocked: any;

  private _isClientOpen: any;

  /**
   * @param {Object} opts
   */
  constructor(opts: MetamaskControllerOptions) {
    console.log('MetamaskControllerOptions constructor');
    super();
    this.defaultMaxListeners = 20;

    this.sendUpdate = debounce(
      this.privateSendUpdate.bind(this),
      MILLISECOND * 200,
    );
    this.opts = opts;
    this.extension = opts.browser;
    this.platform = opts.platform;
    this.notificationManager = opts.notificationManager;
    const initState = opts.initState || {};
    const version = this.platform.getVersion();
    this.recordFirstTimeInfo(initState);

    // this keeps track of how many "controllerStream" connections are open
    // the only thing that uses controller connections are open metamask UI instances
    this.activeControllerConnections = 0;

    this.getRequestAccountTabIds = opts.getRequestAccountTabIds;
    this.getOpenMetamaskTabsIds = opts.getOpenMetamaskTabsIds;

    this.controllerMessenger = new ControllerMessenger();

    // observable state store
    this.store = new ComposableObservableStore({
      config: '',
      state: initState,
      controllerMessenger: this.controllerMessenger,
      persist: true,
    });

    // external connections by origin
    // Do not modify directly. Use the associated methods.
    this.connections = {};

    // lock to ensure only one vault created at once
    this.createVaultMutex = new Mutex();

    this.extension.runtime.onInstalled.addListener((details: any) => {
      if (details.reason === 'update' && version === '8.1.0') {
        this.platform.openExtensionInBrowser();
      }
    });

    // next, we will initialize the controllers
    // controller initialization order matters

    this.approvalController = new ApprovalController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'ApprovalController',
      }),
      showApprovalRequest: opts.showUserConfirmation,
    });
    
    // this.preferencesController = new PreferencesController({
    //   initState: initState.PreferencesController,
    //   initLangCode: opts.initLangCode,
    //   openPopup: opts.openPopup,
    //   network: this.networkController,
    //   provider: this.provider,
    //   migrateAddressBookState: this.migrateAddressBookState.bind(this),
    // });

    this.keyringController = new KeyringController({
      keyringTypes: [''],
      initState: initState.KeyringController,
      encryptor: opts.encryptor || undefined,
    });
    
    this.keyringController.memStore.subscribe((state: any) =>
        this._onKeyringControllerUpdate(state),
    );
    this.keyringController.on('unlock', () => this._onUnlock());
    this.keyringController.on('lock', () => this._onLock());

    const getIdentities = () => {
      /** 
       * @TODO 
       */
      //this.preferencesController.store.getState().identities;
    }
      

    this.permissionController = new PermissionController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'PermissionController',
        allowedActions: ([
          `${this.approvalController.name}:addRequest`,
          `${this.approvalController.name}:hasRequest`,
          `${this.approvalController.name}:acceptRequest`,
          `${this.approvalController.name}:rejectRequest`,
        ]) as never,
      }),
    state: initState.PermissionController,
    caveatSpecifications: getCaveatSpecifications({ getIdentities }),
    permissionSpecifications: {
      ...getPermissionSpecifications({
        getIdentities,
        getAllAccounts: this.keyringController.getAccounts.bind(
          this.keyringController,
        ),
        captureKeyringTypesWithMissingIdentities: (
          identities = {},
          accounts = [],
        ) => {
          const accountsMissingIdentities = accounts.filter(
            (address) => !identities[address],
          );
          const keyringTypesWithMissingIdentities = accountsMissingIdentities.map(
            (address) =>
              this.keyringController.getKeyringForAccount(address)?.type,
          );
    
          const identitiesCount = Object.keys(identities || {}).length;
    
          /**
           * @TODO AccountTracker
           */
          // const accountTrackerCount = Object.keys(
          //   this.accountTracker.store.getState().accounts || {},
          // ).length;

        },
      }),
      /**
       * @TODO what is `BEGIN:ONLY_INCLUDE_IN(flask)` ??
       */
      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      ...this.getSnapPermissionSpecifications(),
      ///: END:ONLY_INCLUDE_IN
    },
    unrestrictedMethods,
    });
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  /**
   * Constructor helper for getting Snap permission specifications.
   */
  getSnapPermissionSpecifications() {
    return {
      ...buildSnapEndowmentSpecifications(),
      ...buildSnapRestrictedMethodSpecifications({
        addSnap: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:add',
        ),
        clearSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:clearSnapState',
        ),
        getMnemonic: this.getPrimaryKeyringMnemonic.bind(this),
        /**
         * @TODO AppStateController
         */
        // getUnlockPromise: this.appStateController.getUnlockPromise.bind(
        //   this.appStateController,
        // ),
        getSnap: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:get',
        ),
        getSnapRpcHandler: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getRpcMessageHandler',
        ),
        getSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getSnapState',
        ),
        showConfirmation: (origin: any, confirmationData: any) =>
          this.approvalController.addAndShowApprovalRequest({
            origin,
            type: MESSAGE_TYPE.SNAP_CONFIRM,
            requestData: confirmationData,
          }),
        showNativeNotification: (origin: any, args: any) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showNativeNotification',
            origin,
            args.message,
          ),
        showInAppNotification: (origin: any, args: any) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showInAppNotification',
            origin,
            args.message,
          ),
        updateSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:updateSnapState',
        ),
      }),
    };
  }

  /**
   * A method for initializing storage the first time.
   *
   * @param {Object} initState - The default state to initialize with.
   * @private
   */
  recordFirstTimeInfo(initState: initState) {
    if (!('firstTimeInfo' in initState)) {
      const version = this.platform.getVersion();
      initState.firstTimeInfo = {
        version,
        date: Date.now(),
      };
    }
  }

  /**
   * Gets the permitted accounts for the specified origin. Returns an empty
   * array if no accounts are permitted.
   *
   * @param {string} origin - The origin whose exposed accounts to retrieve.
   * @param {boolean} [suppressUnauthorizedError] - Suppresses the unauthorized error.
   * @returns {Promise<string[]>} The origin's permitted accounts, or an empty
   * array.
   */
   async getPermittedAccounts(
    origin: any,
    { suppressUnauthorizedError = true } = {},
  ) {
    try {
      return await this.permissionController.executeRestrictedMethod(
        origin,
        RestrictedMethods.eth_accounts,
      );
    } catch (error: any) {
      if (
        suppressUnauthorizedError &&
        error.code === rpcErrorCodes.provider.unauthorized
      ) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Gets the mnemonic of the user's primary keyring.
   */
  getPrimaryKeyringMnemonic() {
    const keyring = this.keyringController.getKeyringsByType('HD Key Tree')[0];
    if (!keyring.mnemonic) {
      throw new Error('Primary keyring mnemonic unavailable.');
    }
    return keyring.mnemonic;
  }

  /**
   * Causes the RPC engines associated with all connections to emit a
   * notification event with the given payload.
   *
   * If the "payload" parameter is a function, the payload for each connection
   * will be the return value of that function called with the connection's
   * origin.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * @param {unknown} payload - The event payload, or payload getter function.
   */
  notifyAllConnections(payload: any) {
    const getPayload =
      typeof payload === 'function'
        ? (origin: any) => payload(origin)
        : () => payload;

    Object.keys(this.connections).forEach((origin) => {
      Object.values(this.connections[origin]).forEach(async (conn: any) => {
        if (conn.engine) {
          conn.engine.emit('notification', await getPayload(origin));
        }
      });
    });
  }

  // handlers

  /**
   * Handle a KeyringController update
   *
   * @param {Object} state - the KC state
   * @returns {Promise<void>}
   * @private
   */
   async _onKeyringControllerUpdate(state: any) {
    const { keyrings } = state;
    const addresses = keyrings.reduce(
      (acc: any, { accounts }: any) => acc.concat(accounts),
      [],
    );

    if (!addresses.length) {
      return;
    }

    // Ensure preferences + identities controller know about all addresses
    // this.preferencesController.syncAddresses(addresses);
    // this.accountTracker.syncWithAddresses(addresses);
  }

  /**
   * Handle global application unlock.
   * Notifies all connections that the extension is unlocked, and which
   * account(s) are currently accessible, if any.
   */
  _onUnlock() {
    this.notifyAllConnections(async (origin: any) => {
      return {
        method: NOTIFICATION_NAMES.unlockStateChanged,
        params: {
          isUnlocked: true,
          accounts: await this.getPermittedAccounts(origin),
        },
      };
    });

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'unlock'
    // event of the MetaMaskController itself.
    this.emit('unlock');
  }

  /**
   * Handle global application lock.
   * Notifies all connections that the extension is locked.
   */
  _onLock() {
    this.notifyAllConnections({
      method: NOTIFICATION_NAMES.unlockStateChanged,
      params: {
        isUnlocked: false,
      },
    });

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'lock'
    // event of the MetaMaskController itself.
    this.emit('lock');
  }

  // /**
  //  * Handle memory state updates.
  //  * - Ensure isClientOpenAndUnlocked is updated
  //  * - Notifies all connections with the new provider network state
  //  *   - The external providers handle diffing the state
  //  *
  //  * @param newState
  //  */
  // _onStateUpdate(newState: any) {
  //   this.isClientOpenAndUnlocked = newState.isUnlocked && this._isClientOpen;
  //   this.notifyAllConnections({
  //     method: NOTIFICATION_NAMES.chainChanged,
  //     params: this.getProviderNetworkState(newState),
  //   });
  // }

}