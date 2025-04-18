import os
from flask import Blueprint, jsonify, abort, request
from werkzeug.utils import secure_filename
from lib.contract import contract as voting_contract
from lib.contract import contract_address, web3, URL
from lib.crypto import generate_pin
import json
from app.models.election import Election 
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

    election = Election.query.filter_by(blockchain_id=int(election_id)).first()
    if not election:
        return jsonify({
            "success": False,
            "message": "Election not found.",
            "data": []
        })

    try:
        all_voters = json.loads(election._voters) if election._voters else []

        whitelisted = [v for v in all_voters if v.get("is_whitelisted", False)]

        return jsonify({
            "success": True,
            "message": "Whitelisted voters retrieved successfully.",
            "data": all_voters
        })

    except json.JSONDecodeError:
        abort(500, description="Error decoding voters data from the database.")
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
    if file.filename == "":
        abort(400, description="No selected file")

    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(file_path)

    added_count = save_uploaded_voters_to_db(election_id, file_path)

    os.remove(file_path)

    return jsonify({"message": f"{added_count} registration numbers added."})


@elections_bp.route("/whitelist", methods=["POST"])
def whitelist_voter():
    try:
        data = request.get_json()
        election_id = data.get("electionId")
        registration_number = data.get("registrationNumber")
        gas = data.get("gas")
        print(data)

        if not election_id or not registration_number:
            abort(400, description="Election ID and registration number are required")

        # Fetch election from DB
        election = Election.filter_one(blockchain_id=election_id)
        
        if not election:
            abort(404)
        
        voters = json.loads(election._voters) if election._voters else []
        print(voters)
        # Check if voter exists
        voter = next((v for v in voters if v["regNo"] == registration_number), None)

        if not voter:
            abort(404, description="Registration number not found in this election")

        # Check if already whitelisted
        # if voter.get("is_whitelisted", False):
        #     return jsonify({
        #         "message": "Voter already whitelisted",
        #         "voter": voter
        #     })

        # Step 1: Send blockchain whitelist transaction
        gas_price = web3.eth.gas_price
        account = web3.eth.account.from_key(relayer_private_key)

        print(account)

        tx_data = voting_contract.functions.whitelistUser(
            int(election_id), registration_number, 0
        ).build_transaction({
            "from": account.address,
        })["data"]
        print(tx_data)
        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({
                "to": contract_address,
                "data": tx_data,
                "from": account.address
            }),
            "maxFeePerGas": web3.to_wei(2, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,
        }

        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)
        tx_hash = web3.to_hex(web3.eth.send_raw_transaction(signed_tx.raw_transaction))
        print(tx_hash)

        # Step 2: Update voter in DB
        voter["is_whitelisted"] = True
        voter["pin"] = generate_pin()
        # Update the list
        election._voters = json.dumps(voters)
        election.save()
        print(election._voters)  # Debugging

        return jsonify({
            "success": True,
            "transactionHash": tx_hash,
            "newVoter": {
                "registrationNumber": registration_number,
                "pin": voter["pin"]
            }
        })

    except Exception as e:
        print("Error:", e)
        abort(500, description=f"Internal Server Error: {str(e)}")

@elections_bp.route("/verify-voter", methods=["POST"])
def verify_voter():
    election_id = request.args.get("election_id")
    if not election_id:
        abort(400, description='No election ID supplied')

    data = request.get_json()
    registration_number = str(data.get("registrationNumber"))
    pin = str(data.get("pin"))

    if not registration_number or not pin:
        abort(400, description="Registration number and pin are required")

    # Fetch election from DB
    election = Election.query.filter_by(blockchain_id=election_id).first()
    if not election:
        abort(404, description="Election not found")

    voters = json.loads(election._voters) if election._voters else []

    # Find the voter
    voter = next((v for v in voters if v["regNo"] == registration_number), None)

    if not voter:
        return jsonify({"error": "Registration number not found."})

    if not voter.get("is_whitelisted", False):
        return jsonify({"error": "Voter is not whitelisted."})

    if str(voter.get("pin", "")) != pin:
        return jsonify({"error": "Incorrect pin."})

    return jsonify({"success": True})


