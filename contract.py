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

    voter_token_id: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
    )

    board_token_id: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.uint64, default=Int(0)
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

    proposal_text: Final[ApplicationStateValue] = ApplicationStateValue(
        stack_type=TealType.bytes, default=Bytes("")
    )

    vote: Final[AccountStateValue] = AccountStateValue(
        stack_type=TealType.bytes, default=Bytes("")
    )

    @create
    def create(self, voter_token: abi.Asset, board_token: abi.Asset):
        return Seq(
            self.initialize_application_state(),
            self.voter_token_id.set(voter_token.asset_id()),
            self.board_token_id.set(board_token.asset_id())
        )

    @opt_in
    def opt_in(self):
        return self.initialize_account_state()

    # Proposal: 1. check ownership of board token, 2. set global byteslice for issue that is being voted on, 3. set registration and voting period
    @external
    def proposal(self, board_token: abi.Asset, proposal: abi.String):
        # fetch local state of algorand standard asset (ASA) for voting token
        get_board_holding = AssetHolding.balance(Int(0), self.board_token_id.get()),
        return Seq(
            # assert that the asset in the foreignAssets array is the board token
            Assert(board_token.asset_id() == self.board_token_id.get()),
            # assert that board token is held by sender
            board_token.holding(Txn.sender())
            .balance()
            .outputReducer(lambda value, has_value: Assert(And(has_value, value > Int(0)))),
            # set issue to be voted on
            self.proposal_text.set(proposal.get()),
            # set registration period
            self.reg_begin.set(Global.latest_timestamp()),
            self.reg_end.set(Global.latest_timestamp() + Int(100)),
            # set voting period
            self.vote_begin.set(Global.latest_timestamp()),
            self.vote_end.set(Global.latest_timestamp() + Int(100_000_000)),
        )
    
    # Vote: 1. check voting period is active, 2. check opted in, 3. check voting token ownership, 4. increment yes or no global int
    @external
    def vote(self, voter_token: abi.Asset, vote: abi.String):
        get_voter_holding = AssetHolding.balance(Int(0), Txn.assets[0]),
        return Seq(
            # assert that the asset in the foreignAssets array is the voter token
            Assert(voter_token.asset_id() == self.voter_token_id.get()),
            # assert that voter token is held by sender
            voter_token.holding(Txn.sender())
            .balance()
            .outputReducer(lambda value, has_value: Assert(And(has_value, value > Int(0)))),
            # assert that voting period is active
            Assert(Global.latest_timestamp() >= self.vote_begin.get()),
            Assert(Global.latest_timestamp() < self.vote_end.get()),
            # assert that vote must be yes, no or abstain
            Assert(vote.get() == Bytes("yes") or Bytes("no") or Bytes("abstain")),
            # increment yes or no based on vote
            If(vote.get() == Bytes("yes"))
            .Then(self.yes.set(self.yes.get() + Int(1)))
            .ElseIf(vote.get() == Bytes("no"))
            .Then(self.no.set(self.no.get() + Int(1)))
            .ElseIf(vote.get() == Bytes("abstain"))
            .Then(Approve())
        )

    # Veto: 1. check that sender is leader (can be global state or NFT), 2. reset all global schema
    @external
    def veto(self):
        return Seq(
            # checks that sender is leader
            Assert(Txn.sender() == self.leader.get()),
            # resets all global schema
            self.proposal_text.set_default(),
            self.reg_begin.set_default(),
            self.reg_end.set_default(),
            self.vote_begin.set_default(),
            self.vote_end.set_default(),
            self.yes.set_default(),
            self.no.set_default(),
        )

    # Finalize Vote: 1. check board token ownership, 2. compare yes to no (print results if possible), 3. set winner to Yes or No based on which is greater + the issue 4. reset global schema except winner
    @external
    def finalize_vote(self):
        # fetch local state of algorand standard asset (ASA) for voting token
        get_board_holding = AssetHolding.balance(Int(0), self.board_token_id.get()),
        return Seq(
            # # assert that board token is held by sender
            # Assert(get_board_holding.hasValue()),
            # # assert that member has one or more tokens
            # Assert(get_board_holding.value()>=Int(1)),
            # assert that voting period is over
            Assert(Global.latest_timestamp() > self.vote_end.get()),
            # control flow for determining if proposal passed or failed
            If(self.yes.get() > self.no.get())
            .Then(self.winner.set(Concat(Bytes("yes: "), self.proposal_text.get())))
            .Else(self.winner.set(Concat(Bytes("no: "), self.proposal_text.get()))),
            # setting all global schema to default except winner
            self.proposal_text.set_default(),
            self.reg_begin.set_default(),
            self.reg_end.set_default(),
            self.vote_begin.set_default(),
            self.vote_end.set_default(),
            self.yes.set_default(),
            self.no.set_default(),
        )

if __name__ == "__main__":
    DAO().dump("artifacts")