// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const cors = require("cors");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// Initialize web3 and contract
const web3 = new Web3.Web3(process.env.INFURA_URL);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "string",
        name: "_imageURL",
        type: "string"
      },
      {
        internalType: "string",
        name: "_position",
        type: "string"
      }
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address"
      }
    ],
    name: "addElectionCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_voter",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "_candidateIds",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_estimatedGas",
        type: "uint256"
      }
    ],
    name: "batchVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "string[]",
        name: "_registrationNumbers",
        type: "string[]"
      },
      {
        internalType: "uint256",
        name: "_estimatedGasPerUser",
        type: "uint256"
      }
    ],
    name: "batchWhitelistUsers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_votingStartTime",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_votingEndTime",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_logoUrl",
        type: "string"
      }
    ],
    name: "createElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionID",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "electionId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        indexed: false,
        internalType: "string",
        name: "imageURL",
        type: "string"
      }
    ],
    name: "CandidateAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "electionId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "serviceFee",
        type: "uint256"
      }
    ],
    name: "DepositMade",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateCount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voterCount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "active",
        type: "bool"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address"
      }
    ],
    name: "ElectionCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address"
      }
    ],
    name: "ElectionCreatorAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address"
      }
    ],
    name: "ElectionCreatorRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address"
      }
    ],
    name: "removeElectionCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_voter",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_estimatedGas",
        type: "uint256"
      }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "electionId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateId",
        type: "uint256"
      }
    ],
    name: "VoteCasted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "electionId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address"
      }
    ],
    name: "Whitelisted",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_registrationNumber",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_estimatedGas",
        type: "uint256"
      }
    ],
    name: "whitelistUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "electionId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address"
      }
    ],
    name: "Withdrawal",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "withdrawBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "imageURL",
        type: "string"
      },
      {
        internalType: "string",
        name: "position",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    name: "deviceToWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "electionCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "electionIds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "elections",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "candidateCount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "voterCount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        internalType: "string",
        name: "logoUrl",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256"
      }
    ],
    name: "getCandidate",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "imageURL",
            type: "string"
          },
          {
            internalType: "string",
            name: "position",
            type: "string"
          }
        ],
        internalType: "struct VotingSystem.Candidate",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      }
    ],
    name: "getCandidates",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "imageURL",
            type: "string"
          },
          {
            internalType: "string",
            name: "position",
            type: "string"
          }
        ],
        internalType: "struct VotingSystem.Candidate[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      }
    ],
    name: "getElectionById",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "candidateCount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "voterCount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        internalType: "string",
        name: "logoUrl",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address"
      }
    ],
    name: "getElectionsByCreator",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "candidateCount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "voterCount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "votingStartTime",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "votingEndTime",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool"
          },
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "creator",
            type: "address"
          },
          {
            internalType: "string",
            name: "logoUrl",
            type: "string"
          }
        ],
        internalType: "struct VotingSystem.Election[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      }
    ],
    name: "getGasReserve",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_electionId",
        type: "uint256"
      }
    ],
    name: "getTotalRegisteredVoters",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "isElectionCreator",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    name: "isWhitelisted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "registrationToWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "serviceFeePercentage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] // Replace with your contract's ABI
const votingContract = new web3.eth.Contract(contractABI, contractAddress);

// Initialize Express
const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const votersFilePath = path.resolve("voters.json");

// Helper function to read registration numbers from the file
const readVotersFile = () => {
  if (!fs.existsSync(votersFilePath)) {
    fs.writeFileSync(
      votersFilePath,
      JSON.stringify({ registrationNumbers: [] }, null, 2)
    );
  }
  const data = fs.readFileSync(votersFilePath, "utf-8");
  return JSON.parse(data).registrationNumbers;
};

// Helper function to write registration numbers to the file
const writeVotersFile = (registrationNumbers) => {
  fs.writeFileSync(
    votersFilePath,
    JSON.stringify({ registrationNumbers }, null, 2)
  );
};

const whitelistFilePath = path.resolve("whitelisted.json");