@elections_bp.route("/vote", methods=["POST"])
def vote():
    data = request.get_json()
    gas = data.get("gas")
    election_id = data.get("electionId")
    candidates_list = data.get("candidatesList")
    registration_number = data.get("registrationNumber")

    if not all([gas, election_id, candidates_list, registration_number]):
        abort(400, description="Missing required fields")

    print(candidates_list)  # Debugging

    # Fetch election from DB
    election = Election.query.filter_by(blockchain_id=election_id).first()
    if not election:
        return jsonify({"error": "Election not found"}), 404

    voters = json.loads(election._voters) if election._voters else []

    # Find the voter
    voter_index = next((i for i, v in enumerate(voters) if v["regNo"] == registration_number), None)
    if voter_index is None:
        return jsonify({"error": "Registration number not found."}), 404

    voter = voters[voter_index]

    if not voter.get("is_whitelisted", False):
        return jsonify({"error": "Voter is not whitelisted."}), 403

    if voter.get("has_voted", False):
        return jsonify({"error": "Voter has already voted."}), 403

    try:
        gas_price = web3.eth.gas_price
        account = web3.eth.account.from_key(relayer_private_key)

        tx_data = voting_contract.functions.batchVote(
            registration_number, election_id, candidates_list, gas
        ).build_transaction({
            "from": account.address
        })["data"]

        tx = {
            "to": contract_address,
            "data": tx_data,
            "from": account.address,
            "nonce": web3.eth.get_transaction_count(account.address),
            "gas": web3.eth.estimate_gas({
                "to": contract_address,
                "data": tx_data,
                "from": account.address
            }),
            "maxFeePerGas": web3.to_wei(2, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(1, "gwei"),
            "chainId": web3.eth.chain_id,
        }

        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        # Mark voter as having voted
        voters[voter_index]["has_voted"] = True
        election._voters = json.dumps(voters)
        election.save()

        return jsonify({
            "success": True,
            "transactionHash": web3.to_hex(tx_hash)
        })

    except Exception as error:
        print(error)
        error_message = str(error)
        if "execution reverted: You are not authorized to create elections" in error_message:
            return jsonify({
                "success": False,
                "error": "You are not authorized to create elections"
            }), 500

        return jsonify({"success": False, "error": error_message}), 500


@elections_bp.route("/create-election", methods=["POST"])
def create_election():
    data = request.get_json()
    election_name = data.get("electionName")
    creator = data.get("email")
    election_logo_url = data.get("electionLogoUrl", "https://bafkreihtysunhalraprcoh2jwoelc7qkjtdpf5crkomvde2lcnalekiili.ipfs.w3s.link")
    start = data.get("start")
    end = data.get("end")

    print(URL)  # Debugging

    try:
        # Get gas price
        gas_price = web3.eth.gas_price
        

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

        # Send the transaction
        tx_hash1 = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        new_id = voting_contract.functions.electionCount().call()
        e = Election(name=election_name,blockchain_id=new_id, election_creator=creator)
        e.save()
        tx_data = voting_contract.functions.deposit(
            new_id
        ).build_transaction({"from": account.address, "value": 100000000,
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
        signed_tx = web3.eth.account.sign_transaction(tx, relayer_private_key)

        # Send the transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"success": True, "transactionHash": web3.to_hex(tx_hash1)})

    except NameError as error:
        print(error)
        return jsonify({"success": False, "error": str(error)}), 500
    
@elections_bp.route("/create-candidate", methods=["POST"])
def create_candidate():
    data = request.get_json()
    election_id = data.get("electionId")
    name = data.get("name")
    image_url = data.get("imageUrl", "https://bafkreihtysunhalraprcoh2jwoelc7qkjtdpf5crkomvde2lcnalekiili.ipfs.w3s.link")
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
    
def save_uploaded_voters_to_db(election_id, file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            new_reg_numbers = [line.strip() for line in f.readlines() if line.strip()]
        
        # Fetch election from DB
        election = Election.query.filter_by(blockchain_id=election_id).first()
        if not election:
            abort(404, description="Election not found")
        
        existing_voters = json.loads(election._voters) if election._voters else []

        # Get existing regNo list
        existing_regNos = set(v["regNo"] for v in existing_voters)
        
        # Prepare new voters
        added = 0
        for regNo in new_reg_numbers:
            if regNo not in existing_regNos:
                voter = {
                    "regNo": regNo,
                    "pin": "",
                    "has_voted": False,
                    "is_whitelisted": False
                }
                existing_voters.append(voter)
                added += 1

        # Update the election record
        election._voters = json.dumps(existing_voters)
        election.voter_count = len(existing_voters)
        election.save()

        return added

    except Exception as e:
        print("Error:", e)
        abort(500, description=f"Error processing file: {str(e)}")
