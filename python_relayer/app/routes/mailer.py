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

print(app.config)

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
        msg.html = magic_link(verification_link)
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

def magic_link(verification_link):
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - MetaVote</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center;">

    <table width="100%" border="0" cellspacing="0" cellpadding="20">
        <tr>
            <td align="center">
                <table width="500px" style="background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <!-- Logo -->
                    <tr>
                        <td align="center">
                            <h1 style="margin: 0;">
                                <span style="color: #007bff;">Meta</span><span style="color: #dc3545;">Vote</span>
                            </h1>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td align="center" style="color: #333;">
                            <p>Click the button below to verify your email and sign in:</p>
                            <a href="{verification_link}" target="_blank" 
                               style="display: inline-block; background: #007bff; color: #fff; padding: 12px 20px; 
                               text-decoration: none; font-size: 16px; border-radius: 5px;">
                                Verify Email
                            </a>
                        </td>
                    </tr>

                    <!-- Copy Link Manually -->
                    <tr>
                        <td align="center" style="color: #555; font-size: 14px;">
                            <p>If the button doesn't work, copy and paste the link into your main browser:</p>
                            <p style="background: #f8f8f8; padding: 10px; border-radius: 5px; word-break: break-all;">
                                <a href="{verification_link}" target="_blank" style="color: #007bff; text-decoration: none;">
                                    {verification_link}
                                </a>
                            </p>
                        </td>
                    </tr>

                    <!-- Important Notes -->
                    <tr>
                        <td align="center" style="color: #777; font-size: 12px;">
                            <p><strong>⚠ Important:</strong></p>
                            <p>✔ If you don't see the email, check your Spam or Junk folder.</p>
                            <p>✔ Make sure the link is from <strong>{front_url}</strong> before clicking.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="font-size: 12px; color: #aaa;">
                            <p>&copy; 2025 MetaVote. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
"""

def message(verification_link):
    return """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - MetaVote</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            text-align: center;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: inline-block;
            text-align: left;
            max-width: 500px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
        }
        .blue { color: #007bff; }  /* Meta in blue */
        .red { color: #dc3545; }   /* Vote in red */
        .button {
            display: inline-block;
            background: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
        }
        .small {
            font-size: 12px;
            color: #555;
        }
        .copy-box {
            background: #f1f1f1;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .copy-box input {
            border: none;
            background: none;
            font-size: 14px;
            width: 85%;
        }
        .copy-box button {
            background: #007bff;
            color: #fff;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
        .footer {
            font-size: 12px;
            margin-top: 15px;
            color: #777;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="logo"><span class="blue">Meta</span><span class="red">Vote</span></div>
    
    <p>Click the button below to verify your email and sign in:</p>

    <a class="button" href=""" + "'" + verification_link + "'" + """ target="_blank">Verify Email</a>

    <p class="small">If the button doesn’t work, copy and paste this link into your browser:</p>

    <div class="copy-box">
        <input type="text" value=""" + "'" + verification_link + "'" + """ id="copyLink" readonly>
        <button onclick="copyToClipboard()">Copy</button>
    </div>

    <p class="small"><strong>⚠️ Important:</strong></p>
    <ul class="small">
        <li>Check your spam folder if you don't see the email.</li>
        <li>Ensure the link starts with <strong>https://metavote.0xagbero.pw</strong> before clicking.</li>
    </ul>

    <div class="footer">
        &copy; 2025 MetaVote. All rights reserved.
    </div>
</div>

<script>
    function copyToClipboard() {
        var copyText = document.getElementById("copyLink");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        alert("Link copied to clipboard!");
    }
</script>

</body>
</html>
"""