
from algosdk.v2client.algod import AlgodClient
from algosdk.future.transaction import wait_for_confirmation


def send_and_wait(algodClient: AlgodClient, signed_txn):
    """Sends a signed transaction, waits for its confirmation, and prints the result"""
    try:
        txid = algodClient.send_transaction(signed_txn)
        # print(f"Sent signed transaction with txID: {txid}")
        # Wait for the transaction to be confirmed
        confirmed_txn = wait_for_confirmation(algodClient, txid, 4)
        # print(f"Transaction information: {json.dumps(confirmed_txn, indent=2)}")
        return confirmed_txn
    except Exception as err:
        print(err)