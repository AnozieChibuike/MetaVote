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
      question: "What is MetaVote?",
      answer:
        "MetaVote is a decentralized voting platform that enables secure, gasless, and user-friendly elections on the blockchain. It allows election administrators to create elections, manage candidates, and whitelist voters, while participants can cast their votes without paying gas fees.",
    },
    {
      question: "How does gasless voting work?",
      answer:
        "MetaVote uses a custom relayer system to cover all gas fees for both election creators and voters. Instead of paying gas fees, admins pay a one-time setup fee and receive a cost estimate based on the number of voters participating in their election.",
    },
    {
      question: "How do I participate in an election as a voter?",
      answer:
        "To participate, get whitelisted by the election administrator. Once whitelisted, you will be able to cast your vote during the voting period without any gas fees.",
    },
    {
      question: "What happens if I’m not whitelisted?",
      answer:
        "Only whitelisted users are eligible to vote. If you are not whitelisted, contact the election administrator to request registration before the voting period begins.",
    },
    {
      question: "Can I vote more than once?",
      answer:
        "No, each identification address is allowed only one vote per election. MetaVote ensures fairness by preventing duplicate voting.",
    },
    {
      question: "Can I change my vote after it’s cast?",
      answer:
        "No, once a vote is cast, it is final and cannot be changed or undone. Be sure to review your selection before submitting your vote.",
    },
    {
      question: "How do I create an election?",
      answer:
        "As an administrator, you can create an election by signing up to MetaVote as an election administrator. You will need to set up candidates, manage the whitelist, define voting periods, and fund the election to enable gasless voting for participants.",
    },
    {
      question: "Can multiple elections run simultaneously?",
      answer:
        "Yes, MetaVote supports multiple elections running at the same time. Each election is assigned a unique ID, allowing admins to manage them independently.",
    },
    {
      question: "How do I add candidates to an election?",
      answer:
        "As an admin, you can add candidates via the admin interface. Each candidate must have a name and a candidate ID, and you can also include an image or a short description to provide voters with more details.",
      },
      {
        question: "How do I manage the election’s timeline?",
        answer:
          "The election timeline consists of two main phases: the whitelisting period and the voting period. When creating an election, admins can define the start and end times for each phase.",
      },
      {
        question: "How do I fund the election?",
        answer:
          "Admins must deposit funds to cover the gas costs of voters. The platform provides a quote based on the expected number of participants. If the gas reserve runs out before the election ends, voters will not be able to cast their votes until additional funds are deposited.",
      },
      {
        question: "Is there a service fee?",
        answer:
          "Yes, MetaVote charges a one-time election setup fee and a service fee on deposits made to the election's gas reserve. This helps maintain the relayer infrastructure and ensures smooth election execution.",
      },
      {
        question: "How secure is MetaVote?",
        answer:
          "MetaVote is built on blockchain technology, ensuring transparency and immutability. Votes are recorded on-chain, preventing tampering or fraud. Additionally, smart contracts handle the voting process to eliminate centralized control.",
      },
      {
        question: "Can I view election results in real-time?",
        answer:
          "Yes, election results are updated in real-time and can be viewed by anyone on the platform. Once the voting period ends, the final results are automatically recorded on the blockchain.",
      },
      {
        question: "Does MetaVote support anonymous voting?",
        answer:
          "Yes, MetaVote prioritizes voter privacy. Votes are cast anonymously, ensuring that individual choices remain confidential while still maintaining verifiability on the blockchain.",
      },
      {
        question: "Can an election be canceled or modified after creation?",
        answer:
          "Once an election is deployed on the blockchain, it cannot be canceled or modified. This ensures integrity and prevents any form of manipulation.",
      }
    ];
  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Frequently Asked Questions</h1>
      {faqs.map((faq, index) => (
        <FaqDropdown key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FaqSection;
