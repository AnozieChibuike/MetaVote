import base64

# Generate a simple token (Base64 encoded email)
def generate_token(email):
    return base64.urlsafe_b64encode(email.encode()).decode()

# Decode Base64 token
def decode_token(token):
    try:
        return base64.urlsafe_b64decode(token).decode()
    except:
        return None
