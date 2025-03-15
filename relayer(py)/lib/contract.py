from web3 import Web3
from lib.abi import contract_abi
import os
from dotenv import load_dotenv
headers = {'Content-Type': 'application/json'}

load_dotenv()

URL = os.getenv("RPC_URL")
contract_address = Web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
# contract_address = os.getenv("CONTRACT_ADDRESS")
web3 = Web3(Web3.HTTPProvider(URL, request_kwargs={"headers": headers}))
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

if web3.is_connected():
    print("Connected to Lisk Sepolia RPC")
else:
    print("Connection failed")