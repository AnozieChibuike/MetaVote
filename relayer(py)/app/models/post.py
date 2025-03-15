from flasksqlalchemybasemodel import BaseModel, db

# for example a user model
class Post(BaseModel):
    __tablename__ = 'post'
    