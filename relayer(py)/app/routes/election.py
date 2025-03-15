import os
from flask import Blueprint, jsonify, abort, request
from werkzeug.utils import secure_filename
from lib.contract import contract as voting_contract
from lib.contract import contract_address, web3, URL
from lib.crypto import generate_pin
import json

from lib.file_handlers import read_voters_file, write_voters_file, read_whitelist_file, write_whitelist_file

elections_bp = Blueprint("elections", __name__)

voters_file_path = os.path.abspath("voters.json")
whitelist_file_path = os.path.abspath("whitelisted.json")
relayer_private_key = os.getenv("RELAYER_PRIVATE_KEY")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@elections_bp.route("/delete-voters-file", methods=["DELETE"])
def delete_voters_file():
    try:
        election_id = request.args.get("election_id")
        if not election_id:
            abort(400, description="No election id supplied")

        file_path = f"app/static/voters/{election_id}.json"

        if not os.path.exists(file_path):
            return jsonify({
                "success": False,
                "message": "The voters.json file does not exist."
            })

        # Check if file is empty
        registration_numbers = read_voters_file(file_path)

        if not registration_numbers:  # Empty list or None
            os.remove(file_path)  # Delete the empty file
            return jsonify({
                "success": True,
                "message": "The voters.json file was empty and has been deleted."
            })

        # Delete the non-empty file
        os.remove(file_path)
        return jsonify({
            "success": True,
            "message": "The voters.json file was deleted successfully."
        })

    except FileNotFoundError:
        return jsonify({
            "success": False,
            "message": "File not found, possibly deleted already."
        })
    except PermissionError:
        abort(500, description="Permission denied while deleting the file.")
    except Exception as error:
        print("Error deleting voters.json:", error)
        abort(500, description=f"Could not delete voters.json file: {error}")

@elections_bp.route("/voters-file-status", methods=["GET"])
def voters_file_status():
    try:
        election_id = request.args.get("election_id")
        if not election_id:
            abort(400, description='No election id supplied')
        if not os.path.exists(f"app/static/voters/{election_id}.json"):
            return jsonify({
                "isEmpty": True,
                "message": "The voters.json file is empty."
            })

        registration_numbers = read_voters_file(f"app/static/voters/{election_id}.json")

        if len(registration_numbers) == 0:
            return jsonify({
                "isEmpty": True,
                "message": "The voters.json file is empty."
            })

        return jsonify({
            "isEmpty": False,
            "message": "The voters.json file contains data."
        })
    except Exception as error:
        print("Error checking voters.json:", error)
        abort(500, description=f"Could not check voters.json status: {error}")

@elections_bp.route('/whitelisted-voters', methods=['GET'])
def whitelisted_voters():
    election_id = request.args.get("election_id")
    if not election_id:
        abort(400, description='No election id supplied')
    whitelist_path = f'hidden/{election_id}.json'
    if not os.path.exists(whitelist_path):
        return jsonify({
            "success": False,
            "message": "No whitelisted voters found for this election.",
            "data": []
        })
    try:
        # Read the voters file
        with open(whitelist_path, "r", encoding="utf-8") as f:
            whitelisted_voters = json.load(f)

        return jsonify({
            "success": True,
            "message": "Whitelisted voters retrieved successfully.",
            "data": whitelisted_voters
        })

    except json.JSONDecodeError:
        abort(500, description="Error reading the voters file. It may be corrupted.")
    except Exception as e:
        abort(500, description=f"An error occurred: {str(e)}")


@elections_bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        abort(400, description="No file uploaded")

    if "election_id" not in request.form:
        abort(400, description="Missing election ID")

    file = request.files["file"]
    election_id = request.form["election_id"]  # Get election ID from form data
    voters_file_path = f"app/static/voters/{election_id}.json"  # Use election ID in file path
    if file.filename == "":
        abort(400, description="No selected file")

    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(file_path)

    try:
        # Read and parse the uploaded file
        with open(file_path, "r", encoding="utf-8") as f:
            new_reg_numbers = [line.strip() for line in f.readlines() if line.strip()]

        existing_reg_numbers = read_voters_file(voters_file_path)

        # Combine new and existing registration numbers
        combined_reg_numbers = list(set(existing_reg_numbers + new_reg_numbers))
        write_voters_file(voters_file_path,combined_reg_numbers)

        # Delete the uploaded file
        os.remove(file_path)

        return jsonify({"message": f"{len(new_reg_numbers)} registration numbers added."})

    except NameError as e:
        print(e)
        abort(500, description=f"Error processing file: {str(e)}")

