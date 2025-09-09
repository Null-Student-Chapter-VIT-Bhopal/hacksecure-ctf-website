"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Flag,
  Check,
  Trophy,
  User,
  X,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [solvedChallenges, setSolvedChallenges] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingFlag, setSubmittingFlag] = useState(null);
  const [flagInputs, setFlagInputs] = useState({});
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const { user, isAuthenticated, role } = useAuth();
  const router = useRouter();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web" },
    { value: "OSINT", label: "OSINT" },
    { value: "pwn", label: "PWN" },
    { value: "crypto", label: "Crypto" },
    { value: "forensics", label: "Forensics" },
    { value: "reverse", label: "Reverse" },
    { value: "misc", label: "Misc" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Login First to View Challenges", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
        toastId: "auth error",
      });
      setError("Authentication Error");
      setLoading(false);
      router.push("Auth/login");

      return;
    }
    if (!user) {
      toast.error("Login First to View Challenges", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
        toastId: "auth error",
      });
      setError("Authentication Error");
      setLoading(false);
      router.push("Auth/login");
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const challengesRes = await fetch("/api/challenges", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const challengesData = await challengesRes.json();

          if (!challengesData.success) {
            throw new Error(
              challengesData.message || "Failed to fetch challenges"
            );
          }

          setChallenges(challengesData.challenges);
          setFilteredChallenges(challengesData.challenges);

          const solvedRes = await fetch("/api/challenges/solved", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (solvedRes.ok) {
            const solvedData = await solvedRes.json();
            if (solvedData.success && solvedData.solved) {
              setSolvedChallenges(new Set(solvedData.solved));
            }
          }
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter challenges when category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredChallenges(challenges);
    } else {
      setFilteredChallenges(
        challenges.filter(
          (challenge) => 
            challenge.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  }, [selectedCategory, challenges]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleFlagInputChange = (challengeId, value) => {
    setFlagInputs((prev) => ({
      ...prev,
      [challengeId]: value,
    }));
  };

  const submitFlag = async (challengeId) => {
    const flag = flagInputs[challengeId]?.trim();
    if (!flag) return;

    setSubmittingFlag(challengeId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId,
          flag,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSolvedChallenges((prev) => new Set([...prev, challengeId]));
        setFlagInputs((prev) => ({
          ...prev,
          [challengeId]: "",
        }));
        toast.success(data.message, {
          theme: "dark",
          position: "bottom-right",
          autoClose: 3000,
        });
        setSelectedChallenge(null);
      } else {
        toast.error(data.message, {
          theme: "dark",
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error("Error submitting flag. Please try again.", {
        theme: "dark",
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setSubmittingFlag(null);
    }
  };

  const handleKeyPress = (e, challengeId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitFlag(challengeId);
    }
  };

  const openChallengeModal = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const closeChallengeModal = () => {
    setSelectedChallenge(null);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-white/10 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-300 font-medium">
            Loading challenges...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 font-semibold text-lg mb-2">Error</div>
          <div className="text-slate-400">{error}</div>
        </div>
      </div>
    );
  }

  if (role === "sudo") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 font-semibold text-lg mb-2">
            Bad Access
          </div>
          <div className="text-slate-400">
            Admin Should not Enter Competition...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {isAuthenticated && (
        <>
          <div className="">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-100 border-b-6 pb-1 pr-4 border-b-red-800">
                    Challenges
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#212121] rounded">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-300">
                      {solvedChallenges.size} solved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="max-w-7xl mx-auto px-4 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm font-medium">Filter by category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === category.value
                        ? "bg-[#E50914] text-white border border-[#E50914]"
                        : "bg-[#212121] text-slate-300 border border-white/20 hover:bg-[#2a2323] hover:border-white/30"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-slate-400 text-sm">
                Showing {filteredChallenges.length} of {challenges.length} challenges
                {selectedCategory !== "all" && (
                  <span className="text-slate-300 font-medium ml-1">
                    in {categories.find(cat => cat.value === selectedCategory)?.label}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  {selectedCategory === "all" 
                    ? "No challenges available" 
                    : `No challenges found in ${categories.find(cat => cat.value === selectedCategory)?.label} category`
                  }
                </h3>
                <p className="text-slate-500">
                  {selectedCategory === "all" 
                    ? "Check back later for new challenges" 
                    : "Try selecting a different category"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
                {filteredChallenges.map((challenge) => {
                  const isSolved = solvedChallenges.has(challenge._id);

                  return (
                    <div
                      key={challenge._id}
                      onClick={() => openChallengeModal(challenge)}
                      className={`bg-[#212121] border rounded-xl p-6 cursor-pointer hover:shadow-lg ${
                        isSolved
                          ? "border-green-500/30 bg-gradient-to-br from-green-900/20 to-[#212121] hover:border-green-500/50"
                          : "border-white/10 hover:border-white/20 hover:bg-[#232323]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-100 truncate flex-1 mr-2">
                          {challenge.name}
                        </h2>

                        {isSolved && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-300 text-xs font-medium rounded-lg flex-shrink-0">
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Solved</span>
                          </div>
                        )}
                      </div>

                      {/* Category and Points */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-red-900/50 text-red-300 text-xs font-medium rounded-full uppercase tracking-wide border border-red-700/30">
                          {challenge.category}
                        </span>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-lg">
                            {challenge.value}
                          </span>
                          <span className="text-sm text-slate-400">pts</span>
                        </div>
                      </div>
                      <div className="flex-grow"></div>

                      {/* Author */}
                      <div className="flex items-center gap-2 text-xs text-slate-200 border-t border-white/10 pt-4">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate flex-1">
                          Created by {challenge.author}
                        </span>
                      </div>

                      {/* Click indicator */}
                      <div className="flex items-center justify-center mt-4 pt-2 border-t border-white/10 ">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <ExternalLink className="w-3 h-3" />
                          <span>Click to view details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Challenge Modal */}
          {selectedChallenge && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center p-4 z-50">
              <div className="bg-[#212121] rounded-2xl border border-white/20 w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Modal Header - Fixed */}
                <div className="flex-shrink-0 bg-[#212121] border-b border-white/20 p-6 rounded-t-2xl">
                  <div className="flex items-start justify-between min-w-0">
                    <div className="flex-1 mr-4 min-w-0">
                      <div className="flex items-center gap-3 mb-2 min-w-0">
                        <h2 className="text-2xl font-bold text-slate-100 break-words hyphens-auto flex-1 min-w-0">
                          {selectedChallenge.name}
                        </h2>
                        {solvedChallenges.has(selectedChallenge._id) && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-900 text-green-300 text-sm font-medium rounded-lg flex-shrink-0">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Solved</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="px-3 py-1 bg-red-900 text-red-300 text-sm font-medium rounded-lg uppercase tracking-wide truncate max-w-40">
                          {selectedChallenge.category}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <span className="text-xl font-bold text-slate-200 whitespace-nowrap">
                            {selectedChallenge.value} points
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeChallengeModal}
                      className="text-slate-400 hover:text-[#E50914] p-2 hover:bg-[#E50914]/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-3">
                        Description
                      </h3>
                      <div className="bg-[#2a2323] rounded-lg border border-white/20 max-h-60 overflow-y-auto">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words p-4">
                          {selectedChallenge.description}
                        </p>
                      </div>
                    </div>

                    {/* Author and File */}
                    <div className="flex items-center justify-between p-4 bg-[#2a2323] rounded-lg border border-white/20 min-w-0">
                      <div className="flex items-center gap-2 text-white/70 min-w-0 flex-1 mr-4">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">
                          Created by{" "}
                          <span className="text-slate-300 font-medium break-words">
                            {selectedChallenge.author}
                          </span>
                        </span>
                      </div>

                      {selectedChallenge.file_url && (
                        <a
                          href={selectedChallenge.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B3001B] hover:bg-[#E50914] text-white text-sm font-medium rounded-lg transition-all flex-shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span className="whitespace-nowrap">
                            Download File
                          </span>
                        </a>
                      )}
                    </div>

                    {/* Flag Submission */}
                    {!solvedChallenges.has(selectedChallenge._id) && (
                      <div className="border-t border-white/20 pt-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">
                          Submit Flag
                        </h3>
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={flagInputs[selectedChallenge._id] || ""}
                            onChange={(e) =>
                              handleFlagInputChange(
                                selectedChallenge._id,
                                e.target.value
                              )
                            }
                            onKeyPress={(e) =>
                              handleKeyPress(e, selectedChallenge._id)
                            }
                            placeholder="0x00{...}"
                            className="w-full px-4 py-3 bg-[#292929] border border-white/20 rounded-lg text-slate-100 placeholder-white/40 focus:outline-0 focus:border-white/80 break-all"
                            disabled={submittingFlag === selectedChallenge._id}
                          />
                          <button
                            onClick={() => submitFlag(selectedChallenge._id)}
                            disabled={
                              submittingFlag === selectedChallenge._id ||
                              !flagInputs[selectedChallenge._id]?.trim()
                            }
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#B3001B] hover:bg-[#E50914] disabled:bg-[#77001B] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                          >
                            {submittingFlag === selectedChallenge._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                <span className="break-words">
                                  Checking Flag...
                                </span>
                              </>
                            ) : (
                              <>
                                <Flag className="w-5 h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  Submit Flag
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Solved State */}
                    {solvedChallenges.has(selectedChallenge._id) && (
                      <div className="border-t border-white/20 pt-6">
                        <div className="flex items-center justify-center py-8 bg-green-900/20 rounded-lg border border-green-700/30">
                          <div className="text-center">
                            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-green-300 mb-1">
                              Challenge Completed!
                            </h3>
                            <p className="text-green-400/80 text-sm break-words">
                              You've successfully solved this challenge
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Challenges;