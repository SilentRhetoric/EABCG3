import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { useWallet } from '@txnlab/use-wallet'
import algosdk, { encodeUint64, Transaction, TransactionSigner } from 'algosdk'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import NfdLookup from 'components/NfdLookup'
import useWalletBalance from 'hooks/useWalletBalance'
import { convertAlgosToMicroalgos } from 'utils'
import algodClient from 'lib/algodClient'
import * as fs from 'fs'
import { DAO } from './dao_client'

export default function Transact() {
  const { activeAddress, signTransactions, sendTransactions } = useWallet()

  const [algoAmount, setAlgoAmount] = useState<string>('')
  const [receiver, setReceiver] = useState<string>('')

  const { walletAvailableBalance } = useWalletBalance()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value

    // matches integers or floats up to 6 decimal places
    const regExp = /^\d+(?:\.\d{0,6})?$/gm

    if (amount !== '' && amount.match(regExp) === null) {
      return
    }

    setAlgoAmount(amount)
  }

  const hasSufficientBalance = useMemo(() => {
    const sendAmount = algoAmount === '' ? 0 : convertAlgosToMicroalgos(parseFloat(algoAmount))
    const availableBalance = convertAlgosToMicroalgos(parseFloat(walletAvailableBalance || '0'))

    const txnCost = sendAmount + 1000

    return availableBalance >= txnCost
  }, [algoAmount, walletAvailableBalance])

  const isValidRecipient = useMemo(() => {
    if (receiver === '') {
      return true
    }

    return algosdk.isValidAddress(receiver)
  }, [receiver])

  const renderValidationMessage = () => {
    if (hasSufficientBalance && isValidRecipient) {
      return null
    }

    const message = !hasSufficientBalance ? 'Insufficient balance' : 'Invalid recipient'

    return (
      <>
        <ExclamationCircleIcon className="mr-1.5 h-5 w-5 text-red-500" aria-hidden="true" />
        {message}
      </>
    )
  }

  async function signerPatch(txns: Transaction[]) {
    const bytesTxns = txns.map((t) => t.toByte())
    return await signTransactions(bytesTxns)
  }

  const sendTransaction = async () => {
    try {
      if (!activeAddress) {
        throw new Error('Wallet not connected')
      }

      const from = activeAddress
      const to = receiver === '' ? activeAddress : receiver
      const amount = algoAmount === '' ? 0 : convertAlgosToMicroalgos(parseFloat(algoAmount))

      const suggestedParams = await algodClient.getTransactionParams().do()

      const APP_INDEX = 156363831
      const VOTER_TOKEN = 156363775

      const appArgs = [
        Uint8Array.from(Buffer.from('vote')),
        encodeUint64(BigInt(156363775)),
        Uint8Array.from(Buffer.from('yes'))
      ]
      const transaction = algosdk.makeApplicationCallTxnFromObject({
        from,
        appIndex: APP_INDEX,
        foreignAssets: [VOTER_TOKEN],
        appArgs: appArgs,
        suggestedParams: suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC
      })

      // ABI STUFF
      // Read in the local contract.json file
      // const buff = fs.readFileSync('../../artifacts/contract.json')

      // // Parse the json file into an object, pass it to create an ABIContract object
      // const contract = new algosdk.ABIContract(JSON.parse(buff.toString()))

      // const commonParams = {
      //   appID: APP_INDEX,
      //   sender: activeAddress,
      //   suggestedParams: suggestedParams,
      //   signer: signerPatch
      // }

      // // Simple ABI Calls with standard arguments, return type
      // const comp = new algosdk.AtomicTransactionComposer()
      // comp.addMethodCall({
      //   method: contract.getMethodByName('vote'),
      //   methodArgs: [VOTER_TOKEN, 'yes'],
      //   ...commonParams
      // })
      // const results = comp.execute(algodClient, 2)
      // console.log((await results).txIDs)

      // BEAKER!
      const dao = new DAO({
        client: algodClient,
        signer: signerPatch,
        sender: activeAddress,
        appId: APP_INDEX
      })
      const result = await dao.vote({
        voter_token: BigInt(VOTER_TOKEN),
        vote: 'yes'
      })
      console.log(result.txID)

      // const encodedTransaction = algosdk.encodeUnsignedTransaction(transaction)

      // toast.loading('Waiting for user to sign...', { id: 'txn', duration: Infinity })

      // const signedTransactions = await signTransactions([encodedTransaction])

      // toast.loading('Sending transaction...', { id: 'txn', duration: Infinity })

      // const waitRoundsToConfirm = 4

      // const { id } = await sendTransactions(signedTransactions, waitRoundsToConfirm)

      // console.log(`Successfully sent transaction. Transaction ID: ${id}`)

      // toast.success('Transaction successful!', {
      //   id: 'txn',
      //   duration: 5000
      // })
    } catch (error) {
      console.error(error)
      toast.error('Transaction failed', { id: 'txn' })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendTransaction()
  }

  if (!activeAddress) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg lg:flex lg:flex-col">
      <div className="p-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Send</h3>
      </div>
      <div className="border-t border-gray-200 p-5 sm:p-0 lg:flex lg:flex-col lg:flex-1">
        <form
          onSubmit={handleSubmit}
          className="sm:divide-y sm:divide-gray-200 lg:flex lg:flex-col lg:flex-1"
        >
          {/* <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5 sm:px-6">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Amount
            </label>
            <div className="mt-1 sm:col-span-4 sm:mt-0">
              <div className="flex rounded-md shadow-sm max-w-md">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                  <input
                    type="text"
                    name="amount"
                    id="amount"
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    value={algoAmount}
                    onChange={handleAmountChange}
                    placeholder="0.000000 ALGO"
                  />
                </div>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  onClick={() => setAlgoAmount('')}
                >
                  Reset
                </button>
              </div>
            </div>
          </div> */}

          {/* <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5 sm:px-6">
            <label
              htmlFor="receiver"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Receiver
            </label>
            <div className="mt-1 sm:col-span-4 sm:mt-0">
              <NfdLookup
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm leading-5"
                value={receiver}
                onChange={(value) => setReceiver(value)}
                placeholder={activeAddress}
                ariaDescribedby="lookup-description"
              />
              <p className="mt-2 text-sm text-gray-500" id="lookup-description">
                Paste an address or search for an NFD
              </p>
            </div>
          </div> */}

          <div className="pt-5 sm:py-5 sm:px-6 lg:flex lg:flex-col lg:flex-1 lg:justify-center">
            <div className="flex items-center justify-between">
              <p className="flex items-center text-sm text-red-600">{renderValidationMessage()}</p>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:bg-sky-600"
                disabled={!activeAddress || !hasSufficientBalance || !isValidRecipient}
              >
                Sign and send vote Yes transaction
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
