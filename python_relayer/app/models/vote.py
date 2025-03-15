from flasksqlalchemybasemodel import BaseModel, db

# for example a user model
class Vote(BaseModel):
    __tablename__ = 'vote'
    