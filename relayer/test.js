// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const cors = require("cors");
const crypto = require("crypto");
const Datastore = require("nedb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// Initialize web3 and contract
const web3 = new Web3.Web3(process.env.INFURA_URL);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
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
  }
]; // Replace with your contract's ABI
const votingContract = new web3.eth.Contract(contractABI, contractAddress);

// Initialize Express
const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// Initialize NeDB databases
const votersDb = new Datastore({ filename: "voters.db", autoload: true });
const whitelistDb = new Datastore({ filename: "whitelist.db", autoload: true });

// Check if voters database is empty
app.get("/voters-file-status", (req, res) => {
  votersDb.find({}, (err, docs) => {
    if (err) {
      console.error("Error reading voters database:", err);
      return res.status(500).json({ error: "Could not check voters database status." });
    }

    const isEmpty = docs.length === 0;
    res.json({
      isEmpty,
      message: isEmpty ? "The voters database is empty." : "The voters database contains data."
    });
  });
});

// Upload and add registration numbers
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the file" });
    }

    const newRegNumbers = data.split("\n").map((num) => num.trim()).filter(Boolean);

    votersDb.find({}, (err, docs) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const existingRegNumbers = docs.map((doc) => doc.registrationNumber);
      const combinedRegNumbers = Array.from(new Set([...existingRegNumbers, ...newRegNumbers]));

      const newEntries = combinedRegNumbers
        .filter((num) => !existingRegNumbers.includes(num))
        .map((num) => ({ registrationNumber: num }));

      votersDb.insert(newEntries, (err) => {
        if (err) return res.status(500).json({ error: "Error updating database" });

        fs.unlinkSync(filePath); // Clean up uploaded file
        res.json({ message: `${newEntries.length} registration numbers added.` });
      });
    });
  });
});

// Whitelist voters
app.post("/whitelist", async (req, res) => {
  const { electionId, registrationNumber, gas } = req.body;

  if (!registrationNumber) {
    return res.status(400).json({ error: "Registration number is required" });
  }

  votersDb.findOne({ registrationNumber }, async (err, voter) => {
    if (err || !voter) {
      return res.status(404).json({ error: "Registration number not found" });
    }

    whitelistDb.findOne({ registrationNumber }, async (err, existingVoter) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (existingVoter) {
        return res.json({ message: "Voter already whitelisted", voter: existingVoter });
      }

      try {
        const gasPrice = await web3.eth.getGasPrice();
        const account = web3.eth.accounts.privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY);
        const tx = {
          to: contractAddress,
          data: votingContract.methods.whitelistUser(electionId, registrationNumber, gas).encodeABI(),
          from: account.address,
          gasPrice
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        const newVoter = { registrationNumber, pin: generatePin() };

        whitelistDb.insert(newVoter, (err) => {
          if (err) return res.status(500).json({ error: "Error saving to whitelist database" });

          res.json({ success: true, transactionHash: receipt.transactionHash, newVoter });
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  });
});

// Verify voter
app.post("/verify-voter", (req, res) => {
  const { registrationNumber, pin } = req.body;

  whitelistDb.findOne({ registrationNumber }, (err, voter) => {
    if (err || !voter) {
      return res.status(404).json({ error: "Registration number not found." });
    }

    if (voter.pin !== pin) {
      return res.status(400).json({ error: "Incorrect PIN." });
    }

    res.json({ success: true });
  });
});

// Vote endpoint
app.post("/vote", async (req, res) => {
  const { gas, electionId, candidatesList, registrationNumber } = req.body;

  whitelistDb.findOne({ registrationNumber }, async (err, voter) => {
    if (err || !voter) {
      return res.status(404).json({ error: "Registration number not found." });
    }

    try {
      const gasPrice = await web3.eth.getGasPrice();
      const account = web3.eth.accounts.privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY);
      const tx = {
        to: contractAddress,
        data: votingContract.methods.batchVote(registrationNumber, electionId, candidatesList, gas).encodeABI(),
        from: account.address,
        gasPrice
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      res.json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

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
