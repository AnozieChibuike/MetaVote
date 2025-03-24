from flask import Blueprint, jsonify, request
from flask_mail import Message
from app import mail, app
from lib.tokens import generate_token, decode_token
import os
import re

def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None


front_url = os.getenv('front_url')

mailer_bp = Blueprint("mailer", __name__)

@mailer_bp.route("/send-verification", methods=["POST", "OPTIONS"])
def send_verification():
    if request.method == 'OPTIONS':
        return '', 204 
    data = request.json
    email = data.get("email")
    is_admin = data.get("is_admin", False)
    if not email:
        return jsonify({"error": "Email is required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid Email"}), 400
    
    token = generate_token(email)
    verification_link = f"{front_url}/verify?token={token}?is_admin={is_admin}"

    try:
        msg = Message("Voter Verification Link", sender=app.config["MAIL_USERNAME"], recipients=[email])
        msg.html = f'<h1>MetaVote</h1><br><p>Click <a href="{verification_link}">here</a> to verify your email and sign in.</p>'
        msg.sender = ("MetaVote", "noreply@metavote.onchain")
        mail.send(msg)
        return jsonify({"message": "Verification link sent"})
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

@app.route("/verify", methods=["GET"])
def verify():
    token = request.args.get("token")
    email = decode_token(token)

    if not email:
        return jsonify({"error": "Invalid or expired verification link"}), 400

    return jsonify({"email": email, "message": "Verification successful"})
