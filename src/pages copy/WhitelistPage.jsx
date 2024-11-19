// src/pages/WhitelistPage.js
import React, { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "../contract.js";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import WalletButton from "../components/WalletButton.jsx";
import { Button, Table, TextInput } from "flowbite-react";
import Loader from "../components/loader.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";

const WhitelistPage = () => {
  const { isLoading, error, data, getData } = useVisitorData(
    { extendedResult: true },
    { immediate: true }
  );
  const web3 = new Web3("https://rpc.sepolia-api.lisk.com");
  const contract = new web3.eth.Contract(contractABI, contractAddress, {
    handleRevert: true,
  });
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [election, setElection] = useState("");

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
  useEffect(() => {
    if (id) {
      loadElection();
    }
  }, [id, account]);

  useEffect(() => {
    setInterval(() => updateCountdown(election, "whitelist", "voting"));
  }, [election]);

  const loadElection = async () => {
    setLoading(true);
    try {
      const election = await contract.methods.elections(Number(id)).call();

      if (Number(election?.votingStartTime == 0)) {
        alert("Invalid Election");
        navigate("/");
        return;
      }
      setElection(election);
    } catch (error) {
      console.error("Error loading Election:", error);
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

  const whitelistUser = async () => {
    setLoading(true);
    if (!data?.visitorId) return;
    console.log(data.visitorId);
    try {
      const gass = await contract.methods
        .whitelistUser(
          data?.visitorId,
          account,
          Number(id),
          Number(registrationNumber),
          30000
        )
        .estimateGas({ from: "0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395" });
      const message = `I Whitelist my wallet for Election with id: ${id}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [account, message],
      });
      console.log({
        deviceId: data?.visitorId,
        electionId: Number(id),
        signature: signature,
        registrationNumber: Number(registrationNumber),
        message,
        userAddress: account,
        gas: gass,
      });
      const response = await fetch("http://localhost:4000/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: data?.visitorId,
          electionId: Number(id),
          signature: signature,
          registrationNumber: Number(registrationNumber),
          message,
          userAddress: account,
          gas: Number(gass),
        }),
      });
      const result = await response.json();
      if (result.success)
        return {
          message: `Successfully Whitelisted your wallet and Identity`,
          hash: result.transactionHash,
          status: true,
        };
      else return { message: result.error };
    } catch (error) {
      console.log(error);
      alert(error.data.message);
      return { message: error.message };
    } finally {
      setLoading(false);
    }
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
          Whitelist for Election
        </h2>
        <TextInput
          type="number"
          placeholder="Registration Number"
          onChange={(e) => setRegistrationNumber(e.target.value)}
        />
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

export default WhitelistPage;
