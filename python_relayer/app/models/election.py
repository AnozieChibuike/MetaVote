from flasksqlalchemybasemodel import BaseModel, db
import json
from sqlalchemy.dialects.mysql import LONGTEXT

# for example a user model
class Election(BaseModel):
    __tablename__ = 'election'
    name = db.Column(db.String(108))
    blockchain_id = db.Column(db.Integer, unique=True)
    voter_count = db.Column(db.Integer, default=0)
    voted_count = db.Column(db.Integer, default=0)
    election_creator = db.Column(db.String(126))
    _voters = db.Column(LONGTEXT)

    def update_voter(self,voters: list):
        """
            [{},{}]
            keys: regNo, pin, has_voted, is_whitelisted
        """
        self._voters = json.dumps(voters)
        self.voter_count = len(voters)
        self.save()

    def append_voter(self,voter: dict):
        """
            {regNo: "", Pin: "", has_voted: false, is_whitelisted: false}
        """
        if self._voters:
            voters = json.loads(self._voters)
            voters.append(voter)
            self._voters = json.dumps(voters)
        else:
            self._voters = json.dumps([voter])
        self.voter_count = len(json.loads(self._voters))
        self.save()

    def get_voter_by_regNo(self, regNo: str):
        if self._voters:
            voters = json.loads(self._voters)
            for voter in voters:
                if voter["regNo"] == regNo:
                    return voter
        return None

    @property
    def voters(self):
        return json.loads(self.voters) if self._voters else []

    