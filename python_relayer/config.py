import os
from dotenv import load_dotenv
import secrets

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET", secrets.token_hex())
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("FLASK_SECRET", secrets.token_hex())
    
