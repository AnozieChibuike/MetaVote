// src/pages/ResultsPage.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { contractAddress, contractABI } from "../contract.js";

const ResultsPage = () => {
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const contractAddress = '0xad3F61A214bf4f9B25b94191CA516B9B9e1589b3';

  useEffect(() => {
    if (electionId) {
      loadResults();
    }
  }, [electionId]);

  const loadResults = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const candidateCount = await contract.methods.getCandidateCount(electionId).call();

      const candidateList = [];
      for (let i = 1; i <= candidateCount; i++) {
        const candidate = await contract.methods.getCandidate(electionId, i).call();
        candidateList.push(candidate);
      }

      setCandidates(candidateList);
    } catch (error) {
      console.error("Error loading results:", error);
    }
  };

  return (
    <div>
      <h2>Election Results</h2>
      <input type="number" placeholder="Election ID" onChange={(e) => setElectionId(e.target.value)} />
      <button onClick={loadResults}>Show Results</button>

      <h3>Results:</h3>
      <ul>
        {candidates.map((candidate, index) => (
          <li key={index}>
            {candidate.name} - Votes: {candidate.voteCount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultsPage;
