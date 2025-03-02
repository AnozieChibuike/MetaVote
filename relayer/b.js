const Web3 = require("web3");
// const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

// Web3 and contract setup
const web3 = new Web3.Web3(process.env.INFURA_URL);

const contractAddress = process.env.CONTRACT_ADDRESS;

const account = "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395";
const privateKey = process.env.RELAYER_PRIVATE_KEY;

const abi = [
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
];
const contract = new web3.eth.Contract(abi, contractAddress);

function generatePin() {
  return crypto.randomInt(100000, 1000000); // Generates a number between 100000 and 999999
}

// async function bulkWhitelisto(electionId, gasPerUser, inputFile, outputFile) {
//   // Read the txt file and split it into an array of registration numbers
//   const fileData = fs.readFileSync(inputFile, "utf-8");
//   const regNums = fileData
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line);

//   // Initialize or load existing whitelisted.json
//   const jsonFilePath = outputFile;
//   let whitelistedData = [];
//   if (fs.existsSync(jsonFilePath)) {
//     whitelistedData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
//   }

//   // Extract already whitelisted registration numbers to avoid duplicates
//   const alreadyWhitelisted = new Set(
//     whitelistedData.map((entry) => entry.registrationNumber)
//   );

//   // Filter out registration numbers that are already whitelisted
//   const newRegNums = regNums.filter(
//     (regNum) => !alreadyWhitelisted.has(regNum)
//   );

//   if (newRegNums.length === 0) {
//     console.log("🚫 No new registration numbers to whitelist.");
//     return;
//   }

//   try {
//     // Calculate gas and prepare the transaction
//     const gasPrice = await web3.eth.getGasPrice();
    
//     const txData = contract.methods
//       .batchWhitelistUsers(electionId, newRegNums, gasPerUser)
//       .encodeABI();

//     const tx = {
//       to: contractAddress,
//       data: txData,
//       from: account,
//       gasPrice
//     };

//     // Estimate gas for the batch
//     const estimatedGas = await web3.eth.estimateGas({ ...tx, from: account });
//     tx.gas = estimatedGas;
//     console.log(gasPrice, gasPerUser, estimatedGas)

//     // Sign the transaction
//     const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

//     // Send the transaction
//     const receipt = await web3.eth.sendSignedTransaction(
//       signedTx.rawTransaction
//     );

//     console.log(
//       `✅ Successfully whitelisted batch of ${newRegNums.length} voters.`,
//       `Transaction Hash: ${receipt.transactionHash}`
//     );

//     // Generate PINs and update whitelisted.json
//     const newEntries = newRegNums.map((regNum) => ({
//       registrationNumber: regNum,
//       pin: generatePin()
//     }));
//     whitelistedData.push(...newEntries);

//     fs.writeFileSync(jsonFilePath, JSON.stringify(whitelistedData, null, 2));
//     console.log("📋 Whitelist updated in whitelisted.json.");
//   } catch (error) {
//     console.log(error)
//     console.error("❌ Error in batch whitelisting:", error?.message || error);
//   }
// }

const fs = require("fs");

// async function bulkWhitelist(electionId, gasLimit) {
//   // Read the txt file and split it into an array of regNum
//   const fileData = fs.readFileSync("missing_regNos.txt", "utf-8");
//   const regNums = fileData
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line);

//   // Initialize or load existing whitelisted.json
//   let whitelistedData = [];
//   let errorData = [];
//   const jsonFilePath = "300.json";
//   const errorFilePath = "300error.json";
//   if (fs.existsSync(jsonFilePath)) {
//     whitelistedData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
//   }
//   if (fs.existsSync(errorFilePath)) {
//     errorData = JSON.parse(fs.readFileSync(errorFilePath, "utf-8"));
//   }
//   let nonce = await web3.eth.getTransactionCount(account, 'pending');

//   for (let i = 0; i < regNums.length; i++) {
//     const regNum = regNums[i];
//     try {
//       // Prepare the transaction
//       const txData = contract.methods.whitelistUser(electionId, regNum,30000).encodeABI();
//       const gasPrice = await web3.eth.getGasPrice();
//       const tx = {
//         to: contractAddress,
//         gas: gasLimit,
//         data: txData,
//         from: account,
//         gasPrice,

