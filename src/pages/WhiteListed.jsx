// src/pages/Whitelisted.js
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
import REACT_APP_SERVER_URL, { rpcURL } from "../constant.js";
import checkSession from "../helper/session.js";

const WhiteListed = () => {
  const navigate = useNavigate();
  checkSession()
    const [data, setData] = useState([])
    const [election, setElection] = useState("");
    const web3 = new Web3(rpcURL);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
      const urlParams = new URLSearchParams(window.location.search);
      // Extract the 'id' parameter
      const id = urlParams.get("id");
      const {
          account,
          loading,
          setLoading,
          alert,
          setAlert,
          redAlert,
          setRedAlert
        } = useContext(AppContext);
    
        const fetch_whitelisted = async () => {
            setLoading(true);
                try {
                  const response = await fetch(`${REACT_APP_SERVER_URL}/whitelisted-voters?election_id=${id}`);
                  const body = await response.json();
                  console.log(body)
                setData(body?.data)
                } catch (error) {
                  console.log("e", error);
                  setRedAlert(error.message);
                } finally {
                  setLoading(false);
                }
        }

      useEffect(() => {
        setAlert("");
        setRedAlert("");
      }, []);

      useEffect(() => {
          if (!id) {
            setRedAlert("Election ID missing");
            navigate("/");
            return;
          }

        }, []);

         useEffect(() => {
            if (id) {
              loadElection();
              fetch_whitelisted();
            }
          }, [id]);
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
    return (
    <>
        {loading && <Loader />}
        {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
        {!!alert && <GreenAlertBox alert={alert} setAlert={setAlert} />}
        <div className="px-3">
            <div className="flex flex-row justify-between items-center p-3">
            <a className="text-3xl font-bold text-blue-600 cursor-pointer" href="/">
                Meta<span className="text-red-400">Vote</span>
            </a>
            </div>
            <div className="flex justify-center items-center">
            <img src={election?.logoUrl} alt="Logo" className="w-32" />
            </div>
            <RegistrationTable data={data} />
        </div>
    </>
    )
}


const RegistrationTable = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState("");
  
    // Filter data based on search term
    const filteredData = data.filter(item =>
      item.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Registration Numbers</h2>
        
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search by Registration Number..."
          className="border p-2 mb-4 w-full text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
  
        {/* Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-black">Registration Number</th>
              <th className="border p-2 text-black">PIN</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{item.regNo}</td>
                  <td className="border p-2">{item.pin}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="border p-2 text-center">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pb-[50%]"></div>
      </div>
    );
  };
  

export default WhiteListed;