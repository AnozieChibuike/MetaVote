from flask import Blueprint, jsonify, request
admin_bp = Blueprint("admin", __name__)
from app.models.election import Election

@admin_bp.route("/elections", methods=["GET", "POST", "PUT"])
def elections():
    """Get all elections or create a new one."""
    if request.method == "POST":
        return create_election()
    elif request.method == "PUT":
        return update_election()
    return get_elections()

def get_elections():
    """Get all elections."""
    elections = Election.filter_one(creator=request.args.get("creator")) if request.args.get("creator") else Election.all()
    if not elections:
        return jsonify({"error": "No elections found"}), 404
    return jsonify([election.to_dict() for election in elections]), 200

def create_election():
    """Create a new election."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    blockchain_id = data.get("blockchain_id")
    election_creator = data.get("creator")

    if not name or not blockchain_id or not election_creator:
        return jsonify({"error": "Missing required fields"}), 400

    election = Election(name=name, blockchain_id=blockchain_id, election_creator=election_creator)
    election.save()

    return jsonify(election.to_dict()), 201

def update_election():
    """Update an existing election."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    voter_count = data.get("voter_count")
    voted_count = data.get("voted_count")
    election_id = data.get("id")

    if not election_id:
        return jsonify({"error": "Election ID is required"}), 400
    
    if not voter_count and not voted_count:
        return jsonify({"error": "No fields to update"}), 400
    
    election = Election.get_or_404(election_id)
    if voter_count:
        election.voter_count = voter_count
    if voted_count:
        election.voted_count = voted_count
    election.save()

    return jsonify(election.to_dict()), 200