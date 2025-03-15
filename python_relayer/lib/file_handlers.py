import json
import os

def read_voters_file(voters_file_path):
    # If the file doesn't exist, create it with an empty list
    if not os.path.exists(voters_file_path):
        with open(voters_file_path, "w") as file:
            json.dump({"registrationNumbers": []}, file, indent=2)
            

    # Read the file and return the registrationNumbers list
    with open(voters_file_path, "r") as file:
        data = json.load(file)
    
    return data.get("registrationNumbers", [])

def write_voters_file(voters_file_path,registration_numbers):
    with open(voters_file_path, "w") as file:
        json.dump({"registrationNumbers": registration_numbers}, file, indent=2)


def read_whitelist_file(whitelist_file_path):
    """Reads the whitelist file. If it doesn't exist, creates an empty list."""
    if not os.path.exists(whitelist_file_path):
        with open(whitelist_file_path, "w") as file:
            json.dump([], file, indent=2)

    with open(whitelist_file_path, "r") as file:
        return json.load(file)

def write_whitelist_file(whitelist_file_path,whitelisted_voters):
    """Writes a list of whitelisted voters to the file."""
    with open(whitelist_file_path, "w") as file:
        json.dump(whitelisted_voters, file, indent=2)