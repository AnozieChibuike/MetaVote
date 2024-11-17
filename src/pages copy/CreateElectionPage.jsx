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

const CreateElectionPage = () => {
  const navigate = useNavigate();
  const [elect, setElect] = useState({});
  const [depElections, setDepElections] = useState([]);
  const [electionName, setElectionName] = useState("");
  const [whitelistStart, setWhitelistStart] = useState("");
  const [whitelistEnd, setWhitelistEnd] = useState("");
  const [votingStart, setVotingStart] = useState("");
  const [votingEnd, setVotingEnd] = useState("");
  const [electionLoading, setElectionLoading] = useState(false);

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // contract.events.ElectionCreated().on("data", (event) => {
  //   console.log(event);
  // });

  contract.events.ElectionCreated(
    {
      filter: {}, // Optional filter object
      fromBlock: "latest", // Starting block to listen from
    },
    function (error, event) {
      if (error) {
        console.error("Error in event listener:", error);
      } else {
        console.log("Event received:", event.returnValues);
      }
    }
  );

  const { account, loading, setLoading } = useContext(AppContext);

  const populateElections = async () => {
    setElectionLoading(true);
    try {
      const elections = await contract.methods
        .getElectionsByCreator(account)
        .call();
      setDepElections(elections);
    } catch (error) {
      alert("Error: " + error?.data?.message);
    } finally {
      setElectionLoading(false);
    }
  };

  useEffect(() => {
    if (!account) return;
    populateElections();
  }, [account]);

  const createElection = async () => {
    if (!account) {
      alert("Connect your wallet before proceeding");
      return;
    }
    let OK = true;
    if (
      !electionName ||
      !whitelistStart ||
      !whitelistEnd ||
      !votingStart ||
      !votingEnd
    ) {
      alert("Missing some required parameters to create the election");
      return;
    }
    // if (dateToTimestamp(whitelistStart) > dateToTimestamp(whitelistEnd)) {
    //   alert("Whitelisting start time must be before whitelisting end time");
    //   return;
    // }
    // if (dateToTimestamp(votingStart) > dateToTimestamp(votingEnd)) {
    //   alert("Voting start time must be before voting end time");
    //   return;
    // }
    
    // if (dateToTimestamp(whitelistEnd) > dateToTimestamp(votingStart)) {
    //   alert("Whitelisting must end before voting starts");
    //   return;
    // }

    setLoading(true);
    try {
      await contract.methods
        .createElection(
          electionName,
          dateToTimestamp(whitelistStart),
          dateToTimestamp(whitelistEnd),
          dateToTimestamp(votingStart),
          dateToTimestamp(votingEnd)
        )
        .call({ from: account });
    } catch (e) {
      console.log(e);
      OK = false;
      setLoading(false);
    }

    if (OK) {
      try {
        await contract.methods
          .createElection(
            electionName,
            dateToTimestamp(whitelistStart),
            dateToTimestamp(whitelistEnd),
            dateToTimestamp(votingStart),
            dateToTimestamp(votingEnd)
          )
          .send({ from: account });
        populateElections();
        alert("Election created successfully, Go on and add candidates");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    // try {
    //   // console.log(1000)
    //   // Get nonce for replay protection
    //   // const nonce = await contract.methods.nonces(account).call();
    //   // console.log(nonce + 's');
    //   // Create the message hash
    //   // const messageHash = web3.utils.soliditySha3("I");
    //   const message = "Wow";
    //   // console.log(messageHash);

    //   // Sign the message
    //   const signature = await window.ethereum.request({
    //     method: "personal_sign",
    //     params: [account, message],
    //   });
    //   // const signature = await web3.eth.personal.sign(messageHash, account);
    //   console.log(signature);
    //   // Send the signed message to the relayer (via an API call)
    //   const response = await fetch("http://localhost:4000/vote", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       electionName,
    //       start: dateToTimestamp(whitelistStart),
    //       end: dateToTimestamp(whitelistEnd),
    //       vstart: dateToTimestamp(votingStart),
    //       vend: dateToTimestamp(votingEnd),
    //       signature: signature,
    //       message,
    //       userAddress: account,
    //     }),
    //   });

    //   const result = await response.json();
    //   if (!result.success) {
    //     alert(result.error + " Go / to whitelist your wallet");
    //     return;
    //   }
    //   populateElections();
    //   alert("Election created successfully")
    // } catch (error) {
    // } finally {
    //   setLoading(false);
    // }
    // try {
    //   const web3WithGSN = await setupGSNProvider();
    //   const gsnContract = new web3WithGSN.eth.Contract(
    //     contractABI,
    //     contractAddress
    //   );

    //   await gsnContract.methods
    //     .createElection(
    //       electionName,
    //       dateToTimestamp(whitelistStart),
    //       dateToTimestamp(whitelistEnd),
    //       dateToTimestamp(votingStart),
    //       dateToTimestamp(votingEnd)
    //     )
    //     .send({ from: account })
    //     .on("transactionHash", (hash) => {
    //       console.log("Transaction hash:", hash);
    //     })
    //     .on("receipt", (receipt) => {
    //       console.log("Transaction confirmed:", receipt);
    //     })
    //     .on("error", (error) => {
    //       console.error("Error in transaction:", error);
    //     });
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setLoading(false);
    // }
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
        <p>Set Voter's whitelist start time</p>
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
        />
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
          className="bg-blue-700 my-5 p-3 rounded block disabled:bg-gray-500"
          onClick={createElection}
          disabled={!account}
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
                className="p-2 bg-blue-700 rounded-md"
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
        {/* {elect?.id && <CandidateModal elect={elect} setElect={setElect} />} */}
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
