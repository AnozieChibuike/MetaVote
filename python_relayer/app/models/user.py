from flasksqlalchemybasemodel import BaseModel, db
from app.models.election import Election

# for example a user model
class User(BaseModel):
    __tablename__ = 'users'
    name = db.Column(db.String(50))
    email = db.Column(db.String(100), unique=True)

    def elections(self):
        e = Election.filter_all(election_creator=self.id)
        return e or []
        
    
