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
        stack_type=TealType.uint64, default=Int(0)
    )

    reg_end: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    vote_begin: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    vote_end: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    voting_token_address: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Txn.assets[0]
    )

    board_token_address: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Txn.assets[1]
    )

    winner: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Bytes("")
    )

    yes: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    no: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    issue: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Bytes("")
    )

    @create
    def create(self):
        return self.initialize_application_state()

    # Proposal: 1. check ownership of board token, 2. set global byteslice for issue that is being voted on, 3. set registration and voting period
    @external
    def proposal(self, issue: abi.Bytes):
        return Seq(
            # this assertion is wrong, need to figure out how to check ownership of board token in beaker
            Assert(Txn.sender() == self.board_token_address.get()),
            self.issue.set(issue.get()),
            self.reg_begin.set(Global.latest_timestamp()),
            self.reg_end.set(Global.latest_timestamp() + Int(100)),
            self.vote_begin.set(Global.latest_timestamp() + Int(100)),
            self.vote_end.set(Global.latest_timestamp() + Int(200)),
        )
    # Vote: 1. check voting period is active, 2. check opted in, 3. check voting token ownership, 4. increment yes or no global int
    @external
    def vote(self, vote: abi.Bytes):
        return Seq(
            Assert(Global.latest_timestamp() > self.vote_begin.get()),
            Assert(Global.latest_timestamp() < self.vote_end.get()),
            Assert(Txn.sender() == self.voting_token_address.get()),
            Assert(Txn.sender() == self.voting_token_address.get()),
            If(
                vote.get() == Bytes("yes"),
                self.yes.set(self.yes.get() + Int(1)),
                self.no.set(self.no.get() + Int(1)),
            ),
        )
    # Veto: 1. check that sender is leader (can be global state or NFT), 2. reset all global schema
    def veto(self):
        return Seq(
            Assert(Txn.sender() == self.leader.get()),
            self.issue.set_default(),
            self.reg_begin.set_default(),
            self.reg_end.set_default(),
            self.vote_begin.set_default(),
            self.vote_end.set_default(),
            self.yes.set_default(),
            self.no.set_default(),
        )
    # Finalize Vote: 1. check board token ownership, 2. compare yes to no (print results if possible), 3. set winner to Yes or No based on which is greater + the issue 4. reset global schema except winner
    def finalize_vote(self):
        return Seq(
            Assert(Txn.sender() == self.board_token_address.get()),
            If(self.yes.get() > self.no.get())
            .Then(self.winner.set(Bytes("yes") + self.issue.get()))
            .Else(self.winner.set(Bytes("no") + self.issue.get())),
            self.issue.set_default(),
            self.reg_begin.set_default(),
            self.reg_end.set_default(),
            self.vote_begin.set_default(),
            self.vote_end.set_default(),
            self.yes.set_default(),
            self.no.set_default(),
        )

if __name__ == "__main__":
    app = DAO(version=7)

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
