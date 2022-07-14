const axios = require("axios");
const Common = require("@ethereumjs/common").default;
const { FeeMarketEIP1559Transaction } = require("@ethereumjs/tx");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });

const envPrivKey = `${process.env.PRIVATE_KEY}`;
const infuraId = `${process.env.INFURA_PROJECT_ID}`;
const infuraUrl = `https://ropsten.infura.io/v3/${infuraId}`;

const payloadProto = {
  jsonrpc: "2.0",
  method: "",
  params: [],
  id: 1,
};

(async () => {
  const addressFrom = "0xBeB578AB22907B7EA88ea646bf5bEDF6a92DbDC3";
  // Exclude 0x at the beginning of the private key
  const privKey = Buffer.from(`${envPrivKey}`, "hex");
  const addressTo = "0xE18035BF8712672935FDB4e5e431b1a0183d2DFC";
  const valueInEther = "0x16345785D8A0000"; // 0.1 ETH = 100000000000000000 Wei
  //const valueInEther = "0x8AC7230489E80000"; // 10 ETH

  // Get the address transaction count in order to specify the correct nonce
  const payloadCount = Object.assign({}, payloadProto, {
    method: "eth_getTransactionCount",
    params: [addressFrom, "latest"],
  });
  var resp = await axios({
    url: infuraUrl,
    method: "POST",
    data: payloadCount,
    headers: { "Content-Type": "application/json" },
  });
  const txnCount = resp.data.result;

  // Estimate the tx gas limit
  const payloadLimit = Object.assign({}, payloadProto, {
    method: "eth_estimateGas",
    params: [{ from: addressFrom, to: addressTo, value: valueInEther }],
  });
  resp = await axios({
    url: infuraUrl,
    method: "POST",
    data: payloadLimit,
    headers: { "Content-Type": "application/json" },
  });
  const limit = resp.data.result;

  // Create the EIP-1559 transaction object
  var txObject = {
    nonce: txnCount,
    gasLimit: limit,
    to: addressTo,
    value: valueInEther,
    //maxFeePerGas: "0x2E90EDD000", // 200000000000 Wei
    maxPriorityFeePerGas: "0x77359400", // 2000000000 Wei
    chainId: 3,
    type: 0x2,
  };

  // Sign the transaction with the private key
  var chain = new Common({ chain: "ropsten", hardfork: "london" });
  const tx = FeeMarketEIP1559Transaction.fromTxData(txObject, { chain });
  const signedTransaction = tx.sign(privKey);

  //Convert to raw transaction string
  var serializedTx = signedTransaction.serialize();
  var rawTxHex = "0x" + serializedTx.toString("hex");

  // log raw transaction data to the console in case you need it for troubleshooting
  console.log("Raw transaction data: " + rawTxHex);

  // Send the raw transaction
  const payloadTx = Object.assign({}, payloadProto, {
    method: "eth_sendRawTransaction",
    params: [rawTxHex],
  });
  resp = await axios({
    url: infuraUrl,
    method: "POST",
    data: payloadTx,
    headers: { "Content-Type": "application/json" },
  });
  const txhash = resp.data;
  console.log(txhash);
})();
