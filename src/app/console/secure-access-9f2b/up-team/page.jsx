"use client";

import { useState } from "react";

export default function TeamForm() {
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [members, setMembers] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setNumMembers(count);

    setMembers((prev) => {
      const newMembers = [...prev];
      if (count - 1 > newMembers.length) {
        while (newMembers.length < count - 1) {
          newMembers.push({ name: "", email: "" });
        }
      } else if (count - 1 < newMembers.length) {
        newMembers.length = count - 1;
      }
      return newMembers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const formData = {
      teamName,
      leader: { name: leaderName, email: leaderEmail },
      members,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/registerTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Error submitting form:", err);
      setResponse({ success: false, message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#1b263b] p-6 rounded-xl shadow-xl space-y-6 text-[#e0e1dd]"
      >
        <h2 className="text-3xl font-semibold text-center">
          Team Registration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd] h-12"
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Members (1–5)
            </label>
            <select
              value={numMembers}
              onChange={handleNumChange}
              className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd] h-12 appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leader */}
        <div className="pt-2 border-t border-[#415a77]">
          <h3 className="text-lg font-semibold mb-3">Team Leader</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Leader Name
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd]"
                placeholder="Leader's Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Leader Email
              </label>
              <input
                type="email"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd]"
                placeholder="Leader's Email"
              />
            </div>
          </div>
        </div>

        {/* Members */}
        {numMembers > 1 && (
          <div className="pt-2 border-t border-[#415a77]">
            <h3 className="text-lg font-semibold mb-3">Team Members</h3>
            {members.map((member, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Member {index + 1} Name
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleMemberChange(index, "name", e.target.value)
                    }
                    required
                    className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd]"
                    placeholder={`Member ${index + 1} Name`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Member {index + 1} Email
                  </label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) =>
                      handleMemberChange(index, "email", e.target.value)
                    }
                    required
                    className="w-full p-3 rounded-lg bg-[#0d1b2a] border border-[#415a77] focus:outline-none focus:ring-2 focus:ring-[#778da9] text-[#e0e1dd]"
                    placeholder={`Member ${index + 1} Email`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium bg-[#1d3557] hover:bg-[#274c77] transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Team"}
        </button>

        {/* Response */}
        {response && (
          <div className="mt-4 p-4 rounded-lg bg-[#0d1b2a] border border-[#415a77]">
            {response.success ? (
              <div>
                <p className="text-green-400 font-semibold">
                  Team Registered Successfully
                </p>
                <p>
                  Team ID: <span className="font-mono">{response.teamId}</span>
                </p>
                <p>
                  Password:{" "}
                  <span className="font-mono">{response.password}</span>
                </p>
              </div>
            ) : (
              <p className="text-red-400 font-semibold">{response.message}</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
