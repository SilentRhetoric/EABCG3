#!/usr/bin/env python3
from pyteal import *
from beaker import *
import os
import json
from typing import Final

class DAO(Application):
    leader: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Global.creator_address()
    )
    reg_begin: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Bytes("")
    )

    reg_end: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    # highest_bid: Final[ApplicationStateValue] = ApplicationStateValue(
    #     stack_type=TealType.uint64, default=Int(0)
    # )

    @internal(TealType.none)
    def pay(self, receiver: Expr, amount: Expr):
        return InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: receiver,
                TxnField.amount: amount,
                TxnField.fee: Int(0),
            }
        )

    @create
    def create(self):
        return self.initialize_application_state()

    @external(authorize=Authorize.only(owner))
    def start_auction(
        self,
        payment: abi.PaymentTransaction,
        starting_price: abi.Uint64,
        length: abi.Uint64,
    ):
        payment = payment.get()

        return Seq(
            # Verify payment txn
            Assert(payment.receiver() == Global.current_application_address()),
            Assert(payment.amount() == Int(100_000)),
            # Set global state
            self.auction_end.set(Global.latest_timestamp() + length.get()),
            self.highest_bid.set(starting_price.get()),
        )

    @external
    def bid(self, payment: abi.PaymentTransaction, previous_bidder: abi.Account):
        payment = payment.get()

        auction_end = self.auction_end.get()
        highest_bidder = self.highest_bidder.get()
        highest_bid = self.highest_bid.get()

        return Seq(
            Assert(Global.latest_timestamp() < auction_end),
            # Verify payment transaction
            Assert(payment.amount() > highest_bid),
            Assert(Txn.sender() == payment.sender()),
            # Return previous bid
            If(
                highest_bidder != Bytes(""),
                Seq(
                    Assert(highest_bidder == previous_bidder.address()),
                    self.pay(highest_bidder, highest_bid),
                ),
            ),
            # Set global state
            self.highest_bid.set(payment.amount()),
            self.highest_bidder.set(payment.sender()),
        )

    @external
    def end_auction(self):
        auction_end = self.auction_end.get()
        highest_bid = self.highest_bid.get()
        owner = self.owner.get()
        highest_bidder = self.highest_bidder.get()

        return Seq(
            Assert(Global.latest_timestamp() > auction_end),
            self.pay(owner, highest_bid),
            self.owner.set(highest_bidder),
            self.auction_end.set_default(),
            self.highest_bidder.set_default(),
        )


if __name__ == "__main__":
    app = Auction(version=7)

    if os.path.exists("approval.teal"):
        os.remove("approval.teal")

    if os.path.exists("approval.teal"):
        os.remove("clear.teal")

    if os.path.exists("abi.json"):
        os.remove("abi.json")

    if os.path.exists("app_spec.json"):
        os.remove("app_spec.json")

    with open("approval.teal", "w") as f:
        f.write(app.approval_program)

    with open("clear.teal", "w") as f:
        f.write(app.clear_program)

    with open("abi.json", "w") as f:
        f.write(json.dumps(app.contract.dictify(), indent=4))

    with open("app_spec.json", "w") as f:
        f.write(json.dumps(app.application_spec(), indent=4))
