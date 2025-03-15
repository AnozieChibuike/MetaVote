// src/pages/VotePage.js
import React, { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "../contract.js";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button, Table } from "flowbite-react";
import Loader from "../components/loader.jsx";
import "react-toastify/dist/ReactToastify.css";
import REACT_APP_SERVER_URL from "../constant.js";
import RedAlertBox from "../components/RedAlertBox.jsx";
import GreenAlertBox from "../components/GreenAlertBox.jsx";

const VotePage = () => {
  const [selectedCandidateInfo, setSelected] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState("");
  const [election, setElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [gas, setGas] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votable, setVotable] = useState(true);
  const {
    account,
    loading,
    setLoading,
    alert,
    setAlert,
    redAlert,
    setRedAlert
  } = useContext(AppContext);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [voterVerified, setVoterVerified] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [reggie, setReggie] = useState("");

  // Use effect to update button state when conditions change
  useEffect(() => {
    // If both conditions are true, enable the button
    if (voterVerified && selectedCandidates.length > 0 && !hasVoted) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true); // Keep button disabled until both conditions are true
    }
  }, [voterVerified, selectedCandidates, hasVoted, votable]);

  // Handle candidate selection
  const handleSelectCandidate = (position, candidateId) => {
    setSelectedCandidates((prevState) => {
      // Check if the candidate has already been selected for the given position
      const existingSelection = prevState.find(
        (selection) => selection.position === position
      );

      if (existingSelection) {
        // If a candidate is already selected for this position, update the selection
        return prevState.map((selection) =>
          selection.position === position
            ? { position, candidateId }
            : selection
        );
      } else {
        // Otherwise, add the new selection to the array
        return [...prevState, { position, candidateId }];
      }
    });
  };

  const urlParams = new URLSearchParams(window.location.search);

  // Extract the 'id' parameter
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) {
      setRedAlert("Election ID missing");
      navigate("/");
    }
  }, []);
  // TODO: Check Has Voted works
  const checkVoted = async (registrationNumber) => {
    try {
      const voted = await contract.methods
        .hasVoted(Number(id), registrationNumber)
        .call({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      console.log(voted);
      setHasVoted(voted);
    } catch (e) {
      console.log(e);
    }
  };

  // const contractAddress = "0x1e78ff9407dd881f9ab17320Afc15A49d626ae00";
  const web3 = new Web3("https://rpc.sepolia-api.lisk.com");
  const contract = new web3.eth.Contract(contractABI, contractAddress, {
    handleRevert: true
  });

  const verifyVoter = async (pin, registrationNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`${REACT_APP_SERVER_URL}/verify-voter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pin,
          registrationNumber
        })
      });
      const body = await response.json();

      if (body?.error) {
        setVoterVerified(false);
        console.log(101010);
        setRedAlert(body.error);
        return;
      }
      if (body?.success) {
        setAlert("Voter Logged in, Goodluck");
        setReggie(registrationNumber);
        setVoterVerified(true);
        return;
      }
    } catch (error) {
      console.log("e", error);
      setRedAlert(error.message);
      setVoterVerified(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const registrationNumber = prompt("Input your Reg Number");
    const pin = prompt("Input your pin");
    if (!pin) {
      setRedAlert(
        "No pin supplied, You cannot vote until you are authenticated, refresh page to retry"
      );
      setVoterVerified(false);
    } else if (!registrationNumber) {
      setRedAlert(
        "No Registration Number supplied, You cannot vote until you are authenticated, refresh page to retry"
      );
      setVoterVerified(false);
    } else verifyVoter(pin, registrationNumber);
  }, []);

  useEffect(() => {
    if (id) {
      loadElection();
      loadCandidates();
    }
  }, [id, account]);

  useEffect(() => {
    checkVoted(reggie);
  }, [reggie]);

  useEffect(() => {
    if (selectedCandidateInfo?.name) notifyWithButtons();
  }, [selectedCandidateInfo]);

  useEffect(() => {
    setInterval(() => updateCountdown(election, "whitelist", "voting"));
  }, [election]);

  const loadCandidates = async () => {
    setLoading(true)
    try {
      const candidateCount = await contract.methods
        .getCandidates(Number(id))
        .call({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
        const filteredCandidates = candidateCount.filter(
          (c) =>
            !(
              (c.position.toLowerCase() === "president" && c.name.toLowerCase() === "chukwuma divine osinachi") ||
              c.name.toLowerCase() === "chuka"
            )
        );
        
        setCandidates(filteredCandidates);
      
    } catch (error) {
      setRedAlert(error.message)
      console.error("Error loading candidates:", error);
    } finally {
      setLoading(false)
    }
  };

  const loadElection = async () => {
    try {
      const election = await contract.methods
        .elections(Number(id))
        .call({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      console.log(election);
      if (Number(election.votingStartTime == 0)) {
        alert("Invalid Election");
        navigate("/");
        return;
      }
      console.log(election);
      setElection(election);
    } catch (error) {
      setRedAlert(error.message)
      console.error("Error loading Election:", error);
    }
  };

  const updateCountdown = (items, whitelistElementId, votingElementId) => {
    const VStart = Number(items?.votingStartTime);
    const VEnd = Number(items?.votingEndTime);
    const WStart = Number(items?.whitelistStartTime);
    const WEnd = Number(items?.whitelistEndTime);

    if (!items) return;

    const currentTime = Math.floor(Date.now() / 1000);

    // Function to calculate and update the countdown
    const setCountdownText = (
      targetTime,
      endTime,
      element,
      startText,
      endText,
      startedText,
      endedText
    ) => {
      const elementNode = document.getElementById(element);
      if (!elementNode) return;

      if (currentTime < targetTime) {
        // Event has not started
        const timeDiff = targetTime - currentTime;
        const days = Math.floor(timeDiff / (3600 * 24));
        const hours = Math.floor((timeDiff % (3600 * 24)) / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);
        const seconds = timeDiff % 60;
        elementNode.innerHTML = `${startText} in ${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (currentTime >= targetTime && currentTime < endTime) {
        // Event is ongoing
        const timeDiff = endTime - currentTime;
        const days = Math.floor(timeDiff / (3600 * 24));
        const hours = Math.floor((timeDiff % (3600 * 24)) / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);
        const seconds = timeDiff % 60;
        elementNode.innerHTML = `${startedText}, ends in ${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        // Event has ended
        const timeSinceEnd = currentTime - endTime;
        const days = Math.floor(timeSinceEnd / (3600 * 24));
        const hours = Math.floor((timeSinceEnd % (3600 * 24)) / 3600);
        const minutes = Math.floor((timeSinceEnd % 3600) / 60);
        const seconds = timeSinceEnd % 60;
        elementNode.innerHTML = `${endedText} ${days}d ${hours}h ${minutes}m ${seconds}s ago`;
      }
    };

    // Update countdown for whitelist
    setCountdownText(
      WStart,
      WEnd,
      whitelistElementId,
      "Whitelist starts",
      "Whitelist ends",
      "Whitelist ongoing",
      "Whitelist ended"
    );

    // Update countdown for voting
    setCountdownText(
      VStart,
      VEnd,
      votingElementId,
      "Voting starts",
      "Voting ends",
      "Voting ongoing",
      "Voting ended"
    );
  };

  const updateStateBasedOnTimestamps = (start, end) => {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in Unix seconds
  
    if (currentTimestamp < start || currentTimestamp > end) {
      setVotable(false)
    }
  };

  useEffect(() => {
    if (election?.id) updateStateBasedOnTimestamps(election?.votingStartTime, election?.votingEndTime)
  }, [election])
  //TODO: Define vote function @backend... finalize
  const vote = async () => {
    setAlert("");
    setRedAlert("");
    setLoading(true);
    try {
      const gass = await contract.methods
        .batchVote(reggie, Number(id), [1, 2, 3], 30000)
        .estimateGas({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      const response = await fetch(`${REACT_APP_SERVER_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registrationNumber: reggie,
          electionId: Number(id),
          gas: Number(gass),
          candidatesList: selectedCandidates.map((item) =>
            Number(item.candidateId)
          )
        })
      });
      const result = await response.json();
      if (result.success) {
        setAlert("You have successfully voted, Thank you");
        checkVoted(reggie);
      } else setRedAlert(result.error);
    } catch (error) {
      console.log(error);
      setRedAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      {!!alert && <GreenAlertBox alert={alert} setAlert={setAlert} />}
      <div className="px-3">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-3xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
        </div>
        {/* <div>
          <p id="voting"></p>
        </div>
        {!votable && <p className="italic text-red-600 text-sm">Voting is closed</p>} */}
        <div className="flex justify-center items-center">
          <img src={election?.logoUrl} className="w-32" />
        </div>

        <div className="p-2 my-3 bg-gray-600">
          <p className="font-bold">Voter Verification Status:</p>
          {voterVerified ? (
            <p className="text-green-600">Verified</p>
          ) : (
            <p className="text-red-600">Not Verified</p>
          )}
          {hasVoted && (
            <>
              <p className="italic">Info: You have already voted</p>
            </>
          )}
        </div>
        <span className="inline">See the live election results </span>
        <a
          className="italic text-blue-600"
          target="_blank"
          href={`http://${window.location.host}/results?id=${Number(id)}`}
        >
          here
        </a>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Vote for a Candidate
        </h2>

        <div className="overflow-x-auto flex flex-col">
          {candidates.length === 0 && (
            <p className="text-center mb-5 italic">No Candidates yet</p>
          )}
          {candidates.length > 0 &&
            // Group candidates by position
            Object.entries(
              candidates.reduce((acc, item) => {
                const position = item[4]; // Assuming item[4] is the position field
                if (!acc[position]) acc[position] = [];
                acc[position].push(item);
                return acc;
              }, {})
            ).map(([position, candidatesInPosition]) => (
              <div key={position} className="mb-8">
                {/* Position Header */}
                <h2 className="text-2xl font-bold text-white mb-4">
                  {position}
                </h2>
                <div className="divide-y">
                  {candidatesInPosition.map((item) => (
                    <div
                      key={item[0]}
                      className="flex items-center justify-between border-gray-700 bg-gray-800 p-4"
                    >
                      <div className="flex items-center">
                        <img
                          src={item[3]} // Assuming item[3] is the imageURL field
                          alt="Candidate"
                          className="w-12 h-12 object-cover rounded-full mr-4"
                        />
                        <span className="text-xl font-medium text-white">
                          {item[1]}
                        </span>{" "}
                        {/* Candidate Name */}
                      </div>
                      <Button
                        className={`${
                          selectedCandidates.some(
                            (selection) =>
                              selection.position === position &&
                              selection.candidateId === item[0]
                          )
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        } text-white px-4 py-2 rounded`}
                        onClick={() => handleSelectCandidate(position, item[0])}
                      >
                        {selectedCandidates.some(
                          (selection) =>
                            selection.position === position &&
                            selection.candidateId === item[0]
                        )
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          <Button
            className="bg-green-600 mt-5 self-center"
            onClick={vote}
            disabled={isButtonDisabled}
          >
            Vote
          </Button>
        </div>
      </div>
    </>
  );
};

export default VotePage;
