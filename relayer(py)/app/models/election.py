from flasksqlalchemybasemodel import BaseModel, db

# for example a user model
class Election(BaseModel):
    __tablename__ = 'election'
    name = db.Column(db.String(50))
    blockchain_id = db.Column(db.Integer, unique=True)
    voter_count = db.Column(db.Integer, default=0)
    voted_count = db.Column(db.Integer, default=0)
    election_creator = db.Column(db.String(126))

    