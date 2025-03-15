from flasksqlalchemybasemodel import BaseModel, db

# for example a user model
class User(BaseModel):
    __tablename__ = 'users'
    name = db.Column(db.String(50))
    email = db.Column(db.String(100), unique=True)