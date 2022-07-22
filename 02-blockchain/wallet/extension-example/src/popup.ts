import { BackgroundMessages } from "./messages";
import Messenger from "./Messenger";

window.onload = async () => {
  let craeteWallet = document.getElementById("craeteWallet");
  let getWalletInfo = document.getElementById("getWalletInfo");
  let contentWallet = document.querySelector(
    "#contentWallet"
  ) as HTMLTextAreaElement;
  let contentWalletInfo = document.querySelector(
    "#contentWalletInfo"
  ) as HTMLTextAreaElement;

  craeteWallet.addEventListener("click", async () => {
    try {
      const res = await Messenger.sendMessageToBackground(
        BackgroundMessages.SAY_HELLO_TO_BG,
        {
          message: "Hello form popup",
        }
      );
      contentWallet.value = res.message;
      console.log("craeteWallet response", res);
    } catch (err) {
      console.log("craeteWallet err", err);
    }
  });
  getWalletInfo.addEventListener("click", async () => {
    try {
      const res = await Messenger.sendMessageToBackground(
        BackgroundMessages.SAY_BYE_TO_BG,
        {
          message: "Hello form popup",
        }
      );
      contentWalletInfo.value = res.message;
      console.log("getWalletInfo response", res);
    } catch (err) {
      console.log("getWalletInfo err", err);
    }
  });
};
