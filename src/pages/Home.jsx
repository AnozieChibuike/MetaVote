import React, { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import FaqSection from "../components/faqs";
import Loader from "../components/loader.jsx";
import { useNavigate } from "react-router-dom";
import RedAlertBox from "../components/RedAlertBox.jsx";
import { Button } from "flowbite-react";
import VotingImage from "../assets/hero.jpg";
import { FaShieldAlt, FaGasPump, FaLock, FaGlobe } from "react-icons/fa";

const Home = () => {
  const { loading, redAlert, setRedAlert } = useContext(AppContext);
  const navigate = useNavigate();
  const signUpRef = useRef(null);
  const FaqRef = useRef(null);

  const finalStats = {
    activeUsers: 1500,
    onChainTx: 2500,
    electionsHeld: 3,
  };
  const [hasAnimated, setHasAnimated] = useState(false); // Prevent re-animation
  const statsRef = useRef(null);

  // Animated Count States
  const [stats, setStats] = useState({
    activeUsers: 0,
    onChainTx: 0,
    electionsHeld: 0,
  });

  // Counting Animation Function
  const startCounting = () => {
    const animateCounter = (key, finalValue, duration = 2000) => {
      let start = 0;
      const increment = finalValue / (duration / 50); // Adjust speed

      const interval = setInterval(() => {
        start += increment;
        if (start >= finalValue) {
          start = finalValue;
          clearInterval(interval);
        }
        setStats((prev) => ({ ...prev, [key]: Math.floor(start) }));
      }, 50);
    };

    animateCounter("activeUsers", finalStats.activeUsers);
    animateCounter("onChainTx", finalStats.onChainTx);
    animateCounter("electionsHeld", finalStats.electionsHeld);
  };

  // Observer to trigger counting when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          startCounting();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 } // 50% of the section must be in view
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);
 

  const scrollToSignUp = () => {
    signUpRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToFaq = () => {
    FaqRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {!!redAlert && <RedAlertBox setAlert={setRedAlert} alert={redAlert} />}
      {loading && <Loader />}

      {/* Hero Section */}
      <div className="bg-black text-white min-h-screen  flex flex-col sm:flex-row items-center justify-center px-6 sm:px-12">
        {/* <div className="bg-white py-20 md:hidden lg:hidden"></div> */}
        <div className="sm:w-1/2 text-center h-screen md:h-auto lg:h-auto flex md:block lg:block flex-col sm:text-left justify-center space-y-6">
          <a className="text-3xl cursor-pointer sm:text-5xl text-blue-400 font-bold" href="/">
            Meta<span className="text-red-400">Vote</span>
          </a>
          <h2 className="text-xl sm:text-2xl font-semibold">
            Decentralized Electoral Platform
          </h2>
          <p className="text-gray-300">
            Secure, gasless voting powered by blockchain technology. Create elections, whitelist voters, and cast your votes easily.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button color="blue" onClick={scrollToSignUp}>Get Started</Button>
            <Button color="gray" outline onClick={scrollToFaq}>Learn More</Button>
          </div>
        </div>
        <div className="sm:w-1/2 flex justify-center mt-8 sm:mt-0">
          <img src={VotingImage} alt="Voting Process" className="w-full rounded-xl max-w-md shadow-lg" />
        </div>
      </div>

      {/* Why Choose MetaVote Section */}
      <div className="bg-black text-white py-16 px-6 sm:px-12">
        <h2 className="text-center text-4xl font-bold mb-10">Why Choose MetaVote?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          <div className="flex flex-col items-center">
            <FaShieldAlt className="text-4xl text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-gray-400 text-sm">End-to-end encryption ensures safe and transparent elections.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaGasPump className="text-4xl text-green-400 mb-4" />
            <h3 className="text-lg font-semibold">Gasless Voting</h3>
            <p className="text-gray-400 text-sm">Users can vote without paying gas fees, thanks to our relayer system.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaLock className="text-4xl text-red-400 mb-4" />
            <h3 className="text-lg font-semibold">Tamper-Proof</h3>
            <p className="text-gray-400 text-sm">Blockchain-backed elections prevent fraud and ensure transparency.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaGlobe className="text-4xl text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold">Decentralized</h3>
            <p className="text-gray-400 text-sm">No central authority—elections are controlled by smart contracts.</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="bg-black lg:p-36 p-10">
        <div className="bg-black border-white lg:px-36 px-9 py-7 flex flex-row justify-between rounded-2xl border">
          <div className="flex flex-col">
            <h2 className="text-center text-xl md:text-4xl font-extrabold ">{stats.activeUsers}+</h2>
            <p className="text-gray-400 text-[0.5rem] md:text-xs text-center">Active Users</p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-center text-xl md:text-4xl font-extrabold ">{stats.onChainTx}+</h2>
            <p className="text-gray-400 text-[0.5rem] md:text-xs text-center">On-Chain TX</p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-center text-xl md:text-4xl font-extrabold ">{stats.electionsHeld}</h2>
            <p className="text-gray-400 text-[0.5rem] md:text-xs text-center">Elections Held</p>
          </div>
        </div>
      </div>

<div ref={signUpRef} className="bg-black text-white py-12 px-6 sm:px-12 text-center">
  <h2 className="text-3xl font-bold mb-6">Join MetaVote</h2>
  <p className="text-gray-300 mb-8">
    Sign up as a voter or as an election administrator to manage elections seamlessly.
  </p>
  <div className="flex flex-col sm:flex-row justify-center gap-6">
    
    <Button color="blue" onClick={() => navigate("/voter-signin")}>Sign in as a Voter</Button> 
    <Button color="blue" onClick={() => navigate("/admin-signin")}>Sign in as an Admin</Button>
  </div>

  {/* Testimonials Section */}
  <div className="mt-16">
    <h3 className="text-2xl font-bold mb-6 text-center">What Our Users Say</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="bg-black p-6 rounded-lg border-blue-500 border shadow">
        <p className="text-gray-400">
          "MetaVote made our university elections <span className="font-bold">completely transparent</span> and stress-free."
        </p>
        <p className="text-blue-400 mt-4 font-semibold">– Victory, NiMECHE (FUTO)</p>
      </div>
      <div className="bg-black border-red-500 border p-6 rounded-lg shadow">
        <p className="text-gray-400">
          "I love how easy it is to create and manage elections. <span className="font-bold">No more paperwork!</span>"
        </p>
        <p className="text-blue-400 mt-4 font-semibold">– Divine, Electronic Engineering (FUTO)</p>
      </div>
    </div>
  </div>
</div>
    <div className="bg-black" ref={FaqRef}>
      <FaqSection />
    </div>
    </>
  );
};

export default Home;
