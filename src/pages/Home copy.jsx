// src/pages/Home.js
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import FaqSection from "../components/faqs";
import Web3 from "web3";
import Loader from "../components/loader.jsx";
import { contractAddress, contractABI } from "../contract.js";
import { Button, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import RedAlertBox from "../components/RedAlertBox.jsx";

const Home = () => {
  const { account, loading, setLoading, redAlert, setRedAlert } = useContext(AppContext);
  const navigate = useNavigate();
  const [alert, setAlert] = useState("")
  const [email, setEmail] = useState("");
  const verify = async () => {
    if (!email) {
      setRedAlert("Code cannot be empty");
      return;
    }
    if (email !== "chibuikeanozie0@gmail.com") {
      setRedAlert("You cannot use this app");
      return;
    }
    sessionStorage.setItem("code", email);
    navigate("/create-election");
  };

  return (
    <>
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      {loading && <Loader />}
      <div className="px-9">
        <div className="flex flex-row justify-between items-center p-3">
          <h1 className="text-xl font-bold text-blue-600">
            Meta<span className="text-red-400">Vote</span>
          </h1>
        </div>
        <h1 className="text-center text-2xl mt-5" id="countdown">
          Decentralized Electoral Platform
        </h1>
        <p className="mt-5">
          Secure, gasless voting powered by blockchain technology. Create
          elections, whitelist voters, and cast your votes easily.
        </p>
        <div className="my-9 flex flex-col">
          <TextInput
            value={email}
            onChange={(email) => setEmail(event.target.value)}
            required
            className="w-full flex-1"
            placeholder="Input code"
            type="text"
          />
          <span className="ml-2 text-sm italic text-gray-500">
            Input Verification code to use the app as an Election creator
          </span>
          <Button onClick={verify} className="bg-blue-600 self-center mt-3">
            Verify
          </Button>
        </div>
        <FaqSection />
      </div>
    </>
  );
};

export default Home;