@elections_bp.route("/whitelist", methods=["POST"])
def whitelist_voter():
    try:
        data = request.get_json()
        election_id = data.get("electionId")
        registration_number = data.get("registrationNumber")
        gas = data.get("gas")

        if not registration_number:
            abort(400, description="Registration number is required")

        registration_numbers = read_voters_file(f"app/static/voters/{election_id}.json")
        

        if registration_number not in registration_numbers:
            abort(404, description="Registration number not found")

        # Step 2: Read the current whitelist file
        whitelisted_voters = read_whitelist_file(whitelist_file_path)

        # Step 3: Check if the voter is already whitelisted
        voter = next((v for v in whitelisted_voters if v["registrationNumber"] == registration_number), None)

        if voter:
            return jsonify({
                "message": "Voter already whitelisted",
                "voter": voter
            })

        # Step 4: Build and send the transaction
        gas_price = web3.eth.gas_price
        account = web3.eth.account.from_key(relayer_private_key)

        tx_data =  voting_contract.functions.whitelistUser(election_id, registration_number, gas).build_transaction({
            "from": account.address,
            "gasPrice": gas_price,
        })["data"]

        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({"to": contract_address, "data": tx_data, "from": account.address}),
            "maxFeePerGas": web3.to_wei(2, "gwei"),  # Adjust as needed
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,  # Ensure correct chain ID
        }

        signed_tx = web3.eth.account.sign_transaction(tx, account.key)
        receipt = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_hash = web3.to_hex(receipt)

        # Step 5: Update the whitelist file
        new_voter = {
            "registrationNumber": registration_number,
            "pin": generate_pin()
        }
        whitelisted_voters.append(new_voter)
        write_whitelist_file(f"hidden/{election_id}.json",whitelisted_voters)

        return jsonify({
            "success": True,
            "transactionHash": tx_hash,
            "newVoter": new_voter
        })

    except Exception as error:
        print(error)
        error_message = str(error)
        
        if "execution reverted: You are not authorized to create elections" in error_message:
            abort(500, description="You are not authorized to create elections")

        abort(500, description=error_message)

@elections_bp.route("/verify-voter", methods=["POST"])
def verify_voter():
    election_id = request.args.get("election_id")
    if not election_id:
        abort(400, description='No election id supplied')
    data = request.get_json()
    registration_number = str(data.get("registrationNumber"))
    pin = str(data.get("pin"))

    whitelisted_voters = read_whitelist_file(f"hidden/{election_id}.json")

    # Find the voter
    voter = next((v for v in whitelisted_voters if str(v["registrationNumber"]) == registration_number), None)

    if not voter:
        return jsonify({"error": "Registration number not found."})

    if str(voter["pin"]) != pin:
        return jsonify({"error": "Incorrect pin."})

    return jsonify({"success": True})

@elections_bp.route("/vote", methods=["POST"])
def vote():
    data = request.get_json()
    gas = data.get("gas")
    election_id = data.get("electionId")
    candidates_list = data.get("candidatesList")
    registration_number = data.get("registrationNumber")

    print(candidates_list)  # Debugging

    whitelisted_voters = read_whitelist_file(f"hidden/{election_id}.json")
    voter = next((v for v in whitelisted_voters if v["registrationNumber"] == registration_number), None)

    if not voter:
        return jsonify({"error": "Registration number not found."}), 404

    try:
        # Get gas price
        gas_price = web3.eth.gas_price

        # Get relayer account
        account = web3.eth.account.from_key(relayer_private_key)
        tx_data = voting_contract.functions.batchVote(
                registration_number, election_id, candidates_list, gas
            ).build_transaction({"from": account.address})["data"]
        # Build the transaction
        
        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({"to": contract_address, "data": tx_data, "from": account.address}),
            "maxFeePerGas": web3.to_wei(2, "gwei"),  # Adjust as needed
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,  # Ensure correct chain ID
        }

        # Sign the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)

        # Send the transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return jsonify({"success": True, "transactionHash": web3.to_hex(tx_hash)})

    except Exception as error:
        print(error)
        error_message = str(error)
        if "execution reverted: You are not authorized to create elections" in error_message:
            return jsonify({"success": False, "error": "You are not authorized to create elections"}), 500
        
        return jsonify({"success": False, "error": error_message}), 500

@elections_bp.route("/create-election", methods=["POST"])
def create_election():
    data = request.get_json()
    election_name = data.get("electionName")
    election_logo_url = data.get("electionLogoUrl")
    start = data.get("start")
    end = data.get("end")

    print(URL)  # Debugging

    try:
        # Get gas price
        print(web3)
        print(web3.eth.get_block("latest"))
        gas_price = web3.eth.gas_price
        print(gas_price)

        # Get relayer account
        account = web3.eth.account.from_key(relayer_private_key)

        # Build the transaction
        tx_data = voting_contract.functions.createElection(
            election_name, start, end, election_logo_url
        ).build_transaction({"from": account.address})["data"]

        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({"to": contract_address, "data": tx_data, "from": account.address}),
            "maxFeePerGas": web3.to_wei(2, "gwei"),  # Adjust as needed
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,  # Ensure correct chain ID
        }

        # Sign the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)

        print(signed_tx)
        # Send the transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"success": True, "transactionHash": web3.to_hex(tx_hash)})

    except NameError as error:
        print(error)
        return jsonify({"success": False, "error": str(error)}), 500
    
@elections_bp.route("/create-candidate", methods=["POST"])
def create_candidate():
    data = request.get_json()
    election_id = data.get("electionId")
    name = data.get("name")
    image_url = data.get("imageUrl")
    position = data.get("position")

    print(data)  # Debugging

    try:
        # Get gas price
        gas_price = web3.eth.gas_price

        # Get relayer account
        account = web3.eth.account.from_key(relayer_private_key)

        # Build the transaction
        tx_data = voting_contract.functions.addCandidate(
            election_id, name, image_url, position
        ).build_transaction({"from": account.address})["data"]
        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({"to": contract_address, "data": tx_data, "from": account.address}),
            "maxFeePerGas": web3.to_wei(2, "gwei"),  # Adjust as needed
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,  # Ensure correct chain ID
        }

        # Sign the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)

        # Send the transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return jsonify({"success": True, "transactionHash": web3.to_hex(tx_hash)})

    except Exception as error:
        print(error)

        # Handle specific error message
        if "execution reverted: You are not authorized to create elections" in str(
            error
        ):
            return (
                jsonify({"success": False, "error": "You are not authorized to create elections"}),
                500,
            )

        return jsonify({"success": False, "error": str(error)}), 500
    
