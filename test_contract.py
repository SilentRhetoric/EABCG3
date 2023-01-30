from beaker import *
from contract import DAO
from algosdk.account import generate_account, address_from_private_key
from algosdk.dryrun_results import DryrunResponse
from algosdk.future.transaction import *
from algosdk.encoding import encode_address
from algosdk.atomic_transaction_composer import (
    TransactionWithSigner,
    AtomicTransactionComposer,
    AccountTransactionSigner,
)
from algosdk import mnemonic
import pytest
from beaker.client.state_decode import decode_state
from beaker.sandbox import SandboxAccount
from util import *


@pytest.fixture(scope="module")
def setup():
    global app_client
    global accounts
    global creator_acct

    ##### SANDBOX #####
    # accounts = sorted(
    #     sandbox.get_accounts(),
    #     key=lambda a: sandbox.clients.get_algod_client().account_info(a.address)[
    #         "amount"
    #     ],
    # )
    # for account in accounts:
    #     print(account)

    # creator_acct = accounts.pop()

    # app_client = client.ApplicationClient(
    #     client=sandbox.get_algod_client(),
    #     app=DAO(version=8),
    #     signer=creator_acct.signer,
    # )

    ##### TESTNET #####
    CREATOR_MNEMONIC = "master afford frost forget mimic shoot attract wife grit vanish gorilla asthma extend fatal hospital museum brand interest jacket guard force alcohol confirm above motion"
    creator_private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
    creator_address = address_from_private_key(creator_private_key)
    creator_signer = AccountTransactionSigner(creator_private_key)
    creator_acct = SandboxAccount(creator_address, creator_private_key, creator_signer)

    algod = AlgodClient("", "https://testnet-api.algonode.cloud")
    app_client = client.ApplicationClient(
        client=algod, app=DAO(version=8), signer=creator_acct.signer
    )

    ##### Deployment script

    sp = app_client.get_suggested_params()

    # Create the two ASAs

    voter_asset_create_txn = AssetCreateTxn(
        sender=creator_acct.address,
        total=10,
        decimals=0,
        default_frozen=False,
        manager=creator_acct.address,
        reserve=creator_acct.address,
        freeze=creator_acct.address,
        clawback=creator_acct.address,
        unit_name="VOTE",
        asset_name="Voter Token",
        url="https://dummy.asset/vote",
        note="This token entitles the holder to vote in the DAO",
        sp=sp,
    )
    signed_asset_create_txn = voter_asset_create_txn.sign(creator_acct.private_key)
    global voter_token_id
    voter_token_id = send_and_wait(app_client.client, signed_asset_create_txn)[
        "asset-index"
    ]
    print(f"Created VOTE Asset ID: {voter_token_id}")

    board_asset_create_txn = AssetCreateTxn(
        sender=creator_acct.address,
        total=3,
        decimals=0,
        default_frozen=False,
        manager=creator_acct.address,
        reserve=creator_acct.address,
        freeze=creator_acct.address,
        clawback=creator_acct.address,
        unit_name="BOARD",
        asset_name="Board Member Token",
        url="https://dummy.asset/board",
        note="This token entitles the holder to a board position in the DAO",
        sp=sp,
    )
    signed_asset_create_txn = board_asset_create_txn.sign(creator_acct.private_key)
    global board_token_id
    board_token_id = send_and_wait(app_client.client, signed_asset_create_txn)[
        "asset-index"
    ]
    print(f"Created BOARD Asset ID: {board_token_id}")

    def create_signer_address_tuple():
        (
            private_key,
            address,
        ) = generate_account()
        print(mnemonic.from_private_key(private_key))
        return AccountTransactionSigner(private_key), address

    # Send some ALGO to 10 voters & 3 board members

    VOTER_1_MNEMONIC = "abandon satoshi vintage arch impose recipe stumble fringe eyebrow notice drop lamp ill copy panel animal soldier can exchange radio heavy mail kid abstract write"
    voter_1_private_key = mnemonic.to_private_key(VOTER_1_MNEMONIC)
    voter_1_signer = AccountTransactionSigner(voter_1_private_key)
    voter_1_address = address_from_private_key(voter_1_private_key)

    # First voter is always this account above
    global voters
    voters = [(voter_1_signer, voter_1_address)] + [
        create_signer_address_tuple() for i in range(9)
    ]
    global board_members
    board_members = [create_signer_address_tuple() for i in range(3)]

    payments = AtomicTransactionComposer()

    for voter in voters:
        send_algos = TransactionWithSigner(
            txn=PaymentTxn(
                sender=creator_acct.address,
                receiver=voter[1],
                amt=1_000_000,
                sp=sp,
            ),
            signer=creator_acct.signer,
        )
        payments.add_transaction(send_algos)

    for member in board_members:
        send_algos = TransactionWithSigner(
            txn=PaymentTxn(
                sender=creator_acct.address,
                receiver=member[1],
                amt=1_000_000,
                sp=sp,
            ),
            signer=creator_acct.signer,
        )
        payments.add_transaction(send_algos)

    payments_response = payments.execute(app_client.client, 2)
    print(f"Payment TxIDs: {payments_response.tx_ids}")

    # Opt voters & board into the ASAs
    opt_ins = AtomicTransactionComposer()

    for voter in voters:
        opt_in = TransactionWithSigner(
            txn=AssetOptInTxn(
                sender=voter[1],
                index=voter_token_id,
                sp=sp,
            ),
            signer=voter[0],
        )
        opt_ins.add_transaction(opt_in)

    for member in board_members:
        opt_in = TransactionWithSigner(
            txn=AssetOptInTxn(
                sender=member[1],
                index=board_token_id,
                sp=sp,
            ),
            signer=member[0],
        )
        opt_ins.add_transaction(opt_in)

    opt_ins_response = opt_ins.execute(app_client.client, 2)
    print(f"Opt In TxIDs: {opt_ins_response.tx_ids}")

    # Distribute the two tokens
    token_distribution = AtomicTransactionComposer()

    for voter in voters:
        send_token = TransactionWithSigner(
            txn=AssetTransferTxn(
                sender=creator_acct.address,
                receiver=voter[1],
                amt=1,
                index=voter_token_id,
                sp=sp,
            ),
            signer=creator_acct.signer,
        )
        token_distribution.add_transaction(send_token)

    for member in board_members:
        send_token = TransactionWithSigner(
            txn=AssetTransferTxn(
                sender=creator_acct.address,
                receiver=member[1],
                amt=1,
                index=board_token_id,
                sp=sp,
            ),
            signer=creator_acct.signer,
        )
        token_distribution.add_transaction(send_token)

    token_distribution_response = token_distribution.execute(app_client.client, 2)
    print(f"Asset Xfer TxIDs: {token_distribution_response.tx_ids}")

    # Now that the tokens are ready, create the app
    (app_id, app_addr, create_txid) = app_client.create(
        voter_token=voter_token_id, board_token=board_token_id
    )
    print(f"App ID: {app_id}")


