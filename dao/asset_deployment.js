// when an asset is transferred it is considered minted

// Asset configuration for FT
    // Creator (required) - should use authentium acct for this
    // AssetName (optional, but recommended) - DAO Voting Token
    // UnitName (optional, but recommended) - DVT (DAO Voting Token)
    // Total (required) - 100
    // Decimals (required) - 0
    // DefaultFrozen (required) - set to "" so it can never be frozen
    // URL (optional) - points to pinned JSON metadata on IPFS (JSON metadata is stored offchain)
    // MetaDataHash (optional) - hash the content ID of the pinned JSON metadata URL, decode the hash to detemine if it gives correct CID
    // clawback = authentium manager acct

const algosdk = require("algosdk");

const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = '';

const MNEMONIC_CREATOR = "comfort anxiety nuclear citizen below airport leisure smooth public major rose worth mother stamp tribe bitter medal cotton wink wealth like wagon aware abandon witness"

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const creator = algosdk.mnemonicToSecretKey(MNEMONIC_CREATOR);

const submitToNetwork = async (signedTxn) => {
    let txn = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction :" + txn.txId);
    confirmedTxn = await algosdk.waitForConfirmation(algodClient, txn.txId, 4);
    console.log("Transaction " + txn.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    return confirmedTxn;
};

const getCreatedAsset = async (account, assetId) => {
    let accountInfo = await algodClient.accountInformation(account.addr).do();
    const asset = accountInfo["created-assets"].find((asset) => {
        return asset["index"] == assetId;
    });
};

const createFT = async () => {
    const assetMetadataHash = new Uint8Array("QmU6sDNNJNGXJRmjrd8JBHRSyx3smLqMyTiy99Szu6B58w");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "DVT";
    const assetName = "DAO Voting Token";
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmU6sDNNJNGXJRmjrd8JBHRSyx3smLqMyTiy99Szu6B58w";
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 100;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

// 5 NFTs for committee members: head of committee, treasurer, farming expert / agronomist, autnentium rep, one other is admin officer/communications rep.
// ARC - 0003 NFT ALGORAND STANDARD
    // Creator (required) = authentium manager acct
    // AssetName (optional, but recommended) = Committee Head, Committee Treasurer, Committee Farming Expert, Committee Authentium Representative, Committee Administrative Officer
    // UnitName (optional, but recommended) = CH, CT, CFE, CAR, CAO
    // Total (required) = 1 
    // Decimals (required) = 0
    // DefaultFrozen (required) - set to "" so it can never be frozen
    // URL (optional) - points to pinned JSON metadata on IPFS (JSON metadata is stored offchain)
    // MetaDataHash (optional) - hash the content ID of the pinned JSON metadata URL, decode the hash to detemine if it gives correct CID
    // clawback = authentium manager acct

// This is the first committee position: Committee Head.
const createBoardNFT1 = async () => {
    const assetMetadataHash = new Uint8Array("QmPqJjJZ2X9KsrmoThHvKm2GH45msH7whNGMePnet9ueFa");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "CH";
    const assetName = "Committee Head";
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmPqJjJZ2X9KsrmoThHvKm2GH45msH7whNGMePnet9ueFa";
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 1;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

// This is the second committee position: Committee Treasurer.
const createBoardNFT2 = async () => {
    const assetMetadataHash = new Uint8Array("QmUGGm7MyifLQyXagcRpsHadBB9h6CoGnpT1EowwhWazc9");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "CT";
    const assetName = "Committee Treasurer";
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmUGGm7MyifLQyXagcRpsHadBB9h6CoGnpT1EowwhWazc9";
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 1;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

// This is the third committee position: Committee Farming Expert
const createBoardNFT3 = async () => {
    const assetMetadataHash = new Uint8Array("QmazApC5JYYkBDJXjwMMVvEEZ24ZNPFQCRYVpTVUgkDKeD");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "CFE";
    const assetName = "Committee Farming Expert";    
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmazApC5JYYkBDJXjwMMVvEEZ24ZNPFQCRYVpTVUgkDKeD";
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 1;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

// This is the fourth committee position: Commitee Authentium Representative
const createBoardNFT4 = async () => {
    const assetMetadataHash = new Uint8Array("QmZpJP7tnAWNg71gARkvkeHJqfbcNEHEEQ5aCgRRHiDZmc");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "CAR";
    const assetName = "Commitee Authentium Representative";
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmZpJP7tnAWNg71gARkvkeHJqfbcNEHEEQ5aCgRRHiDZmc";
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 1;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

// This is the fifth committee position: Commitee Administrative Officer
const createBoardNFT5 = async () => {
    const assetMetadataHash = new Uint8Array("QmQtZyrPFzKsejkxUydVNWk9tzCw5VZaaQXmgsmq9C48Cv");
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "CAO";
    const assetName = "Commitee Administrative Officer";
    const assetURL = "https://gateway.pinata.cloud/ipfs/QmQtZyrPFzKsejkxUydVNWk9tzCw5VZaaQXmgsmq9C48Cv"; 
    const manager = creator.addr;
    const reserve = undefined;
    const clawback = creator.addr;
    const total = 1;
    const decimals = 0;

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        assetMetadataHash,
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        manager,
        clawback,
        reserve,
    });

    const signTxn = txn.signTxn(creator.sk);
    const confirmedTxn = await submitToNetwork(signTxn);
    return confirmedTxn("asset-index");
};

(async () => {

    // create the fungible token
    console.log("Creating fungible token for voting permissions...");
    const assetId0 = await createFT().catch(console.error);
    console.log(assetId0)

    // create the first NFT
    console.log("Creating fourth NFT for Board Position 1...");
    const assetId1 = await createBoardNFT1().catch(console.error);
    console.log(assetId1)

    // create the second NFT
    console.log("Creating fourth NFT for Board Position 2...");
    const assetId2 = await createBoardNFT2().catch(console.error);
    console.log(assetId2)

    // create the third NFT
    console.log("Creating fourth NFT for Board Position 3...");
    const assetId3 = await createBoardNFT3().catch(console.error);
    console.log(assetId3)

    // create the fourth NFT
    console.log("Creating fourth NFT for Board Position 4...");
    const assetId4 = await createBoardNFT4().catch(console.error);
    console.log(assetId4)

    // create the fifth NFT
    console.log("Creating fifth NFT for Board Position 5...");
    const assetId5 = await createBoardNFT5().catch(console.error);
    console.log(assetId5)

})();