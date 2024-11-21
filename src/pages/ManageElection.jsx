import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";
import WalletButton from "../components/WalletButton";
import { contractAddress, contractABI } from "../contract.js";
import Web3 from "web3";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import GreenAlertBox from "../components/GreenAlertBox.jsx";
import RedAlertBox from "../components/RedAlertBox.jsx";
import REACT_APP_SERVER_URL from "../constant.js";

const web3 = new Web3("https://rpc.sepolia-api.lisk.com");
const contract = new web3.eth.Contract(contractABI, contractAddress);

function ManageElection() {
  const [openModal, setOpenModal] = React.useState(false);
  // const [openDepositModal, setOpenDepositModal] = React.useState(false);
  const navigate = useNavigate();
  const [items, setItems] = useState({});
  const [file, setFile] = useState(null);
  const [fileStatus, setFileStatus] = useState(false);
  const {
    loading,
    setLoading,
    account,
    alert,
    setAlert,
    redAlert,
    setRedAlert
  } = useContext(AppContext);
  const urlParams = new URLSearchParams(window.location.search);
  // const [price, setPrice] = useState(null);
  const [candidates, setCandidates] = useState([]);
  // const balance = web3.utils.fromWei(Number(items ? items[9] : 0), "ether");

  const getAdmin = () => {
    const admin = sessionStorage.getItem("code") || null;
    return admin;
  };

  useEffect(() => {
    setAlert("");
    setRedAlert("");
  }, []);

  // Extract the 'id' parameter
  const id = urlParams.get("id");

  const fetchFileStatus = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_URL}/voters-file-status`
      );
      const data = await response.json();
      setFileStatus(data?.isEmpty);
      if (data?.error) setRedAlert(data?.error);
    } catch (error) {
      console.error("Error fetching file status:", error);
      setFileStatus(true);
    }
  };

  useEffect(() => {
    setAlert("");
    setRedAlert("");
    if (!id) {
      setRedAlert("Election ID missing");
      navigate("/create-election");
      return;
    }
    const admin = getAdmin();
    if (!admin) {
      setRedAlert("Session expired relogin");
      navigate("/");
      return;
    }
    fetchFileStatus();
    loadElection();
  }, []);

  const loadElection = async () => {
    if (!getAdmin()) return;
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
    const candidatesz = await contract.methods
      .getCandidates(Number(items.id))
      .call();
    setCandidates(candidatesz);
  };

  useEffect(() => {
    if (!items?.id) {
      return;
    }
    setInterval(() => updateCountdown(items, "whitelist", "voting"));
    fetchCandidates();
    // fetchCurrentPrice();
  }, [items]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setRedAlert("Please select a valid text file.");
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setRedAlert("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true)
    try {
      const response = await fetch(`${REACT_APP_SERVER_URL}/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      const data = await response.json();
      setAlert("File uploaded successfully!");
      fetchFileStatus()
    } catch (error) {
      console.error("Error uploading file:", error);
      setRedAlert(error.message);
    } finally {
      setLoading(false)
    }
  };

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
        <a href="/create-election" className="text-blue-700">
          Back
        </a>
        <div className="flex justify-center items-center">
          <img src={items?.logoUrl}  className="w-32"/>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Manage Election
        </h2>
        <p>Name: {items?.name}</p>
        <p className="mt-3">Total Voters: {Number(items ? items[3] : 0)}</p>
        <p className="mt-3">Election Link: </p>
        <a
          className="italic text-blue-600"
          href={`http://${window.location.host}/vote?id=${Number(
            items ? items.id : 0
          )}`}
        >
          http://{window.location.host}/vote?id={Number(items ? items.id : 0)}
        </a>
        <p className="mt-3">Voter's WhiteList Link: </p>
        <a
          className="italic text-blue-600"
          href={`http://${window.location.host}/whitelist?id=${Number(
            items ? items.id : 0
          )}`}
        >
          http://{window.location.host}/whitelist?id=
          {Number(items ? items.id : 0)}
        </a>
        <div className="">
          {
            fileStatus ?
            <>
              <p>No Voter's file yet</p>
              <input
                className="my-2"
                type="file"
                accept=".txt" // Ensures only .txt files are selectable
                onChange={handleFileChange}
              />
              <Button className="bg-blue-600" onClick={handleUpload}>
                Upload
              </Button>
            </> : <>
            <p>Voter's file exist</p>
              <input
                className="my-2"
                type="file"
                accept=".txt" // Ensures only .txt files are selectable
                onChange={handleFileChange}
              />
              <Button className="bg-blue-600" onClick={handleUpload}>
                Update
              </Button>
            </>
          }
        </div>
        <div>
          {/* <p id="whitelist"></p> */}
          <p id="voting"></p>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">Candidates</h2>
        <div className="overflow-x-auto flex flex-col mb-2">
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

          <Button
            className="bg-blue-600 mt-5 self-center"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            New
          </Button>
        </div>
        <CandidateModal
          account={account}
          openModal={openModal}
          setOpenModal={setOpenModal}
          electionId={Number(items ? items.id : 0)}
          setLoading={setLoading}
          items={items}
          setAlert={setAlert}
          setCandidates={setCandidates}
        />
        {/* <DepositModal
          account={account}
          openModal={openDepositModal}
          setOpenModal={setOpenDepositModal}
          electionId={Number(items ? items.id : 0)}
          setLoading={setLoading}
          items={items}
          price={price}
          loadElection={loadElection}
        /> */}
      </div>
    </>
  );
}

