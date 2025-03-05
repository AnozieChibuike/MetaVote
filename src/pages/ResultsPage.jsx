// src/pages/ResultsPage.js
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";
import { contractAddress, contractABI } from "../contract.js";
import Web3 from "web3";
import { Button, Label, Modal, Table } from "flowbite-react";
import GreenAlertBox from "../components/GreenAlertBox.jsx";
import RedAlertBox from "../components/RedAlertBox.jsx";
import REACT_APP_SERVER_URL from "../constant.js";

const web3 = new Web3("https://rpc.sepolia-api.lisk.com");
const contract = new web3.eth.Contract(contractABI, contractAddress);

function ResultsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState({});
  const {
    loading,
    setLoading,
    alert,
    setAlert,
    redAlert,
    setRedAlert
  } = useContext(AppContext);
  const urlParams = new URLSearchParams(window.location.search);
  // const [price, setPrice] = useState(null);
  const [candidates, setCandidates] = useState([]);
  // const balance = web3.utils.fromWei(Number(items ? items[9] : 0), "ether");

  useEffect(() => {
    setAlert("");
    setRedAlert("");
  }, []);

  // Extract the 'id' parameter
  const id = urlParams.get("id");

  useEffect(() => {
    setAlert("");
    setRedAlert("");
    if (!id) {
      setRedAlert("Election ID missing");
      navigate("/create-election");
      return;
    }
    loadElection();
  }, []);

  const loadElection = async () => {
    setLoading(true);
    try {
      const election = await contract.methods.elections(Number(id)).call();
      if (Number(election.votingStartTime) == 0) {
        setRedAlert("Invalid Election");
        navigate("/");
        return;
      }
      setItems(election);
      console.log(election)
    } catch (error) {
      setRedAlert(error.message);
      console.error("Error loading election:", error);
    } finally {
      setLoading(false);
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

  const fetchCandidates = async () => {
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
      
  };

  useEffect(() => {
    if (!items?.id) {
      return;
    }
    setInterval(() => updateCountdown(items, "whitelist", "voting"));
    fetchCandidates();
    // fetchCurrentPrice();
  }, [items]);

  return (
    <>
      {loading && <Loader />}
      {!!alert && <GreenAlertBox setAlert={setAlert} alert={alert} />}
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      <div className="px-3">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-3xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
        </div>
        <div className="flex justify-center items-center">
          <img src={items?.logoUrl}  className="w-32"/>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Results
        </h2>
        <p>Name: {items?.name}</p>
        <div>
          {/* <p id="whitelist"></p> */}
          <p id="voting" className="text-gray-400 italic"></p>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">Candidates</h2>
        <div className="overflow-x-auto flex flex-col">
          {candidates.length == 0 && (
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
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell className="text-xl">Image</Table.HeadCell>
                    <Table.HeadCell className="text-xl">Name</Table.HeadCell>
                    <Table.HeadCell className="text-xl">
                      Vote Count
                    </Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {candidatesInPosition.map((item) => (
                      <Table.Row
                        key={item[0]}
                        className="border-gray-700 bg-gray-800"
                      >
                        <Table.Cell>
                          <img
                            src={item[3]} // Assuming item[3] is the imageURL field
                            alt={"Loading.."}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-black">
                          {item[1]} {/* Candidate Name */}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-black">
                          {Number(item[2])} {/* Vote Count */}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default ResultsPage;
