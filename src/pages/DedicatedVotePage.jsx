import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/loader.jsx";
import { CandidateGridSkeleton } from "../components/SkeletonLoader.jsx";
import { Toast } from "flowbite-react";
import { HiCheck, HiX, HiArrowRight, HiArrowLeft } from "react-icons/hi";
import { FaUserTie, FaCheckCircle } from "react-icons/fa";

const DedicatedVotePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState({
    verified: false,
    reg_number: "",
    pin: "",
    has_voted: false,
  });
  const [candidates, setCandidates] = useState({}); // { Role: [Candidate, ...] }
  const [roles, setRoles] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Verification, 1...N = Voting Steps, N+1 = Review
  const [selections, setSelections] = useState({}); // { Role: candidateId }
  const [electionStatus, setElectionStatus] = useState("LOADING"); // LOADING, NOT_STARTED, RUNNING, PAUSED, ENDED
  const [toast, setToast] = useState(null);

  // Verification Inputs
  const [regInput, setRegInput] = useState("");
  const [pinInput, setPinInput] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkElectionStatus();
  }, []);

  const checkElectionStatus = async () => {
    try {
      const res = await fetch("/api/election/status");
      if (res.ok) {
        const data = await res.json();
        setElectionStatus(data.status);
        if (data.status === "RUNNING") {
          fetchCandidates();
        }
      }
    } catch (error) {
      console.error("Failed to check election status");
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
        setRoles(Object.keys(data));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!regInput || !pinInput) {
      showToast("Please enter Registration Number and PIN", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reg_number: regInput, pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.verified) {
        setAuth({
          verified: true,
          reg_number: data.reg_number,
          pin: pinInput, // Keep pin for submission
          has_voted: data.has_voted,
        });

        if (data.has_voted) {
          showToast("You have already voted.", "error");
        } else {
          showToast("Verification successful!");
          setCurrentStep(1);
        }
      } else {
        showToast(data.message || "Verification failed", "error");
      }
    } catch (error) {
      showToast("Error verifying voter", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (role, candidateId) => {
    setSelections((prev) => ({ ...prev, [role]: candidateId }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitVote = async () => {
    if (Object.keys(selections).length === 0) {
      showToast("You must select at least one candidate.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reg_number: auth.reg_number,
          pin: auth.pin,
          candidate_ids: Object.values(selections),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuth((prev) => ({ ...prev, has_voted: true }));
        showToast("Vote cast successfully!");
      } else {
        showToast(data.error || "Voting failed", "error");
      }
    } catch (error) {
      showToast("Error submitting vote", "error");
    } finally {
      setLoading(false);
    }
  };

  if (electionStatus === "LOADING") return <Loader />;

  if (electionStatus === "NOT_STARTED") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Election Not Started</h1>
          <p className="text-slate-400">
            The election has not started yet. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  if (electionStatus === "PAUSED") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Election Paused</h1>
          <p className="text-slate-400">
            The election is currently paused. Please wait for it to resume.
          </p>
        </div>
      </div>
    );
  }

  if (electionStatus === "ENDED") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Election Ended</h1>
          <p className="text-slate-400 mb-6">
            The voting period has ended. You can view the final results.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/results"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              View Results
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading && currentStep === 0) return <Loader />; // Loader for Verification/Auth only

  // View: Already Voted
  if (auth.has_voted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Vote Recorded</h1>
          <p className="text-slate-400 mb-6">
            Thank you for voting. Your participation has been recorded.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/results"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              View Results
            </a>
          </div>
        </div>
      </div>
    );
  }

  // View: Verification Step
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-md w-full backdrop-blur-sm shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              MetaVote
            </h1>
            <p className="text-slate-400">Electronic Engineering Election</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={regInput}
                onChange={(e) => setRegInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. 2021/12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Voting PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter your PIN"
              />
            </div>
            <button
              onClick={handleVerify}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all mt-4"
            >
              Start Voting
            </button>
          </div>
        </div>
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <Toast>
              <div
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toast.type === "success" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
              >
                {toast.type === "success" ? (
                  <HiCheck className="h-5 w-5" />
                ) : (
                  <HiX className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3 text-sm font-normal text-slate-900">
                {toast.message}
              </div>
              <Toast.Toggle />
            </Toast>
          </div>
        )}
      </div>
    );
  }

  // Voting Steps
  const maxSteps = roles.length;
  const isReviewStep = currentStep > maxSteps;

  if (isReviewStep) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex items-center justify-center">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl max-w-2xl w-full backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Review Your Selections
          </h2>

          <div className="space-y-4 mb-8">
            {roles.map((role) => {
              const searchRole = roles.find((r) => r === role);
              const candidateId = selections[role];
              const candidate = candidates[role]?.find(
                (c) => c.id === candidateId,
              );

              return (
                <div
                  key={role}
                  className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800"
                >
                  <span className="text-slate-400 font-medium">{role}</span>
                  <span
                    className={`font-bold ${candidate ? "text-blue-400" : "text-slate-600 italic"}`}
                  >
                    {candidate ? candidate.name : "Skipped"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitVote}
              className="flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-600/20 transition-all"
            >
              Submit Vote
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roles[currentStep - 1]; // Step 1 corresponds to index 0
  const roleCandidates = candidates[currentRole] || [];
  const selectedId = selections[currentRole];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-800 z-50">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (maxSteps + 1)) * 100}%` }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 pb-24">
        <div className="mb-8 text-center">
          <span className="text-blue-400 font-bold tracking-wider text-sm uppercase">
            Step {currentStep} of {maxSteps + 1}
          </span>
          <h1 className="text-3xl font-bold mt-2">{currentRole}</h1>
          <p className="text-slate-400 mt-2">
            Select one candidate for this position.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <CandidateGridSkeleton />
          ) : (
            roleCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleSelect(currentRole, candidate.id)}
                className={`
                            relative p-6 rounded-2xl border transition-all cursor-pointer group
                            ${
                              selectedId === candidate.id
                                ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                                : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                            }
                        `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                                w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2
                                ${selectedId === candidate.id ? "border-blue-500" : "border-slate-600"}
                             `}
                  >
                    {candidate.image_url ? (
                      <img
                        src={candidate.image_url}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserTie className="text-slate-400 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${selectedId === candidate.id ? "text-white" : "text-slate-200"}`}
                    >
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-slate-400">{candidate.role}</p>
                  </div>
                </div>

                {selectedId === candidate.id && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                    <HiCheck size={16} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack} // Goes back to previous step or verification
            disabled={currentStep === 1 && false} // Can go back to verification if needed? Maybe disable if verified? logic says currStep 1 is first role.
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
          >
            <HiArrowLeft /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                handleSelect(currentRole, null); // Clear selection
                handleNext();
              }}
              className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedId} // Require selection to use "Next", enforce skip button usage if skipping
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <HiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DedicatedVotePage;