// Read from whitelisted.json
const readWhitelistFile = () => {
  if (!fs.existsSync(whitelistFilePath)) {
    fs.writeFileSync(whitelistFilePath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(whitelistFilePath, "utf-8"));
};

// Write to whitelisted.json
const writeWhitelistFile = (whitelistedVoters) => {
  fs.writeFileSync(
    whitelistFilePath,
    JSON.stringify(whitelistedVoters, null, 2)
  );
};

// Endpoint to check if voters.json is empty or not
app.get("/voters-file-status", (req, res) => {
  try {
    const registrationNumbers = readVotersFile();

    if (registrationNumbers.length === 0) {
      return res.json({
        isEmpty: true,
        message: "The voters.json file is empty."
      });
    }

    return res.json({
      isEmpty: false,
      message: "The voters.json file contains data."
    });
  } catch (error) {
    console.error("Error checking voters.json:", error);
    return res
      .status(500)
      .json({ error: "Could not check voters.json status." });
  }
});

// Endpoint to upload a file containing registration numbers
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);

  // Read and parse the uploaded file
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the file" });
    }

    const newRegNumbers = data
      .split("\n")
      .map((num) => num.trim())
      .filter(Boolean);
    const existingRegNumbers = readVotersFile();

    // Combine new and existing registration numbers
    const combinedRegNumbers = Array.from(
      new Set([...existingRegNumbers, ...newRegNumbers])
    );
    writeVotersFile(combinedRegNumbers);

    // Delete the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: `${newRegNumbers.length} registration numbers added.`
    });
  });
});
// Vote endpoint
app.post("/whitelist", async (req, res) => {
  const { electionId, registrationNumber, gas } = req.body;
  try {
    if (!registrationNumber) {
      return res.status(400).json({ error: "Registration number is required" });
    }

    const registrationNumbers = readVotersFile();

    if (!registrationNumbers.includes(registrationNumber)) {
      return res.status(404).json({ error: "Registration number not found" });
    }

    // Step 2: Read the current whitelist file
    const whitelistedVoters = readWhitelistFile();

    // Step 3: Check if the voter is already whitelisted
    const voter = whitelistedVoters.find(
      (v) => v.registrationNumber === registrationNumber
    );

    if (voter) {
      return res.json({
        message: "Voter already whitelisted",
        voter
      });
    }
    // Build the transaction
    const gasPrice = await web3.eth.getGasPrice();
    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.RELAYER_PRIVATE_KEY
    );
    const tx = {
      to: contractAddress,
      data: votingContract.methods
        .whitelistUser(electionId, registrationNumber, gas)
        .encodeABI(),
      from: account.address,
      gasPrice
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      account.privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    const newVoter = {
      registrationNumber,
      pin: generatePin()
    };

    // Step 5: Update the whitelist file
    whitelistedVoters.push(newVoter);
    writeWhitelistFile(whitelistedVoters);

    res.json({ success: true, transactionHash: receipt.transactionHash, newVoter });
  } catch (error) {
    console.log(error);
    if (
      error.cause?.message ===
      "execution reverted: You are not authorized to create elections"
    ) {
      res.status(500).json({
        success: false,
        error: "You are not authorized to create elections"
      });
      return;
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/verify-voter', async(req, res) => {
  
  const {registrationNumber, pin } = req.body;
  const whitelistedVoters = readWhitelistFile();
  const voter = whitelistedVoters.find(
    (v) => String(v.registrationNumber) === String(registrationNumber)
  );

  if (!voter) {
    console.log('cjdj')
    return res.json({ error: "Registration number not found." });
  }

  if (String(voter.pin) != String(pin)) {
    console.log(voter.pin)
    console.log(pin)
    return res.json({ error: "Incorrect pin." });
  }

  res.json({ success: true});
})

app.post("/vote", async (req, res) => {
  const { gas, electionId, candidatesList, registrationNumber } = req.body;
  
  console.log(candidatesList)

  const whitelistedVoters = readWhitelistFile();
  const voter = whitelistedVoters.find(
    (v) => v.registrationNumber === registrationNumber
  );

  if (!voter) {
    return res.status(404).json({ error: "Registration number not found." });
  }
  try {
    // Build the transaction
    const gasPrice = await web3.eth.getGasPrice();
    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.RELAYER_PRIVATE_KEY
    );
    const tx = {
      to: contractAddress,
      data: votingContract.methods
        .batchVote(registrationNumber, electionId, candidatesList, gas)
        .encodeABI(),
      // gas: 3000000,
      from: account.address,
      //   nonce: nonce,pppppp
      gasPrice
      // Set an appropriate gas limit
    };

    // console.log("TX ", tx);

    // Sign the transaction with the relayer's private key

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      account.privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log(receipt);

    res.json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.log(error);
    if (
      error.cause.message ===
      "execution reverted: You are not authorized to create elections"
    ) {
      res.status(500).json({
        success: false,
        error: "You are not authorized to create elections"
      });
      return;
    }
    res.status(500).json({ success: false, error: error.cause.message });
  }
});

app.get("/", async (req, res) => {
  res.json({success: "example"})
})

app.post("/create-election", async (req, res) => {
  const { electionName, electionLogoUrl, start, end } = req.body;
  console.log(req.body);
  try {
    // Build the transaction
    const gasPrice = await web3.eth.getGasPrice();
    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.RELAYER_PRIVATE_KEY
    );
    const tx = {
      to: contractAddress,
      data: votingContract.methods
        .createElection(electionName, start, end, electionLogoUrl)
        .encodeABI(),
      from: account.address,
      gasPrice
    };
    // Sign the transaction with the relayer's private key

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      account.privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log(receipt);
    res.json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/create-candidate", async (req, res) => {
  const { electionId, name, imageUrl, position } = req.body;
  console.log(req.body);
  try {
    // Build the transaction
    const gasPrice = await web3.eth.getGasPrice();
    const account = web3.eth.accounts.privateKeyToAccount(
      process.env.RELAYER_PRIVATE_KEY
    );
    const tx = {
      to: contractAddress,
      data: votingContract.methods
        .addCandidate(electionId, name, imageUrl, position)
        .encodeABI(),
      from: account.address,
      gasPrice
    };
    // Sign the transaction with the relayer's private key

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      account.privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log(receipt);
    res.json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.log(error);
    if (
      error?.cause?.message ===
      "execution reverted: You are not authorized to create elections"
    ) {
      res.status(500).json({
        success: false,
        error: "You are not authorized to create elections"
      });
      return;
    }
    res.status(500).json({ success: false, error: error?.cause?.message });
  }
});

// Generate a unique 6-digit pin
const generatePin = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Relayer listening on port ${PORT}`);
});
