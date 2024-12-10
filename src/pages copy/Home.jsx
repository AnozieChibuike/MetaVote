// src/pages/Home.js
import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import WalletButton from "../components/WalletButton";
import FaqSection from "../components/faqs";
import Web3 from "web3";
import Loader from "../components/loader.jsx";
import { contractAddress, contractABI } from "../contract.js";

const Home = () => {
  const { account, loading, setLoading } = useContext(AppContext);
  const web3 = new Web3("https://rpc.api.lisk.com");
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  const whiteList = async () => {
    try {
      setLoading(true);
      let OK = true;
      if (!account) {
        alert("Connect wallet before proceeding");
        setLoading(false);
        return;
      }
      try {
        console.log(10);
        await contract.methods.addElectionCreator(account).call();
        alert(
          "To avoid spam, you have to whitelist your wallet to create elections!"
        );
      } catch (error) {
        OK = false;
        if (
          error?.data?.message ===
            "execution reverted: The address is already a creator" ||
          error?.error?.data?.message ===
            "execution reverted: The address is already a creator"
        )
          location.href = "/create-election";
      }
      if (OK) {
        try {
          await contract.methods
            .addElectionCreator(account)
            .send({ from: account });
          location.href = "/create-election";
        } catch (error) {
          alert(error.message);
          console.log(error.data);
        }
      }
    } catch (error) {
      alert(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="px-9">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
          <WalletButton />
          {/* <div className={`${account && "bg-blue-600"} rounded`}>
          {/* <p>Connect Wallet</p> */}
          {/* <p className="p-3">0x2039*****009</p> */}
          {/* </div> */}
        </div>
        <h1 className="text-center text-2xl mt-5" id="countdown">
          Decentralized Electoral Platform
        </h1>
        <p className="mt-5">
          Secure, gasless voting powered by blockchain technology. Create
          elections, whitelist voters, and cast your votes easily.
        </p>
        <div className="flex items-center justify-center">
          <div
            className="bg-blue-700 mt-5 p-3 rounded cursor-pointer"
            onClick={whiteList}
          >
            <p className="font-semibold">Create Election</p>
          </div>
        </div>
        <FaqSection />
      </div>
    </>
  );
};

export default Home;