# PROPOSAL METHOD
@pytest.fixture(scope="module")
def set_proposal():
    global proposal_text
    proposal_text = "Should the organization do a thing?"
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.proposal,
        board_token=board_token_id,
        signer=board_members[0][0],  # First board member
        suggested_params=sp,
        proposal=proposal_text,
    )


# VOTE METHOD
@pytest.fixture(scope="module")
def vote_yes():
    global vote
    vote_choice = "yes"
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.vote,
        voter_token=voter_token_id,
        signer=voters[0][0],  # First voter
        suggested_params=sp,
        vote=vote_choice,
    )


@pytest.fixture(scope="module")
def vote_no():
    global vote
    vote_choice = "no"
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.vote,
        voter_token=voter_token_id,
        signer=voters[0][0],  # First voter
        suggested_params=sp,
        vote=vote_choice,
    )


@pytest.fixture(scope="module")
def vote_abstain():
    global vote
    vote_choice = "abstain"
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.vote,
        voter_token=voter_token_id,
        signer=voters[0][0],  # First voter
        suggested_params=sp,
        vote=vote_choice,
    )


@pytest.fixture(scope="module")
def vote_else():
    global vote
    vote_choice = "something else"
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.vote,
        voter_token=voter_token_id,
        signer=voters[0][0],  # First voter
        suggested_params=sp,
        vote=vote_choice,
    )


# VETO METHOD
@pytest.fixture(scope="module")
def veto():
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.veto,
        signer=creator_acct.signer,
        suggested_params=sp,
        proposal=proposal_text,
        sender=creator_acct.address,
    )


# FINALIZE VOTE METHOD
@pytest.fixture(scope="module")
def finalize_vote():
    sp = app_client.get_suggested_params()

    app_client.call(
        DAO.finalize_vote,
        board_token=board_token_id,
        signer=board_members[0][0],  # First board member
        suggested_params=sp,
    )


#################################

##############
# create tests
##############


@pytest.mark.create
def test_create_app(setup):
    assert app_client.get_application_state()["voter_token_id"] == voter_token_id
    assert app_client.get_application_state()["board_token_id"] == board_token_id


################
# proposal tests
################


@pytest.mark.proposal
def test_propsoal(setup, set_proposal):
    assert app_client.get_application_state()["proposal_text"] == proposal_text


##############
# voting tests
##############


# @pytest.mark.skip
@pytest.mark.vote
def test_yes_vote(setup, set_proposal, vote_yes):
    assert app_client.get_application_state()["yes"] == 1


@pytest.mark.skip
@pytest.mark.vote
def test_no_vote(setup, set_proposal, vote_no):
    assert app_client.get_application_state()["no"] == 1


@pytest.mark.skip
@pytest.mark.vote
def test_else_vote(setup, set_proposal, vote_else):
    assert app_client.get_application_state()["yes"] == 1
    assert app_client.get_application_state()["no"] == 1


###########
# veto test
###########


@pytest.mark.skip
@pytest.mark.veto
def test_veto(
    setup,
    set_proposal,
    vote_yes,
    veto,
):
    assert app_client.get_application_state()["yes"] == 0


####################
# finalize vote test
####################


@pytest.mark.skip
@pytest.mark.finalize
def test_finalize_vote(
    setup,
    set_proposal,
    vote_yes,
    finalize_vote,
):
    assert app_client.get_application_state()["yes"] == 0
