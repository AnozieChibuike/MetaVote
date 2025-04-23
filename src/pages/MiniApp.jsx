import React from 'react';
import { AppContext } from "../context/AppContext.jsx";
import RedAlertBox from "../components/RedAlertBox.jsx";
import GreenAlertBox from "../components/GreenAlertBox.jsx";
import REACT_APP_SERVER_URL, { rpcURL } from "../constant.js";
import { useContext, useState, useEffect } from "react";
import Loader from "../components/loader.jsx";
import { contractABI, contractAddress } from '../contract.js';
import Web3 from 'web3';
import { Button } from 'flowbite-react';

const id = 2

const MiniApp = () => {
    const {
        account,
        loading,
        setLoading,
        alert,
        setAlert,
        redAlert,
        setRedAlert
      } = useContext(AppContext);
      const [voterVerified, setVoterVerified] = useState(false);
       const [reggie, setReggie] = useState("");

      const verifyVoter = async (pin, registrationNumber) => {
        setLoading(true);
        try {
          const response = await fetch(`${REACT_APP_SERVER_URL}/verify-voter?election_id=${id}`, {
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
            // console.log(101010);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const regNumber = e.target.elements.regNumber.value;
        const pin = e.target.elements.pin.value;
        await verifyVoter(pin, regNumber);
    };
    return (
        <>
        {loading && <Loader />}
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      {!!alert && <GreenAlertBox alert={alert} setAlert={setAlert} />}
      {!voterVerified ? <div className="flex items-center justify-center min-h-screen text-black bg-black">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="regNumber"
                            className="block mb-2 text-sm font-medium text-gray-600"
                        >
                            Reg Number
                        </label>
                        <input
                            type="text"
                            id="regNumber"
                            name="regNumber"
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="pin"
                            className="block mb-2 text-sm font-medium text-gray-600"
                        >
                            Pin
                        </label>
                        <input
                            type="text"
                            id="pin"
                            name="pin"
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div> : <VotingView reggie={reggie} voterVerified={voterVerified} /> }
        
        </>
    );
};

const VotingView = ({ voterVerified, reggie }) => {
    if (!voterVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen text-black bg-black">
                <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
                        Please log in to vote
                    </h2>
                </div>
            </div>
        );
    }
    const [election, setElection] = useState("");
    const [candidates, setCandidates] = useState([]);   
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
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

     useEffect(() => {
        // If both conditions are true, enable the button
        if (selectedCandidates.length > 0 && !hasVoted) {
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true); // Keep button disabled until both conditions are true
        }
      }, [selectedCandidates, hasVoted, votable]);

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
      const checkVoted = async (registrationNumber) => {
        try {
          const voted = await contract.methods
            .hasVoted(Number(id), registrationNumber)
            .call({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
          setHasVoted(voted);
        } catch (e) {
          console.log(e);
        }
      };
      const web3 = new Web3(rpcURL);
        const contract = new web3.eth.Contract(contractABI, contractAddress, {
          handleRevert: true
        });

    useEffect(()=> {
        checkVoted(reggie);
        loadElection()
        loadCandidates()
    }, [])

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
          <a className="text-3xl font-bold text-green-600 cursor-pointer" href="/mini">
            AS<span className="text-red-400">ICT</span>
          </a>
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
        {/* <span className="inline">See the live election results </span>
        <a
          className="italic text-green-600"
          target="_blank"
          href={`http://${window.location.host}/results?id=${Number(id)}`}
        >
          here
        </a> */}
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
                            ? "bg-green-600"
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

export default MiniApp;