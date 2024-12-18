// src/pages/WhitelistPage.js
import React, { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "../contract.js";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import WalletButton from "../components/WalletButton.jsx";
import { Button, Modal, ModalBody, Table, TextInput } from "flowbite-react";
import Loader from "../components/loader.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GreenAlertBox from "../components/GreenAlertBox.jsx";
import RedAlertBox from "../components/RedAlertBox.jsx";
import REACT_APP_SERVER_URL from "../constant.js";
// import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";

const WhitelistPage = () => {
  const navigate = useNavigate();
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(contractABI, contractAddress, {
    handleRevert: true
  });
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [election, setElection] = useState("");
  const [popUp, setPopUp] = useState({});
  const [openModal, setOpenModal] = useState(false);

  function onCloseModal() {
    setOpenModal(false);
  }

  const {
    account,
    loading,
    setLoading,
    alert,
    setAlert,
    redAlert,
    setRedAlert
  } = useContext(AppContext);

  const urlParams = new URLSearchParams(window.location.search);

  // Extract the 'id' parameter
  const id = urlParams.get("id");
  const getAdmin = () => {
    const admin = sessionStorage.getItem("code") || null;
    return admin;
  };

  useEffect(() => {
    setAlert("");
    setRedAlert("");
  }, []);

  useEffect(() => {
    setOpenModal(true);
  }, [popUp]);
  useEffect(() => {
    if (!id) {
      setRedAlert("Election ID missing");
      navigate("/");
      return;
    }
    const admin = getAdmin();
    if (!admin) {
      setRedAlert("Session expired relogin");
      navigate("/");
      return;
    }
  }, []);
  useEffect(() => {
    if (id) {
      loadElection();
    }
  }, [id]);

  useEffect(() => {
    setInterval(() => updateCountdown(election, "whitelist", "voting"));
  }, [election]);

  const loadElection = async () => {
    setLoading(true);
    try {
      const election = await contract.methods.elections(Number(id)).call();

      if (Number(election?.votingStartTime == 0)) {
        setRedAlert("Invalid Election");
        navigate("/");
        return;
      }
      console.log(election);
      setElection(election);
    } catch (error) {
      console.error("Error loading Election:", error);
    } finally {
      setLoading(false);
    }
  };

  const whitelistUser = async () => {
    setAlert("");
    setRedAlert("");
    setLoading(true);
    try {
      const gass = await contract.methods
        .whitelistUser(Number(id), registrationNumber, 30000)
        .estimateGas({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      console.log(gass);
      const response = await fetch(`${REACT_APP_SERVER_URL}/whitelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          electionId: Number(id),
          registrationNumber,
          gas: Number(gass)
        })
      });
      const result = await response.json();
      // Add features, like generating the voter pin
      // Features to store the pin incase it is forgotten
      // Should not  be whitelisting after election starts
      // More features your head just dey pain you rn 6:35pm 11/13/2024 AgberoFRomPhhilly
      if (result.success) {
        setPopUp(result.newVoter);
        setAlert(
          <span>
            Voter with reg number: {registrationNumber} successfully
            whitelisted, click this{" "}
            <a
              target="_blank"
              href={`https://rpc.sepolia-api.lisk.com/tx/${result.transactionHash}`}
              class="font-semibold underline hover:no-underline"
            >
              link
            </a>{" "}
            to view the transaction on the blockchain explorer
          </span>
        );
      } else setRedAlert(result.error);
    } catch (error) {
      console.log(error);
      setRedAlert(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      {!!alert && <GreenAlertBox alert={alert} setAlert={setAlert} />}
      {popUp?.pin && (
        <Modal show={openModal} size="md" onClose={onCloseModal} popup>
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                New Whitelisted Voter
              </h3>
              <div>
                <p className="font-semibold text-black">Reg No:</p>
                <p className="text-black">{popUp.registrationNumber}</p>
                <p className="font-semibold text-black">Pin:</p>
                <p className="text-black">{popUp.pin}</p>
                <span className="italic text-red-700">
                  The above pin is unique to the registered voter... Give it out
                  to them as they would need it to vote
                </span>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
      <div className="px-3">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-3xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
        </div>
        <a href={"/manage?id=" + id} className="text-blue-700">
          Back
        </a>
        <div>
          <p id="voting"></p>
        </div>
        <div className="flex justify-center items-center">
          <img src={election?.logoUrl} className="w-32" />
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Whitelist for Election
        </h2>
        <TextInput
          type="number"
          placeholder="Registration Number"
          onChange={(e) => setRegistrationNumber(e.target.value)}
        />
        <span className="font-thin italic text-gray-400 font-sans">
          A string of characters will be generated for the user give them to
          secure it as it will be used as an identification for voting
        </span>
        <div className="py-3 flex justify-center items-center">
          <Button
            className="bg-blue-600 self-center justify-self-center"
            onClick={whitelistUser}
          >
            Whitelist Me
          </Button>
        </div>
      </div>
    </>
  );
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

export default WhitelistPage;
