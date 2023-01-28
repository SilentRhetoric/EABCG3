# Group 3 DAO

## Install python dependencies

1. `python -m venv .venv` and `source .venv/bin/activate` to create a virtual environment to install python dependencies
2. `pip3 install -r requirements.txt` to install python dependencies

### Python Tests (PyTest)

1. `source .venv/bin/activate` to activate virtual environment
2. `python contract.py` to generate artifacts (`.teal`, `.json` files)
3. `pytest` to execute tests


## TODO

1. how to make the vote a local state?
2. handle opt in and opt out
3. need a script that deploys the ASAs and the smart contract, providing asset array with voter and board token IDs
4. finalize vote method output log with winner

## Project Description

Fungible tokens for voting, 1 token 1 vote

Vote threshold is configurable by the leader, denominator is # of tokens minted (disitribute all tokens - use AssetParam.total())

Function to change the leader (type of vote)
- Global state slot bytes for the address of a leader

Leader - one of board member, in global state
    Has veto power over vote outcomes
Board - Defined by holding 1 of 5 tokens "A"
    Can propose measures
Members at large - Defined by holding 1 or more of a voting token "B"
    Can vote on proposals


## Testing Setup & Script 

### Accounts
Creator, who will fund:
    Board members 3
    Other members - 10?
Creator makes board tokens
Creator makes voting tokens
Creator distribute board tokens to 3 board members
Creator distribute voting tokens 
Create contract, including identifying the ASA ID of the two tokens and setting the owner
Leader creates a proposal and starts a vote
Voters vote
Board member VETOES!
Leader ends the vote, result is determined and set as output


## Contract Design

### State

leader (bytes - address)
current_proposal (bytes)
end_time (uint64)
current_vote_total (unit64)

### Methods

create (authorize=creator)
set_proposal (authorize=holding board token) - if the bytes are a valid algorand address, it changes the leader
vote (authorize=holding voting token)
veto (authorize=leader)
get_result (anyone can call)