const CandidateModal = ({
  electionId,
  openModal,
  items,
  setOpenModal = () => {},
  setAlert = () => {},
  setLoading = () => {},
  setCandidates = () => {}
}) => {
  const [name, setName] = React.useState("");
  const [image, setImage] = React.useState("");
  const [position, setPosition] = React.useState("");

  const fetchCandidates = async () => {
    const candidatesz = await contract.methods
      .getCandidates(Number(items.id))
      .call();
    setCandidates(candidatesz);
  };

  async function addCandidate() {
    if (name.length < 4) {
      setRedAlert("Name compulsory and should be more than 4 characters");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${REACT_APP_SERVER_URL}/create-candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          electionId,
          position: String(position).trim().toUpperCase(),
          name,
          imageUrl: image
        })
      });
      const body = await response.json();
      if (body.success)
        setAlert(
          <span>
            Candidate created successfully, click this{" "}
            <a
              target="_blank"
              href={`https://sepolia-blockscout.lisk.com/tx/${body.transactionHash}`}
              class="font-semibold underline hover:no-underline"
            >
              link
            </a>{" "}
            to view the transaction on the blockchain explorer
          </span>
        );
      fetchCandidates();
      onCloseModal();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function onCloseModal() {
    setOpenModal(false);
    setName("");
    setImage("");
    setPosition("");
    // setImageUrl("");
  }
  return (
    <Modal show={openModal} size="md" onClose={onCloseModal} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Create New candidate
          </h3>
          <div>
            <div className="mt-2 block">
              <Label htmlFor="name" value="Candidate's name" />
            </div>
            <TextInput
              id="name"
              placeholder="Candidate name"
              value={name}
              onChange={(name) => setName(event.target.value)}
              required
            />
            <div className="mt-2 block">
              <Label htmlFor="imageUrl" value="Image URL" />
            </div>
            <TextInput
              id="image"
              placeholder="A link to the candidate's image"
              value={image}
              onChange={(image) => setImage(event.target.value)}
              required
            />
            <div className="mt-2 block">
              <Label htmlFor="position" value="Position" />
            </div>
            <TextInput
              id="position"
              placeholder="Candidate Position"
              value={position}
              onChange={(position) => setPosition(event.target.value)}
              required
            />
          </div>
          {/* <div>
            <div className="mb-2 block">
              <Label htmlFor="imageUrl" value="Candidate's Image Url" />
            </div>
            <TextInput
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(url) => setImageUrl(event.target.value)}
              required
              placeholder="Link to the Candidate's picture"
            />
          </div> */}
          <div className="w-full">
            <Button className="bg-blue-600" onClick={addCandidate}>
              Create Candidate
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const DepositModal = ({
  price,
  electionId,
  openModal,
  account,
  items,
  setOpenModal = () => {},
  setLoading = () => {},
  loadElection = () => {}
}) => {
  const [name, setName] = React.useState("");
  function onCloseModal() {
    setOpenModal(false);
    setName("");
    // setImageUrl("");
  }

  // const deposit = async () => {
  //   setLoading(true);
  //   let OK = true;
  //   try {
  //     const result = await contract.methods.deposit(Number(items.id)).call({
  //       from: account,
  //       to: contract,
  //       value: web3.utils.toWei(name, "ether"),
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     OK = false;
  //     setRedAlert(error.message);
  //   }
  //   try {
  //     if (OK) {
  //       await contract.methods.deposit(Number(items.id)).send({
  //         from: account,
  //         to: contract,
  //         value: web3.utils.toWei(name, "ether"),
  //       });
  //       alert("Successfully topped up "+ name + " eth to election reserve");
  //     }
  //     loadElection();
  //   } catch (e) {
  //   } finally {
  //     setLoading(false);
  //     onCloseModal()
  //   }
  // }

  return (
    <Modal show={openModal} size="md" onClose={onCloseModal} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Deposit funds to cover voter gas fee
          </h3>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Amount in eth" />
            </div>
            <TextInput
              id="name"
              placeholder="e.g 0.001"
              value={name}
              onChange={(name) => setName(event.target.value)}
              required
            />
            <p className="text-black">{(price * name).toFixed(2)} $</p>
          </div>
          {/* <div>
            <div className="mb-2 block">
              <Label htmlFor="imageUrl" value="Candidate's Image Url" />
            </div>
            <TextInput
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(url) => setImageUrl(event.target.value)}
              required
              placeholder="Link to the Candidate's picture"
            />
          </div> */}
          {/* <div className="w-full">
            <Button className="bg-blue-600" onClick={deposit}>
              Deposit
            </Button>
          </div> */}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ManageElection;
