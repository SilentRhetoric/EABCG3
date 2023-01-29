import React from "react";
import {
  useWallet,
  NODE_TOKEN,
  NODE_SERVER,
  NODE_PORT,
} from "@txnlab/use-wallet";
import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(NODE_TOKEN, NODE_SERVER, NODE_PORT);
// const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "")
const APP_INDEX  = 1
const VOTER_TOKEN = 1

export default function Wallet() {
  const [status, setStatus] = React.useState<string | null>();

  const { activeAccount, signTransactions, sendTransactions } = useWallet();

  const sendTransaction = async (
    from?: string,
    to?: string,
    amount?: number
  ) => {
    setStatus(null);

    if (!from || !to || !amount) {
      throw new Error("Missing transaction params.");
    }

    const params = await algodClient.getTransactionParams().do();

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount,
      suggestedParams: params,
    });

    const encodedTransaction = algosdk.encodeUnsignedTransaction(transaction);

    setStatus("Waiting to be signed...");

    const signedTransactions = await signTransactions([encodedTransaction]);

    setStatus("Sending...");

    const { id } = await sendTransactions(signedTransactions);

    setStatus("Success!");

    console.log("Successfully sent transaction. Transaction ID: ", id);
  };

  // Sends a vote transaction to the app
  const sendVoteTransaction = async (
    from?: string,
    vote?: string
  ) => {
    setStatus(null);

    if (!from || !vote) {
      throw new Error("Missing transaction params.");
    }

    const params = await algodClient.getTransactionParams().do();

    const transaction = algosdk.makeApplicationCallTxnFromObject({
      from,
      appIndex: APP_INDEX,
      foreignAssets: [VOTER_TOKEN],
      appArgs: [
        new Uint8Array(Buffer.from(vote))
      ],
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
    });

    const encodedTransaction = algosdk.encodeUnsignedTransaction(transaction);

    setStatus("Waiting to be signed...");

    const signedTransactions = await signTransactions([encodedTransaction]);

    setStatus("Sending...");

    const { id } = await sendTransactions(signedTransactions);

    setStatus("Success!");

    console.log("Successfully sent transaction. Transaction ID: ", id);
  };


  if (!activeAccount) {
    return <p>Connect an account first.</p>;
  }

  return (
    <div>
      {/* <button
        onClick={() =>
          sendTransaction(activeAccount?.address, activeAccount?.address, 1000)
        }
        className="button"
      >
        Sign and send transactions
      </button> */}
      <h1>Use this button to send a vote to the smart contract!</h1>
      <button
        onClick={() =>
          sendVoteTransaction(activeAccount?.address, "yes")
        }
        className="button"
      >
        Sign and send "Yes" vote
      </button>
      {status && <h5>{status}</h5>}
    </div>
  );
}
