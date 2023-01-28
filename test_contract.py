from beaker import *
from contract import DAO
from algosdk.account import generate_account
from algosdk.dryrun_results import DryrunResponse
from algosdk.future.transaction import *
from algosdk.encoding import encode_address
from algosdk.atomic_transaction_composer import (
    TransactionWithSigner,
    AtomicTransactionComposer,
    AccountTransactionSigner
)
import pytest
from beaker.client.state_decode import decode_state
from util import *


@pytest.fixture(scope="module")
def setup():
    global accounts  
    accounts = sorted(
        sandbox.get_accounts(),
        key=lambda a: sandbox.clients.get_algod_client().account_info(a.address)[
            "amount"
        ],
    )
    for account in accounts:
        print(account)

    global creator_acct
    creator_acct = accounts.pop()

    global app_client
    app_client = client.ApplicationClient(
        client=sandbox.get_algod_client(),
        app=DAO(version=8),
        signer=creator_acct.signer,
    )
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
    voter_token_id = send_and_wait(app_client.client, signed_asset_create_txn)["asset-index"]
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
    board_token_id = send_and_wait(app_client.client, signed_asset_create_txn)["asset-index"]
    print(f"Created BOARD Asset ID: {board_token_id}")

    def create_signer_address_tuple():
        private_key, address, = generate_account()
        return AccountTransactionSigner(private_key), address

    # Send some ALGO to 10 voters & 3 board members
    global voters
    voters = [create_signer_address_tuple() for i in range(10)]
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
    print(payments_response)


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
    print(opt_ins_response)

    # Now that the tokens are ready, create the app
    # app_client.create()

##############
# create tests
##############

@pytest.mark.create
def test_create_app(
    setup
): 
    return

##############
# voting tests
##############

# @pytest.mark.create
# def test_vote(
#     setup
# ): 
#     return

################
# end vote tests
################

# @pytest.mark.end_vote
# def test_end_vote(
#     setup 
# ): 
#     return