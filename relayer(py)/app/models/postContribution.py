from flasksqlalchemybasemodel import BaseModel, db

# for example a user model
class PostContribution(BaseModel):
    __tablename__ = 'post_contribution'
    