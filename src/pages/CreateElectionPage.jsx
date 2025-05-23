// src/pages/CreateElectionPage.js
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import WalletButton from "../components/WalletButton";
import Web3 from "web3";
import { contractAddress, contractABI } from "../contract.js";
import FaqSection from "../components/faqs.jsx";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import Loader from "../components/loader.jsx";
import { useNavigate } from "react-router-dom";
import GreenAlertBox from "../components/GreenAlertBox.jsx";
import RedAlertBox from "../components/RedAlertBox.jsx";
import REACT_APP_SERVER_URL,{ explorerURL, rpcURL } from "../constant.js";
import checkSession from "../helper/session.js";

const CreateElectionPage = () => {
  checkSession()
  const navigate = useNavigate();
  const [elect, setElect] = useState({});
  const [depElections, setDepElections] = useState([]);
  const [electionName, setElectionName] = useState("");
  const [electionLogoUrl, setElectionLogoUrl] = useState("");
  const [whitelistStart, setWhitelistStart] = useState("");
  const [whitelistEnd, setWhitelistEnd] = useState("");
  const [votingStart, setVotingStart] = useState("");
  const [votingEnd, setVotingEnd] = useState("");
  const [electionLoading, setElectionLoading] = useState(false);

  const web3 = new Web3(rpcURL);
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const {
    loading,
    setLoading,
    account,
    alert,
    setAlert,
    redAlert,
    setRedAlert
  } = useContext(AppContext);

  function logErrorDetails(error) {
    console.log("Error Details:");
    for (const [key, value] of Object.entries(error)) {
      console.log(`${key}:`, value);
    }
  }

  const populateElections = async () => {
    setElectionLoading(true);
    try {
      console.log(account);
      const elections = await contract.methods
        .getElectionsByCreator(account)
        .call({ from: account });
        const filteredElections = elections.filter(election => election.id > 15);
      setDepElections(filteredElections);
      console.log(elections);
    } catch (error) {
      console.log(error);
      logErrorDetails(error);
      setRedAlert(
        "Error: " +
          error.message +
          " Deployed Elections check your internet connection"
      );
    } finally {
      setElectionLoading(false);
    }
  };

  useEffect(() => {
    setAlert("");
    setRedAlert("");
  }, []);
  console.log(REACT_APP_SERVER_URL);

  useEffect(() => {
    populateElections();
  }, [redAlert]);

  const createElection = async () => {
    if (!electionName || !votingStart || !votingEnd) {
      console.log(electionName, votingStart, votingEnd, electionLogoUrl);
      setRedAlert("Missing some required parameters to create the election");
      return;
    }
    if (dateToTimestamp(votingStart) > dateToTimestamp(votingEnd)) {
      setRedAlert("Voting start time must be before voting end time");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${REACT_APP_SERVER_URL}/create-election`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          electionName,
          electionLogoUrl,
          start: dateToTimestamp(votingStart),
          end: dateToTimestamp(votingEnd)
        })
      });
      const body = await response.json();
      if (body.success) {
        setAlert(
          <span>
            Election created successfully, click this{" "}
            <a
              target="_blank"
              href={`${explorerURL}/tx/${body.transactionHash}`}
              class="font-semibold underline hover:no-underline"
            >
              link
            </a>{" "}
            to view the transaction on the blockchain explorer
          </span>
        );
        populateElections();
      } else setRedAlert(body.error);
      console.log(body);
    } catch (error) {
      setRedAlert(String(error));
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // TODO: Implement a function to check elections from backend, compare to blockchain data and use that data to show admins
  return (
    <>
    
      {loading && <Loader />}
      {!!alert && <GreenAlertBox alert={alert} setAlert={setAlert} />}
      {!!redAlert && <RedAlertBox alert={redAlert} setAlert={setRedAlert} />}
      <div className="px-3">
        <div className="flex flex-row justify-between items-center p-3">
          <a className="text-3xl font-bold text-green-600 cursor-pointer" href="/">
          Meta<span className="text-red-400">Vote</span>
          </a>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Create Election
        </h2>
        <p>Name of Election</p>
        <input
          type="text"
          placeholder="Election Name"
          className="text-black w-full mb-3"
          onChange={(e) => setElectionName(e.target.value)}
        />
        <p>Election Logo Url</p>
        <input
          type="text"
          placeholder="A link to the logo of the election"
          className="text-black w-full mb-3"
          onChange={(e) => setElectionLogoUrl(e.target.value)}
        />
        {/* <p>Set Voter's whitelist start time</p>
        <input
          type="datetime-local"
          placeholder="Whitelist Start Time"
          className="text-black w-full mb-3"
          onChange={(e) => setWhitelistStart(e.target.value)}
        />
        <p>Set Voter's whitelist end time</p>
        <input
          type="datetime-local"
          placeholder="Whitelist End Time"
          className="text-black w-full mb-3"
          onChange={(e) => setWhitelistEnd(e.target.value)}
        /> */}
        <p>Set Voting start time</p>
        <input
          type="datetime-local"
          placeholder="Voting Start Time"
          className="text-black w-full mb-3"
          onChange={(e) => setVotingStart(e.target.value)}
        />
        <p>Set voting end time</p>
        <input
          type="datetime-local"
          placeholder="Voting End Time"
          className="text-black w-full"
          onChange={(e) => setVotingEnd(e.target.value)}
        />
        <button
          className="bg-green-700 my-5 p-3 rounded block disabled:bg-gray-500"
          onClick={createElection}
          // disabled={!account}
        >
          Create Election
        </button>
        <hr></hr>
        <h1 className="text-center my-6 text-2xl font-semibold">
          Deployed Elections
        </h1>
        <div className="mb-6">
          {electionLoading && <p>Loading elections...</p>}
          {depElections.length == 0 && !electionLoading && (
            <p>No deployed elections</p>
          )}
          {depElections.map((items) => (
            <div
              className="flex flex-row items-center justify-between mb-3"
              key={items.id}
            >
              <p className="text-white">{items.name}</p>
              <button
                className="p-2 bg-green-700 rounded-md"
                onClick={() => {
                  // setElect({ ...items });
                  navigate(`/manage?id=${items.id}`);
                  // console.log(items);
                }}
              >
                Manage
              </button>
            </div>
          ))}
        </div>
        {elect?.id && <CandidateModal elect={elect} setElect={setElect} />}
        <hr></hr>
        <FaqSection />
      </div>
    </>
  );
};

function dateToTimestamp(dateString) {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

export default CreateElectionPage;
