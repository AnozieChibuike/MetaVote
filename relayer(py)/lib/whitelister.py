import json
import time
import os
from dotenv import load_dotenv
from contract import contract
from contract import web3 as w3
from crypto import generate_pin

# Load environment variables
load_dotenv()

# Contract details
private_key = os.getenv("RELAYER_PRIVATE_KEY")
account = w3.eth.account.from_key(private_key).address


# File paths
REG_NOS_FILE = "regNos.txt"
WHITELISTED_FILE = "300.json"
ERROR_FILE = "300error.json"

# Load existing whitelisted data
if os.path.exists(WHITELISTED_FILE):
    with open(WHITELISTED_FILE, "r") as f:
        whitelisted_data = json.load(f)
else:
    whitelisted_data = []

# Load existing error data
if os.path.exists(ERROR_FILE):
    with open(ERROR_FILE, "r") as f:
        error_data = json.load(f)
else:
    error_data = []

# Read registration numbers from file
with open(REG_NOS_FILE, "r") as f:
    reg_nums = [line.strip() for line in f.readlines() if line.strip()]

# Get nonce
nonce = w3.eth.get_transaction_count(account, "pending")

def bulk_whitelist(election_id, gas_limit):
    global nonce  # Track nonce globally for sequential transactions

    for reg_num in reg_nums:
        try:
            # Prepare transaction
            tx_data = contract.functions.whitelistUser(election_id, reg_num, 30000).build_transaction({
                "from": account,
                "gas": gas_limit,
                "gasPrice": w3.eth.gas_price,
                "nonce": nonce
            })

            # Estimate gas
            estimated_gas = w3.eth.estimate_gas(tx_data)
            tx_data["gas"] = estimated_gas

            # Sign transaction
            signed_tx = w3.eth.account.sign_transaction(tx_data, private_key)

            # Send transaction
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            print(f"✅ Successfully whitelisted {reg_num}: {tx_hash.hex()}")

            # Generate and save PIN
            pin = generate_pin()
            whitelisted_data.append({"registrationNumber": reg_num, "pin": pin})

            # Update nonce
            nonce += 1

            # Save data after each successful operation
            with open(WHITELISTED_FILE, "w") as f:
                json.dump(whitelisted_data, f, indent=2)

            # Small delay to avoid nonce issues
            time.sleep(1)

        except Exception as error:
            error_reason = str(error)
            print(f"❌ Error whitelisting {reg_num}: {error_reason}")

            error_data.append({"registrationNumber": reg_num, "reason": error_reason})

            # Save errors
            with open(ERROR_FILE, "w") as f:
                json.dump(error_data, f, indent=2)

    print("📋 Bulk whitelist process completed. Check '300.json' and '300error.json'.")
  
# Run the script
if __name__ == "__main__":
    election_id = 1  # Set election ID
    gas_limit = 300000  # Adjust gas limit as needed
    bulk_whitelist(election_id, gas_limit)
