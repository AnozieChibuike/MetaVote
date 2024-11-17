// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
        string imageURL;
        string position;
    }

    struct Election {
        uint256 id;
        string name;
        uint256 candidateCount;
        uint256 voterCount;
        // uint256 whitelistStartTime;
        // uint256 whitelistEndTime;
        uint256 votingStartTime;
        uint256 votingEndTime;
        bool active;
        uint256 balance;
        address creator;
        string logoUrl;
    }
    event ElectionCreated(
        uint256 id,
        string name,
        uint256 candidateCount,
        uint256 voterCount,
        // uint256 whitelistStartTime,
        // uint256 whitelistEndTime,
        uint256 votingStartTime,
        uint256 votingEndTime,
        bool active,
        uint256 balance,
        address creator
    );
    uint256[] public electionIds;

    // Mappings
    mapping(uint256 => Election) public elections; // Mapping for elections
    mapping(uint256 => mapping(string => bool)) public isWhitelisted; // Whitelist for each election
    mapping(uint256 => mapping(string => bool)) public hasVoted; // Vote status for each election
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates; // Candidates for each election
    mapping(uint256 => mapping(uint256 => address)) public registrationToWallet; // Map registration numbers to wallet addresses per election
    mapping(uint256 => mapping(string => address)) public deviceToWallet;
    mapping(address => bool) public isElectionCreator; // Mapping to track who can create elections

    // Election counter
    uint256 public electionCount;
    uint256 public serviceFeePercentage = 5;

    // Events
    event Whitelisted(uint256 electionId, address voter);
    event VoteCasted(uint256 electionId, address voter, uint256 candidateId);
    event CandidateAdded(
        uint256 electionId,
        uint256 candidateId,
        string name,
        string imageURL
    );
    event ElectionCreatorAdded(address creator);
    event ElectionCreatorRemoved(address creator);
    event DepositMade(uint256 electionId, uint amount, uint256 serviceFee);
    event Withdrawal(uint256 electionId, uint256 amount, address creator);

    constructor() Ownable(msg.sender) {}

    // Modifiers for election-specific actions
    // modifier onlyDuringWhitelist(uint256 _electionId) {
    //     require(
    //         block.timestamp >= elections[_electionId].whitelistStartTime &&
    //             block.timestamp <= elections[_electionId].whitelistEndTime,
    //         "Whitelist period is closed"
    //     );
    //     _;
    // }


    modifier onlyDuringVoting(uint256 _electionId) {
        require(
            block.timestamp >= elections[_electionId].votingStartTime &&
                block.timestamp <= elections[_electionId].votingEndTime,
            "Voting period is closed"
        );
        _;
    }

    modifier onlyWhitelisted(uint256 _electionId, string memory _voter) {
        require(
            isWhitelisted[_electionId][_voter],
            "You are not whitelisted to vote"
        );
        _;
    }

    // Modifier to allow only approved election creators
    modifier onlyElectionCreator() {
        require(
            isElectionCreator[msg.sender],
            "You are not authorized to create elections"
        );
        _;
    }

    function deposit(uint256 _electionID) external payable onlyElectionCreator {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        // Calculate the service fee and add it to the balance of the election creator's wallet address
        uint256 serviceFee = (msg.value * serviceFeePercentage) / 100;
        elections[_electionID].balance += (msg.value - serviceFee);
        payable(owner()).transfer(serviceFee);
        emit DepositMade(_electionID, msg.value, serviceFee);
    }

    function withdrawBalance(uint256 _electionId, uint256 _amount) external {
        Election storage election = elections[_electionId];

        require(
            election.creator == msg.sender,
            "Only the election creator can withdraw"
        );
        require(
            election.balance > _amount,
            "Amount greater than Election reserve."
        );

        payable(msg.sender).transfer(_amount);

        // Update election balance
        election.balance -= _amount;

        emit Withdrawal(_electionId, _amount, msg.sender);
    }

    // Function to add addresses to the election creator whitelist (only the owner can do this)
    function addElectionCreator(address _creator) external {
        require(
            !isElectionCreator[_creator],
            "The address is already a creator"
        );
        isElectionCreator[_creator] = true;
        emit ElectionCreatorAdded(_creator);
    }

    // Function to remove addresses from the election creator whitelist (only the owner can do this)
    function removeElectionCreator(address _creator) external {
        require(
            isElectionCreator[_creator],
            "The creator address does not exist"
        );
        isElectionCreator[_creator] = false;
        emit ElectionCreatorRemoved(_creator);
    }

    // Function to create a new election (only whitelisted election creators can call this)
    function createElection(
        string memory _name,
        // uint256 _whitelistStartTime,
        // uint256 _whitelistEndTime,
        uint256 _votingStartTime,
        uint256 _votingEndTime,
        string memory _logoUrl
    ) external onlyElectionCreator {
        // require(
        //     _whitelistStartTime < _whitelistEndTime,
        //     "Whitelist end time must be after start time"
        // );
        require(
            _votingStartTime < _votingEndTime,
            "Voting end time must be after start time"
        );

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            name: _name,
            candidateCount: 0,
            voterCount: 0,
            // whitelistStartTime: _whitelistStartTime,
            // whitelistEndTime: _whitelistEndTime,
            votingStartTime: _votingStartTime,
            votingEndTime: _votingEndTime,
            active: true,
            balance: 0,
            creator: msg.sender,
            logoUrl: _logoUrl
        });

        electionIds.push(electionCount);

        emit ElectionCreated(
            electionCount,
            _name,
            0,
            0,
            // elections[electionCount].whitelistStartTime,
            // elections[electionCount].whitelistEndTime,
            elections[electionCount].votingStartTime,
            elections[electionCount].votingEndTime,
            true,
            0,
            msg.sender
        );
    }

    // Whitelist function with registration number for an election
    function whitelistUser(
        uint256 _electionId,
        string memory _registrationNumber,
        uint256 _estimatedGas
    ) external onlyOwner  {
        require(
            !isWhitelisted[_electionId][_registrationNumber],
            "User is already whitelisted"
        );
        require(
            elections[_electionId].balance > _estimatedGas,
            "Insufficient gas in reserve to whitelist wallet, tell the election creator"
        );

        // Link registration number and whitelist the user for the specific election
        isWhitelisted[_electionId][_registrationNumber] = true;
        
        elections[_electionId].voterCount++;
        elections[_electionId].balance -= _estimatedGas;
    }

    // Voting function for a specific election
    function vote(
        string memory _voter,
        uint256 _electionId,
        uint256 _candidateId,
        uint256 _estimatedGas
    )
        external
        onlyWhitelisted(_electionId, _voter)
        onlyOwner
        onlyDuringVoting(_electionId)
    {
        require(!hasVoted[_electionId][_voter], "You have already voted");
        require(
            _candidateId > 0 &&
                _candidateId <= elections[_electionId].candidateCount,
            "Invalid candidate"
        );
        require(
            elections[_electionId].balance > _estimatedGas,
            "Insufficient gas in reserve to vote, tell the election creator"
        );
        // Mark the voter as having voted and increment the vote count of the selected candidate
        hasVoted[_electionId][_voter] = true;
        candidates[_electionId][_candidateId].voteCount += 1;
        elections[_electionId].balance -= _estimatedGas;
    }

    function batchVote(
    string memory _voter,
    uint256 _electionId,
    uint256[] memory _candidateIds,
    uint256 _estimatedGas
)
    external
    onlyWhitelisted(_electionId, _voter)
    onlyOwner
    onlyDuringVoting(_electionId)
{
    require(!hasVoted[_electionId][_voter], "You have already voted");

    // Get the total number of candidates for the election
    uint256 candidateCount = elections[_electionId].candidateCount;
    require(candidateCount > 0, "No candidates available in this election");

    // Ensure gas reserve is sufficient
    require(
        elections[_electionId].balance > _estimatedGas,
        "Insufficient gas in reserve to vote, tell the election creator"
    );

    // Iterate over all candidate IDs provided
    for (uint256 i = 0; i < _candidateIds.length; i++) {
        uint256 candidateId = _candidateIds[i];

        // Validate the candidate ID
        require(
            candidateId > 0 && candidateId <= candidateCount,
            "Invalid candidate"
        );

        // Candidate memory candidate = candidates[_electionId][candidateId];

        // Ensure voter hasn't already voted for this position
        // Increment the vote count for the candidate
        candidates[_electionId][candidateId].voteCount += 1;

        // Mark position as voted
    }

    // Mark the voter as having voted
    hasVoted[_electionId][_voter] = true;

    // Deduct estimated gas from election balance
    elections[_electionId].balance -= _estimatedGas;
}


    // Admin function to add candidates to a specific election
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _imageURL,
        string memory _position
    ) external onlyOwner {
        // Ensure the election exists
        require(
            elections[_electionId].id == _electionId &&
                elections[_electionId].active,
            "Election does not exist"
        );
        // Increment candidate count for the election
        elections[_electionId].candidateCount++;
        uint256 candidateId = elections[_electionId].candidateCount;

        // Add the candidate to the mapping
        candidates[_electionId][candidateId] = Candidate(
            candidateId,
            _name,
            0,
            _imageURL,
            _position
        );

        emit CandidateAdded(_electionId, candidateId, _name, _imageURL);
    }

    // Function to get candidate information for a specific election
    function getCandidate(
        uint256 _electionId,
        uint256 _candidateId
    ) external view returns (Candidate memory) {
        return candidates[_electionId][_candidateId];
    }

    // Function to get all candidates for a specific election
    function getCandidates(
        uint256 _electionId
    ) external view returns (Candidate[] memory) {
        uint256 candidateCount = elections[_electionId].candidateCount;
        Candidate[] memory candidateArray = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            candidateArray[i - 1] = candidates[_electionId][i];
        }
        return candidateArray;
    }

    // // Function to check if a registration number is linked to a wallet in a specific election
    // function getWalletForRegistration(
    //     uint256 _electionId,
    //     string _registrationNumber
    // ) public view returns (address) {
    //     return !isWhitelisted[_electionId][_registrationNumber];
    // }

    // Function to get the total number of registered voters in a specific election
    function getTotalRegisteredVoters(
        uint256 _electionId
    ) external view returns (uint256) {
        return elections[_electionId].voterCount;
    }

    function getGasReserve(
        uint256 _electionId
    ) external view returns (uint256) {
        return elections[_electionId].balance;
    }

    function getElectionsByCreator(
        address _creator
    ) public view returns (Election[] memory) {
        // Count how many elections were created by this address
        uint256 count = 0;
        for (uint256 i = 0; i < electionIds.length; i++) {
            if (elections[electionIds[i]].creator == _creator) {
                count++;
            }
        }

        // Create a temporary array to hold the matching elections
        Election[] memory result = new Election[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < electionIds.length; i++) {
            if (elections[electionIds[i]].creator == _creator) {
                result[index] = elections[electionIds[i]];
                index++;
            }
        }

        return result;
    }

    function getElectionById(uint256 _electionId)
    public
    view
    returns (
        uint256 id,
        string memory name,
        uint256 candidateCount,
        uint256 voterCount,
        uint256 votingStartTime,
        uint256 votingEndTime,
        bool active,
        uint256 balance,
        address creator,
        string memory logoUrl
    )
{
    Election memory election = elections[_electionId];
    require(election.id == _electionId, "Election does not exist");

    return (
        election.id,
        election.name,
        election.candidateCount,
        election.voterCount,
        election.votingStartTime,
        election.votingEndTime,
        election.active,
        election.balance,
        election.creator,
        election.logoUrl
    );
}

}
