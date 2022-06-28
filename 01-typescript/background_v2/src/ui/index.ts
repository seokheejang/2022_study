import * as actions from './store/actions';

export default function launchMetamaskUi(opts: any, cb: any) {
  const { backgroundConnection } = opts;
  actions._setBackgroundConnection(backgroundConnection);
  // check if we are unlocked first
  backgroundConnection.getState(function (err: any, metamaskState: any) {
    if (err) {
      cb(err, metamaskState);
      return;
    }
    startApp(metamaskState, backgroundConnection, opts).then((store: any) => {
      //setupDebuggingHelpers(store);
      cb(null, store);
    });
  });
}

async function startApp(metamaskState: any, backgroundConnection: any, opts: any) {
  console.log('launchMetamaskUi: startApp: Start!')
}