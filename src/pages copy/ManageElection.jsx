import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";
import WalletButton from "../components/WalletButton";
import { contractAddress, contractABI } from "../contract.js";
import Web3 from "web3";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { rpcURL } from "../constant.js";

const web3 = new Web3(rpcURL);
const contract = new web3.eth.Contract(contractABI, contractAddress);

function ManageElection() {
  const [openModal, setOpenModal] = React.useState(false);
  const [openDepositModal, setOpenDepositModal] = React.useState(false);
  const navigate = useNavigate();
  const [items, setItems] = useState({});
  const { loading, setLoading, account } = useContext(AppContext);
  const urlParams = new URLSearchParams(window.location.search);
  const [price, setPrice] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const balance = web3.utils.fromWei(Number(items ? items[9] : 0), "ether");

  // Extract the 'id' parameter
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) {
      alert("Election ID missing");
      navigate("/");
      return;
    }
    loadElection();
  }, [account]);

  const loadElection = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const election = await contract.methods.elections(Number(id)).call();
      console.log(election);
      if (election?.creator !== account) {
        console.log(election.creator);
        console.log(account);
        console.log(typeof election.creator);
        alert("You do not own this Election");
        navigate("/create-election");
        return;
      }
      if (Number(election.votingStartTime) == 0) {
        alert("Invalid Election");
        navigate("/");
        return;
      }
      setItems(election);
    } catch (error) {
      console.error("Error loading election:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const ethPriceInUSD = data.ethereum.usd;
      setPrice(ethPriceInUSD);
    } catch (e) {
      console.error(e);
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
    fetchCurrentPrice();
  }, [items]);
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
        <a href="/create-election" className="text-blue-700">
          Back
        </a>
        <h2 className="text-2xl text-center my-3 font-semibold">
          Manage Election
        </h2>
        <p>Name: {items?.name}</p>
        <div className="flex flex-col">
          <p>
            Balance: {balance} eth{" "}
            {price && <span>~ {(price * balance).toFixed(2)} USD</span>}
          </p>
          <div className="flex gap-3 py-3">
            <Button
              className="bg-blue-600"
              onClick={() => {
                setOpenDepositModal(true);
              }}
            >
              Top up
            </Button>
            <Button className="bg-blue-600">Withdraw</Button>
          </div>
        </div>
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
        <div>
          <p id="whitelist"></p>
          <p id="voting"></p>
        </div>
        <h2 className="text-2xl text-center my-3 font-semibold">Candidates</h2>
        <div className="overflow-x-auto flex flex-col">
          {candidates.length == 0 && (
            <p className="text-center mb-5 italic">No Candidates yet</p>
          )}
          {candidates.length > 0 && (
            <Table striped>
              <Table.Head>
                <Table.HeadCell className="text-xl">Name</Table.HeadCell>
                <Table.HeadCell className="text-xl">Vote Count</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {candidates.map((item) => (
                  <Table.Row className="border-gray-700 bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-black">
                      {item[1]}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-black">
                      {Number(item[2])}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
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
          setCandidates={setCandidates}
        />
        <DepositModal
          account={account}
          openModal={openDepositModal}
          setOpenModal={setOpenDepositModal}
          electionId={Number(items ? items.id : 0)}
          setLoading={setLoading}
          items={items}
          price={price}
          loadElection={loadElection}
        />
      </div>
    </>
  );
}

const CandidateModal = ({
  electionId,
  openModal,
  account,
  items,
  setOpenModal = () => {},
  setLoading = () => {},
  setCandidates = () => {},
}) => {
  const [name, setName] = React.useState("");

  const fetchCandidates = async () => {
    const candidatesz = await contract.methods
      .getCandidates(Number(items.id))
      .call();
    setCandidates(candidatesz);
  };

  async function addCandidate() {
    if (name.length < 4) {
      alert("Name compulsory and should be more than 4 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await contract.methods
        .addCandidate(electionId, name, "imageUrl")
        .send({ from: account });
      fetchCandidates();
      alert("Candidate created successfully");
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
            <div className="mb-2 block">
              <Label htmlFor="name" value="Candidate's name" />
            </div>
            <TextInput
              id="name"
              placeholder="Candidate name"
              value={name}
              onChange={(name) => setName(event.target.value)}
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
  loadElection = () => {},
}) => {
  const [name, setName] = React.useState("");
  function onCloseModal() {
    setOpenModal(false);
    setName("");
    // setImageUrl("");
  }

  const deposit = async () => {
    setLoading(true);
    let OK = true;
    try {
      const result = await contract.methods.deposit(Number(items.id)).call({
        from: account,
        to: contract,
        value: web3.utils.toWei(name, "ether"),
      });
    } catch (error) {
      console.log(error);
      OK = false;
      alert(error.message);
    }
    try {
      if (OK) {
        await contract.methods.deposit(Number(items.id)).send({
          from: account,
          to: contract,
          value: web3.utils.toWei(name, "ether"),
        });
        alert("Successfully topped up "+ name + " eth to election reserve");
      }
      loadElection();
    } catch (e) {
    } finally {
      setLoading(false);
      onCloseModal()
    }
  };
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
          <div className="w-full">
            <Button className="bg-blue-600" onClick={deposit}>
              Deposit
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ManageElection;
