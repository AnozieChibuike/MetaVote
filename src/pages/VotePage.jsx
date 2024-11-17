// src/pages/VotePage.js
import React, { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "../contract.js";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import WalletButton from "../components/WalletButton.jsx";
import { Button, Table } from "flowbite-react";
import Loader from "../components/loader.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VotePage = () => {
  const [selectedCandidateInfo, setSelected] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState("");
  const [election, setElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [gas, setGas] = useState(0);
  const { account, loading, setLoading } = useContext(AppContext);

  const urlParams = new URLSearchParams(window.location.search);

  // Extract the 'id' parameter
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) {
      alert("Election ID missing");
      navigate("/");
    }
  }, []);

  // const contractAddress = "0x1e78ff9407dd881f9ab17320Afc15A49d626ae00";
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(contractABI, contractAddress, {
    handleRevert: true,
  });
  useEffect(() => {
    if (id) {
      loadCandidates();
      loadElection();
    }
  }, [id, account]);

  useEffect(() => {
    if (selectedCandidateInfo?.name) notifyWithButtons();
  }, [selectedCandidateInfo]);

  useEffect(() => {
    setInterval(() => updateCountdown(election, "whitelist", "voting"));
  }, [election]);

  const loadCandidates = async () => {
    try {
      // const accounts = await web3.eth.requestAccounts();
      // const estimatedGas = await contract.methods
      //   .vote(1,2)
      //   .estimateGas({ from: accounts[0] });

      // setGas(estimatedGas);
      const candidateCount = await contract.methods
        .getCandidates(Number(id))
        .call();

      console.log(candidateCount);

      // const candidateList = [];
      // for (let i = 1; i <= candidateCount; i++) {
      //   const candidate = await contract.methods.getCandidate(electionId, i).call();
      //   candidateList.push(candidate);
      // }

      setCandidates(candidateCount);
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  };

  const loadElection = async () => {
    try {
      // const accounts = await web3.eth.requestAccounts();
      // const estimatedGas = await contract.methods
      //   .vote(1,2)
      //   .estimateGas({ from: accounts[0] });

      // setGas(estimatedGas);
      const election = await contract.methods.elections(Number(id)).call();

      if (Number(election.votingStartTime == 0)) {
        alert("Invalid Election");
        navigate("/");
        return;
      }

      // const candidateList = [];
      // for (let i = 1; i <= candidateCount; i++) {
      //   const candidate = await contract.methods.getCandidate(electionId, i).call();
      //   candidateList.push(candidate);
      // }

      setElection(election);
    } catch (error) {
      console.error("Error loading candidates:", error);
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

  const vote = async () => {
    if (!account) {
      alert("Connect your wallet before proceeding");
      return;
    }
    if (!selectedCandidateInfo?.name) {
      alert("Something went wrong");
      return;
    }
    try {
      const gass = await contract.methods
        .vote(account, Number(id), Number(selectedCandidateInfo.id), 30000)
        .estimateGas({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      const message = `I vote for ${selectedCandidateInfo.name}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [account, message],
      });
      const response = await fetch(`${REACT_APP_SERVER_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          electionId: Number(id),
          signature: signature,
          message,
          candidateId: Number(selectedCandidateInfo.id),
          userAddress: account,
          gas: Number(gass),
        }),
      });
      const result = await response.json();
      if (result.success)
        return {
          message: `Successfully Voted for ${selectedCandidateInfo.name}`,
          hash: result.transactionHash,
          status: true,
        };
      else return { message: result.error };
    } catch (error) {
      return { message: error.data.message };
    }
  };

  const CustomToastWithButtons = ({ closeToast }) => (
    <div className="">
      <p>
        Are you sure you want to vote for{" "}
        <span className="text-blue-500 font-bold">
          {selectedCandidateInfo?.name}
        </span>
        ?
      </p>
      <div className="flex justify-between m-5">
        <Button
          onClick={() => {
            // setDisabled(true);
            handleConfirm(closeToast);
          }}
          // disabled={disabled}
          className="bg-blue-600"
        >
          Confirm
        </Button>
        <Button
          className="bg-red-600"
          onClick={() => {
            setLoading(false);
            closeToast();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  const handleConfirm = (closeToast) => {
    closeToast();
    vote()
      .then((data) => {
        if (data?.status) {
          toast.success(data.message, { autoClose: 2000 });
          closeToast();
        } else {
          toast.warn(data.message, { autoClose: 2000 });
          closeToast();
        }
      })
      .catch((e) => {
        console.log(e);
        setDisabled(false);
        setLoading(false);
        closeToast();
      })
      .finally(() => {
        setDisabled(false);
        setLoading(false);
        closeToast();
      });

    // Closes the current toast
  };

  const notifyWithButtons = () => {
    toast(<CustomToastWithButtons />, {
      // style: {
      //   backgroundColor: "black",
      // },
      position: "top-center", // Center the toast at the top
      autoClose: false, // Keep open until interaction
      closeOnClick: false, // Prevent closing on click
      pauseOnHover: true,
    });
  };

  return (
    <>
      {loading && <Loader />}
      <div className="px-3">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-3xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
          <WalletButton />
        </div>
        <div>
          <p id="whitelist"></p>
          <p id="voting"></p>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Vote for a Candidate
        </h2>
        {/* {candidates.map((candidate, index) => (
          <li key={index}>
            {candidate.name} (Votes: {Number(candidate.voteCount)})
          </li>
        ))} */}

        {candidates.length === 0 ? (
          <p>No Candidates yet....</p>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell className="text-xl">Name</Table.HeadCell>
              <Table.HeadCell className="text-xl">Vote Count</Table.HeadCell>
              <Table.HeadCell className="text-xl">Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {candidates.map((item) => (
                <Table.Row
                  className="border-gray-700 bg-gray-800"
                  key={item[0]}
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {item[1]}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {Number(item[2])}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    <Button
                      className="bg-blue-600"
                      onClick={() => {
                        setLoading(true);
                        setSelected({
                          id: Number(item[0]),
                          name: item[1],
                        });
                      }}
                    >
                      Vote
                    </Button>
                    {/* {Number(item[0])} */}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        <ToastContainer />
      </div>
    </>
  );
};

export default VotePage;
