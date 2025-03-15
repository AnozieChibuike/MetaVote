// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    address public owner1;
    address public owner2;

    struct Transaction {
        address to;
        uint256 value;
        string description;
        bool approvedByOwner1; 
        bool approvedByOwner2;
        bool executed;
    }
    
    Transaction[] public transactions;
    
    event TransactionSubmitted(uint256 indexed txIndex, address indexed to, uint256 value);
    event TransactionApproved(uint256 indexed txIndex, address indexed owner);
    event TransactionExecuted(uint256 indexed txIndex, address indexed to, uint256 value);
    
    modifier onlyOwners() {
        require(msg.sender == owner1 || msg.sender == owner2, "Not an owner");
        _;
    }
    
    constructor(address _owner1, address _owner2) {
        owner1 = _owner1;
        owner2 = _owner2;
    }
    
    function submitTransaction(address _to, uint256 _value, string memory _description) public onlyOwners {
        
        transactions.push(Transaction({
            to: _to,
            value: _value,
            description: _description,
            approvedByOwner1: msg.sender == owner1,
            approvedByOwner2: msg.sender == owner2,
            executed: false
        }));
        emit TransactionSubmitted(transactions.length - 1, _to, _value);
    }
    
    function approveTransaction(uint256 _txIndex) public onlyOwners {
        Transaction storage txn = transactions[_txIndex];
        require(!txn.executed, "Transaction already executed");

        if (msg.sender == owner1) {
            require(!txn.approvedByOwner1, "Already approved by owner1");
            txn.approvedByOwner1 = true;
        } else if (msg.sender == owner2) {
            require(!txn.approvedByOwner2, "Already approved by owner2");
            txn.approvedByOwner2 = true;
        }

        emit TransactionApproved(_txIndex, msg.sender);

        // Auto-execute if both owners have approved
        if (txn.approvedByOwner1 && txn.approvedByOwner2) {
            executeTransaction(_txIndex);
        }
    }
    
    function executeTransaction(uint256 _txIndex) internal {
        Transaction storage txn = transactions[_txIndex];
        require(!txn.executed, "Transaction already executed");
        require(txn.approvedByOwner1 && txn.approvedByOwner2, "Both owners must approve");
        require(txn.to == owner1 || txn.to == owner2, "Only owners can receive funds");

        txn.executed = true; // Mark as executed BEFORE sending funds
        (bool success, ) = txn.to.call{value: txn.value}("");
        if (!success) {
            txn.executed = false; // Revert execution flag if call fails
            revert("Transaction failed");
        }

        emit TransactionExecuted(_txIndex, txn.to, txn.value);
    }
    
    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }

    receive() external payable {}
}
