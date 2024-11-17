const Web3 = require("web3");

// Initialize web3 and the contract
const web3 = new Web3("YOUR_INFURA_OR_ALCHEMY_URL");
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  /* ABI from the compiled contract */
];
const votingContract = new web3.eth.Contract(contractABI, contractAddress);

// Event listeners
votingContract.events.Whitelisted().on("data", (event) => {
  console.log("Whitelisted:", event.returnValues.voter);
});

votingContract.events.VoteCasted().on("data", (event) => {
  console.log(
    "Vote Casted:",
    event.returnValues.voter,
    "Candidate ID:",
    event.returnValues.candidateId
  );
});

votingContract.events.CandidateAdded().on("data", (event) => {
  console.log(
    "Candidate Added:",
    event.returnValues.candidateId,
    "Name:",
    event.returnValues.name
  );
});

// Function to whitelist a user
async function whitelistUser(registrationNumber, account) {
  const result = await votingContract.methods
    .whitelistUser(registrationNumber)
    .send({ from: account });
  console.log("Whitelist Transaction:", result.transactionHash);
}

// Function to vote for a candidate
async function vote(candidateId, account) {
  const result = await votingContract.methods
    .vote(candidateId)
    .send({ from: account });
  console.log("Vote Transaction:", result.transactionHash);
}

// Function to add a candidate (admin only)
async function addCandidate(name, imageURL, account) {
  const result = await votingContract.methods
    .addCandidate(name, imageURL)
    .send({ from: account });
  console.log("Add Candidate Transaction:", result.transactionHash);
}

// Function to get a candidate's information
async function getCandidate(candidateId) {
  const candidate = await votingContract.methods
    .getCandidate(candidateId)
    .call();
  console.log("Candidate Info:", candidate);
}

// Function to get all candidates
async function getCandidates() {
  const candidates = await votingContract.methods.getCandidates().call();
  console.log("All Candidates:", candidates);
}

// Function to get wallet for a registration number
async function getWalletForRegistration(registrationNumber) {
  const walletAddress = await votingContract.methods
    .getWalletForRegistration(registrationNumber)
    .call();
  console.log("Wallet Address for Registration Number:", walletAddress);
}

// Function to get total registered voters
async function getTotalRegisteredVoters() {
  const totalVoters = await votingContract.methods
    .getTotalRegisteredVoters()
    .call();
  console.log("Total Registered Voters:", totalVoters);
}

const deployContract = async () => {
  if (!whitelistStart || !whitelistEnd || !votingStart || !votingEnd) {
    alert("Please enter all dates for the whitelist and voting periods.");
    return;
  }

  try {
    const accounts = await web3.eth.getAccounts();
    const contractInstance = new web3.eth.Contract(ABI); // Your ABI here

    const deployedContract = await contractInstance
      .deploy({
        data: CONTRACT_BYTECODE,
        arguments: [
          Math.floor(new Date(whitelistStart).getTime() / 1000),
          Math.floor(new Date(whitelistEnd).getTime() / 1000),
          Math.floor(new Date(votingStart).getTime() / 1000),
          Math.floor(new Date(votingEnd).getTime() / 1000),
        ],
      })
      .send({ from: accounts[0] });

    setNewContractAddress(deployedContract.options.address);
    setContract(deployedContract);
    alert(
      `Contract successfully deployed at ${deployedContract.options.address}`
    );
  } catch (error) {
    console.error("Error deploying contract", error);
  }
};

// Example usage
// (async () => {
//     const accounts = await web3.eth.getAccounts();

//     // Replace with actual values
//     await whitelistUser(123, accounts[0]);
//     await vote(1, accounts[0]);
//     await addCandidate('John Doe', 'http://example.com/image.jpg', accounts[0]);
//     await getCandidate(1);
//     await getCandidates();
//     await getWalletForRegistration(123);
//     await getTotalRegisteredVoters();
// })();
