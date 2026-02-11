import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminAuth from "../helper/session.js";
import { FaUsers, FaUserTie, FaVoteYea } from "react-icons/fa";
import Loader from "../components/loader.jsx";
import { CardSkeleton, ListSkeleton } from "../components/SkeletonLoader.jsx";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";

const SERVER_URL = "/api/admin";

const DedicatedAdminDashboard = () => {
  const { loading: authLoading, authenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ voters: 0, candidates: 0, votes: 0 });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    role: "",
    image_url: "",
  });
  const [election, setElection] = useState({
    status: "NOT_STARTED",
    start_time: null,
    end_time: null,
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          voters: data.voters,
          candidates: data.candidates,
          votes: data.votes,
        });
        if (data.election) {
          setElection(data.election);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/candidates`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (authenticated) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchCandidates()]);
        setLoading(false);
      };
      loadData();
    }
  }, [authenticated]);

  const handleElectionAction = async (action, body = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/election/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        fetchStats(); // Refresh status
      } else {
        showToast(data.error || "Action failed", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${SERVER_URL}/logout`, { method: "POST" });
    navigate("/signin");
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.role) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCandidate),
      });
      if (res.ok) {
        showToast("Candidate added successfully");
        setModalOpen(false);
        setNewCandidate({ name: "", role: "", image_url: "" });
        await fetchCandidates();
        await fetchStats();
      } else {
        showToast("Failed to add candidate", "error");
      }
    } catch (error) {
      showToast("Error adding candidate", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/candidates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Candidate deleted");
        await fetchCandidates();
        await fetchStats();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (error) {
      showToast("Error deleting", "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loader />; // Keep full loader for auth check
  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                MetaVote
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800">
                EEE Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-all text-sm font-medium border border-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              Election Overview
            </h1>
            <p className="text-slate-400 mt-1">
              Manage candidates and view real-time statistics.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-medium flex items-center gap-2"
          >
            <span>+</span> Add Candidate
          </button>
        </div>

        {/* Election Control Panel */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Status:
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  election.status === "RUNNING"
                    ? "bg-green-500/20 text-green-400"
                    : election.status === "PAUSED"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : election.status === "ENDED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-700 text-slate-400"
                }`}
              >
                {election.status.replace("_", " ")}
              </span>
            </h2>
            {election.end_time && election.status === "RUNNING" && (
              <p className="text-slate-400 text-sm mt-1">
                Ends: {new Date(election.end_time).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {election.status === "NOT_STARTED" && (
              <button
                onClick={() => {
                  const hours = prompt("Enter duration in hours:", "1");
                  if (hours)
                    handleElectionAction("start", { duration_hours: hours });
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium"
              >
                Start Election
              </button>
            )}

            {election.status === "RUNNING" && (
              <>
                <button
                  onClick={() => handleElectionAction("pause")}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Pause
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to END the election? Voters will no longer be able to vote.",
                      )
                    )
                      handleElectionAction("end");
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium"
                >
                  End Election
                </button>
              </>
            )}

            {election.status === "PAUSED" && (
              <button
                onClick={() => handleElectionAction("resume")}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium"
              >
                Resume
              </button>
            )}

            {election.status === "ENDED" && (
              <button
                disabled
                className="bg-slate-700 text-slate-500 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
              >
                Election Ended
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl animate-pulse h-32" />
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl animate-pulse h-32" />
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl animate-pulse h-32" />
            </>
          ) : (
            <>
              <StatsCard
                icon={<FaUsers />}
                label="Total Voters"
                value={stats.voters}
                color="blue"
              />
              <StatsCard
                icon={<FaUserTie />}
                label="Candidates"
                value={stats.candidates}
                color="cyan"
              />
              <StatsCard
                icon={<FaVoteYea />}
                label="Total Voted"
                value={stats.votes}
                color="purple"
              />
            </>
          )}
        </div>

        {/* Election Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Voting Link
            </h3>
            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <input
                readOnly
                className="bg-transparent border-none text-blue-400 text-sm w-full focus:ring-0"
                value={`${window.location.origin}/vote`}
              />
              <a
                href="/vote"
                target="_blank"
                className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                title="Open Link"
              >
                <FaVoteYea />
              </a>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Results Link
            </h3>
            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <input
                readOnly
                className="bg-transparent border-none text-purple-400 text-sm w-full focus:ring-0"
                value={`${window.location.origin}/results`}
              />
              <a
                href="/results"
                target="_blank"
                className="p-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors"
                title="Open Link"
              >
                <FaVoteYea className="transform rotate-180" />
              </a>
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-8">
          {loading ? (
            <ListSkeleton />
          ) : candidates.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center text-slate-500 backdrop-blur-sm">
              <p>No candidates found. Add one to get started.</p>
            </div>
          ) : (
            Object.entries(
              candidates.reduce((acc, candidate) => {
                const role = candidate.role || "Unassigned";
                if (!acc[role]) acc[role] = [];
                acc[role].push(candidate);
                return acc;
              }, {}),
            ).map(([role, roleCandidates]) => (
              <div
                key={role}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/80">
                  <h2 className="text-xl font-bold text-blue-400 uppercase tracking-wider">
                    {role}
                  </h2>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {roleCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                          {candidate.image_url ? (
                            <img
                              src={candidate.name === "CHIBUZO EMMANUEL OLUEBUBECHUKWU" ? "https://bafkreihtysunhalraprcoh2jwoelc7qkjtdpf5crkomvde2lcnalekiili.ipfs.w3s.link" : candidate.image_url }
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUserTie className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-200">
                            {candidate.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <span className="block text-xl font-bold text-slate-200">
                            {candidate.vote_count}
                          </span>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">
                            Votes
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400 transition-all"
                          title="Delete Candidate"
                        >
                          <HiX size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Candidate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold mb-6 text-slate-100">
              New Candidate
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                  value={newCandidate.name}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Position / Role
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. President"
                  value={newCandidate.role}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, role: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://..."
                  value={newCandidate.image_url}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      image_url: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCandidate}
                disabled={loading || !newCandidate.name || !newCandidate.role}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toast.type === "success" ? "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200" : "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"}`}
            >
              {toast.type === "success" ? (
                <HiCheck className="h-5 w-5" />
              ) : (
                <HiX className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-600 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DedicatedAdminDashboard;
