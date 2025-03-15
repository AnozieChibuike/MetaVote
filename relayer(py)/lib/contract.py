from web3 import Web3
from lib.abi import contract_abi
import os
from dotenv import load_dotenv


load_dotenv()

contract_address = os.getenv("CONTRACT_ADDRESS")
web3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
contract = web3.eth.contract(address=contract_address, abi=contract_abi)
