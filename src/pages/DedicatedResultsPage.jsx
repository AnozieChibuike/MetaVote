import React, { useState, useEffect } from "react";
import { ResultsSkeleton } from "../components/SkeletonLoader.jsx";
import { FaUserTie, FaTrophy, FaVoteYea } from "react-icons/fa";

const DedicatedResultsPage = () => {
  const [candidates, setCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [electionStatus, setElectionStatus] = useState("LOADING");

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    const [res, statusRes] = await Promise.all([
      fetch("/api/candidates"),

      fetch("/api/election/status"),
    ]);

    try {
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);

        // Calculate total votes across all candidates
        let total = 0;
        Object.values(data).forEach((roleCandidates) => {
          roleCandidates.forEach((c) => (total += c.vote_count || 0));
        });
        setTotalVotes(total);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setElectionStatus(statusData.status);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
        {/* Navbar Skeleton / Placeholder */}
        <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 h-16" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-slate-800 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-slate-800 rounded mx-auto animate-pulse" />
          </div>
          <ResultsSkeleton />
        </main>
      </div>
    );

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
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  electionStatus === "RUNNING"
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : electionStatus === "PAUSED"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                      : electionStatus === "ENDED"
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {electionStatus === "RUNNING"
                  ? "Live Results"
                  : electionStatus === "PAUSED"
                    ? "Election Paused"
                    : electionStatus === "ENDED"
                      ? "Final Results"
                      : "Not Started"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>

              {electionStatus === "RUNNING" ? "Live Updates" : "Results"}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Election Results</h1>
          <p className="text-slate-400">
            Real-time updates from the Electronic Engineering election.
          </p>
        </div>

        {/* Role Sections */}
        <div className="space-y-12">
          {Object.keys(candidates).length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
              <p>No results available yet.</p>
            </div>
          ) : (
            Object.entries(candidates).map(([role, roleCandidates]) => {
              // Sort candidates by vote count descending
              const sortedCandidates = [...roleCandidates].sort(
                (a, b) => b.vote_count - a.vote_count,
              );
              const totalRoleVotes = sortedCandidates.reduce(
                (sum, c) => sum + c.vote_count,
                0,
              );
              const leader = sortedCandidates[0];

              const isUnopposed = roleCandidates.length === 1;

              return (
                <div
                  key={role}
                  className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl"
                >
                  <div className="bg-slate-800/80 px-8 py-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-400 uppercase tracking-wider">
                      {role}
                    </h2>
                    <span className="text-slate-400 text-sm font-medium bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                      {totalRoleVotes} votes cast
                    </span>
                  </div>

                  <div className="p-8 space-y-6">
                    {sortedCandidates.map((candidate, index) => {
                      if (isUnopposed) {
                        const yesVotes = candidate.vote_count || 0;
                        const noVotes = candidate.no_vote_count || 0;
                        const total = yesVotes + noVotes;
                        const yesPercent =
                          total === 0
                            ? 0
                            : ((yesVotes / total) * 100).toFixed(1);
                        const noPercent =
                          total === 0
                            ? 0
                            : ((noVotes / total) * 100).toFixed(1);

                        return (
                          <div key={candidate.id} className="relative">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600">
                                {candidate.image_url ? (
                                  <img
                                    src={candidate.image_url}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                    <FaUserTie className="text-slate-400 text-xl" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-slate-200">
                                  {candidate.name} (Unopposed)
                                </h3>
                              </div>
                            </div>

                            {/* Split Bar */}
                            <div className="w-full bg-slate-700/50 rounded-full h-6 overflow-hidden flex">
                              <div
                                className="bg-green-500 h-full flex items-center justify-center text-xs font-bold text-black transition-all duration-1000"
                                style={{ width: `${yesPercent}%` }}
                              >
                                {yesPercent > 5 && `${yesPercent}%`}
                              </div>
                              <div
                                className="bg-red-500 h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000"
                                style={{ width: `${noPercent}%` }}
                              >
                                {noPercent > 5 && `${noPercent}%`}
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                              <span className="text-green-400 font-bold">
                                {yesVotes} YES
                              </span>
                              <span className="text-red-400 font-bold">
                                {noVotes} NO
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Standard Opposed UI
                      const percentage =
                        totalRoleVotes === 0
                          ? 0
                          : (
                              (candidate.vote_count / totalRoleVotes) *
                              100
                            ).toFixed(1);
                      const isWinner = index === 0 && candidate.vote_count > 0;

                      return (
                        <div key={candidate.id} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                              <div
                                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${isWinner ? "border-yellow-500" : "border-slate-600"}`}
                              >
                                {candidate.image_url ? (
                                  <img
                                    src={candidate.image_url}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                    <FaUserTie className="text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`font-bold text-lg ${isWinner ? "text-yellow-400" : "text-slate-200"}`}
                                  >
                                    {candidate.name}
                                  </h3>
                                  {isWinner && (
                                    <FaTrophy className="text-yellow-500 text-sm" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-slate-100">
                                {candidate.vote_count}
                              </span>
                              <span className="text-slate-500 text-sm ml-1">
                                votes
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? "bg-gradient-to-r from-yellow-500 to-amber-500" : "bg-gradient-to-r from-blue-600 to-cyan-500"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-sm font-medium text-slate-400">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default DedicatedResultsPage;