//       };

//       // Estimate gas to ensure it fits
//       const estimatedGas = await web3.eth.estimateGas({ ...tx, from: account });
//       tx.gas = estimatedGas;

//       // Sign the transaction
//       const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

//       // Send the transaction
//       const receipt = await web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction
//       );
//       console.log(
//         `✅ Successfully whitelisted ${regNum}:`,
//         receipt.transactionHash
//       );
     
//     } catch (error) {
//       console.error(`❌ Error whitelisting ${regNum}:`, error?.cause?.message);
//       console.error(`❌ Error whitelisting ${regNum}:`, error.message);
//       errorData.push({reg: regNum, reason: error?.cause?.message || error.message});
//       // Save to JSON after each successful operation
//       fs.writeFileSync(errorFilePath, JSON.stringify(errorData, null, 2));
//     } finally {
//        // Generate PIN and append to whitelisted data
//        const pin = generatePin();
//        whitelistedData.push({ registrationNumber: regNum, pin });
//        // Save to JSON after each successful operation
//        fs.writeFileSync(jsonFilePath, JSON.stringify(whitelistedData, null, 2));
//     }
//   }
//   console.log(
//     "📋 Bulk whitelist process completed. Check whitelisted.json for results."
//   );
// }


const csv = require("csv-parser");
const { parse } = require("json2csv");

async function bulkWhitelist(electionId, gasLimit) {
  const inputCsvFile = "100.csv";
  const jsonOutputFile = "100.json";
  const csvOutputFile ="100_output.csv";
  const errorFilePath ="100error.json";
  let whitelistedData = [];
  let errorData = [];
  let entries = [];
  
  if (fs.existsSync(jsonOutputFile)) {
    whitelistedData = JSON.parse(fs.readFileSync(jsonOutputFile, "utf-8"));
  }
  if (fs.existsSync(errorFilePath)) {
    errorData = JSON.parse(fs.readFileSync(errorFilePath, "utf-8"));
  }

  const readStream = fs.createReadStream(inputCsvFile).pipe(csv());
  for await (const row of readStream) {
    const name = row.name.trim();
    const regNum = row.regNo.trim();
    try {
      const txData = contract.methods.whitelistUser(electionId, regNum, 30000).encodeABI();
      const gasPrice = await web3.eth.getGasPrice();
      const tx = {
        to: contractAddress,
        gas: gasLimit,
        data: txData,
        from: account,
        gasPrice,
      };

      const estimatedGas = await web3.eth.estimateGas({ ...tx, from: account });
      tx.gas = estimatedGas;

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`✅ Successfully whitelisted ${regNum}:`, receipt.transactionHash);
    } catch (error) {
      console.error(`❌ Error whitelisting ${regNum}:`, error);
      errorData.push({ regNo: regNum, reason: error?.cause?.message || error.message });
      fs.writeFileSync(errorFilePath, JSON.stringify(errorData, null, 2));
      continue;
    }
    
    const pin = generatePin();
    const regNo = regNum
    whitelistedData.push({ regNo: regNum, pin });
    entries.push({ name, regNo, pin });
    fs.writeFileSync(jsonOutputFile, JSON.stringify(whitelistedData, null, 2));
  }

  const csvData = parse(entries, { fields: ["name", "regNo", "pin"] });
  fs.writeFileSync(csvOutputFile, csvData);
  console.log("📋 Bulk whitelist process completed. Check outputs for results.");
}



// // Example Call
const electionId = 4; // Replace with your electionId
const gasLimit = 300000; // Adjust gas limit as needed
bulkWhitelist(electionId, gasLimit);

// Example Call
// console.log("Whitelisting 100 level");
// bulkWhitelist(1, 30000, "100.txt", "100.json");

// console.log("Whitelisting 400 level");
// bulkWhitelist(1, 30000, "400.txt", "400.json");

// console.log("Whitelisting 500 level");
// bulkWhitelist(1, 30000, "500.txt", "500.json");
