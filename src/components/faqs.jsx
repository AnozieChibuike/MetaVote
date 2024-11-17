import React, { useState } from "react";

const FaqDropdown = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b text-white border-gray-200 py-4">
      <button
        onClick={toggleDropdown}
        className="flex justify-between w-full text-left text-lg font-medium text-white"
      >
        {question}
        <svg
          className={`w-5 text-white h-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <p className="mt-2 text-gray-300">{answer}</p>}
    </div>
  );
};

const FaqSection = () => {
  const faqs = [
    {
      question: "What is this decentralized voting platform?",
      answer:
        "This platform enables secure, gasless, and user-friendly elections on the blockchain. Participants can register their wallets, get whitelisted, and cast votes without needing to pay gas fees.",
    },
    {
      question: "How does the gasless voting work?",
      answer:
        "The platform uses a gas-relaying technology that allows participants to cast votes without paying gas fees themselves, by integrating third-party services like Biconomy or meta transactions.",
    },
    {
      question: "How do I participate in the election as a voter?",
      answer:
        "You need to connect your wallet to the platform and get whitelisted by the election administrator. Once whitelisted, you are eligible to vote during the voting period.",
    },
    {
      question: "What happens if I’m not whitelisted?",
      answer:
        "Only whitelisted users are eligible to vote. If you are not whitelisted, contact the election administrator for registration during the whitelisting period.",
    },
    {
      question: "Can I vote more than once?",
      answer: "No, each wallet address is allowed only one vote per election.",
    },
    {
      question: "Can I change my vote after it’s cast?",
      answer:
        "No, once a vote is cast, it cannot be changed or undone. Ensure you vote carefully.",
    },
    {
      question: "How do I create an election?",
      answer:
        "As an administrator, you can create an election by connecting your wallet to the platform. You have control over setting up candidates, managing the whitelist, and defining voting periods.",
    },
    {
      question: "Can multiple elections run simultaneously?",
      answer:
        "Yes, the platform supports multiple elections at once. Each election is given a unique ID, allowing admins to manage various elections independently.",
    },
    {
      question: "How do I add candidates to an election?",
      answer:
        "As an admin, you can add candidates through the admin interface. You will need to provide a name, candidate ID, and optionally an image or description for each candidate.",
    },
    {
      question: "How do I manage the election’s timeline?",
      answer:
        "The election timeline consists of two key phases: whitelisting and voting. You can define start and end times for both periods when setting up the election.",
    },
    {
      question: "How do I deposit funds to settle voters' money?",
      answer:
        "As an admin, Once an election has been deployed, you need to deposit funds to the Election reserve to pay for voter's gas fees, If the gas reserve finish voter's would not be a able to vote... a service fee is deducted on every deposit",
    },
  ];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Frequently Asked Questions</h1>
      {faqs.map((faq, index) => (
        <FaqDropdown key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FaqSection;
