"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Target } from "lucide-react";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null); // Changed from {} to null

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        const authToken = localStorage.getItem("token");
        const response = await fetch("/api/leaderboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        const responseData = await response.json();

        console.log(responseData);

        if (responseData.success) {
          setLeaderboardData(responseData.leaderboard);
          setCurrentUserInfo(responseData.currentUser || null);
        } else {
          setError(responseData.message || "Failed to load leaderboard");
        }
      } catch (fetchError) {
        setError("Connection failed");
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboardData();
  }, []);

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return (
          <div className="flex items-center justify-center text-3xl ml-2 font-medium text-amber-400">
            #{position}
          </div>
        );
      case 2:
        return (
          <div className=" flex items-center justify-center text-3xl ml-2 font-medium text-slate-300">
            #{position}
          </div>
        );
      case 3:
        return (
          <div className=" flex items-center justify-center text-3xl ml-2 font-medium text-orange-400">
            #{position}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center text-3xl ml-2 font-medium text-slate-400">
            #{position}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-white/10 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-300 font-medium">
            Loading leaderboard...
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

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-100 border-b-6 pb-1 pr-4 border-b-red-800 max-w-fit">
              Leaderboards
            </h1>
          </div>

          {currentUserInfo?.rank && (
            <div className="flex items-center justify-center lg:justify-end">
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-[#232323] border border-white/20 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-red-500/10 transition-all duration-200">
                <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-blue-100 font-bold text-md sm:text-base">
                    Your Team Position: #{currentUserInfo.rank}
                  </span>
                  <span className="hidden sm:inline text-blue-200">•</span>
                  <span className="text-blue-100 font-bold text-md">
                    {currentUserInfo.score} points
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {leaderboardData.length === 0 ? (
          <div className="bg-[#1b1b1b] rounded-xl p-12 text-center border border-[#3a2c2c]">
            <div className="w-16 h-16 bg-[#2a2323] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-[#a39b9b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#d6d6d6] mb-2">
              No participants yet
            </h3>
            <p className="text-[#9c8e8e]">
              Be the first to join the competition
            </p>
          </div>
        ) : (
          <>
            {/* Full Rankings */}
            <div className="space-y-2 mb-8">
              {leaderboardData.map((participant, index) => {
                const position = index + 1;
                const isCurrentUser = currentUserInfo?.rank === position;
                const isTop3 = position <= 3;

                return (
                  <div
                    key={participant.teamId}
                    className={`flex items-center justify-between p-2 rounded-lg shadow-sm border border-white/20 transition-all ${
                      isCurrentUser
                        ? "bg-red-400/20 border-blue-500/20 shadow-blue-500/5"
                        : isTop3
                        ? "bg-[#292929] border-slate-700/50"
                        : "bg-[#191919] border-slate-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3 min-w-[60px]">
                        {getRankIcon(position)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isCurrentUser
                                ? "text-blue-100"
                                : position === 1
                                ? "text-amber-300"
                                : position === 2
                                ? "text-slate-300"
                                : position === 3
                                ? "text-orange-300"
                                : "text-slate-200"
                            }`}
                          >
                            {participant.name}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-red-600 text-blue-100 text-xs font-medium rounded-md shadow-sm">
                              Your Team
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xl font-semibold ${
                          position === 1
                            ? "text-amber-300"
                            : position === 2
                            ? "text-slate-300"
                            : position === 3
                            ? "text-orange-300"
                            : "text-slate-200"
                        }`}
                      >
                        {participant.score}
                      </div>
                      <div className="text-sm text-slate-500">points</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Card */}
            <div className="bg-[#191919] rounded-xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Statistics
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {leaderboardData.length}
                  </div>
                  <div className="text-sm text-white/50">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {Math.max(...leaderboardData.map((u) => u.score))}
                  </div>
                  <div className="text-sm text-white/50">Highest Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-300 mb-1">
                    {Math.round(
                      leaderboardData.reduce((sum, u) => sum + u.score, 0) /
                        leaderboardData.length
                    )}
                  </div>
                  <div className="text-sm text-white/50">Average</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
