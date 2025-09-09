"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Trophy,
  Plus,
  X,
  Save,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    description: "",
    category: "web",
    value: null,
    flag: "",
    file_url: "",
    visible: true,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [visibleFlags, setVisibleFlags] = useState(new Set());

  useEffect(() => {
    if (!user) {
      router.push("Auth/login");
      return;
    }

    const fetchAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/challenges", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          if (data.role !== "sudo") {
            router.push("/");
          }
          setChallenges(data.challenges ? data.challenges : []);
        } else {
          console.error("Error:", data.message);
          router.push("/");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchAuth();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/admin/challenges/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          file_url: data.url,
        }));
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (challengeId, currentVisibility) => {
    setTogglingId(challengeId);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/admin/challenges/toggleVisiblity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visible: !currentVisibility, challengeId }),
      });

      const data = await res.json();

      if (data.success) {
        setChallenges((prev) =>
          prev.map((challenge) =>
            challenge._id === challengeId
              ? { ...challenge, visible: !currentVisibility }
              : challenge
          )
        );
      } else {
        console.error("Toggle failed:", data.message);
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const deleteChallenge = async (challengeId) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    const adminPassword = prompt(
      "Enter your admin password to confirm deletion:"
    );
    if (!adminPassword) return;

    setDeletingId(challengeId);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminEmail: user.email,
          adminPassword: adminPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setChallenges((prev) =>
          prev.filter((challenge) => challenge._id !== challengeId)
        );
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingChallenge
        ? `/api/admin/challenges/${editingChallenge._id}`
        : "/api/admin/challenges";

      const method = editingChallenge ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        if (editingChallenge) {
          setChallenges((prev) =>
            prev.map((challenge) =>
              challenge._id === editingChallenge._id
                ? { ...challenge, ...formData }
                : challenge
            )
          );
        } else {
          setChallenges((prev) => [...prev, data.newChallenge]);
        }
        resetForm();
      } else {
        alert("Operation failed: " + data.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      author: challenge.author,
      description: challenge.description,
      category: challenge.category,
      value: challenge.value,
      flag: challenge.flag,
      file_url: challenge.file_url || "",
      visible: challenge.visible,
    });
    setShowAddForm(true);
  };

  const toggleFlagVisibility = (challengeId) => {
    setVisibleFlags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(challengeId)) {
        newSet.delete(challengeId);
      } else {
        newSet.add(challengeId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      author: "",
      description: "",
      category: "web",
      value: null,
      flag: "",
      file_url: "",
      visible: true,
    });
    setEditingChallenge(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-100">
                Challenge Management
              </h1>
            </div>
            <div className="gap-2 flex">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Challenge
              </button>
              <Link
                href="/console/secure-access-9f2b/up-team"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-100">
                  {editingChallenge ? "Edit Challenge" : "Add Challenge"}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Challenge name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="web">Web</option>
                    <option value="OSINT">OSINT</option>
                    <option value="pwn">PWN</option>
                    <option value="crypto">Crypto</option>
                    <option value="forensics">Forensics</option>
                    <option value="reverse">Reverse</option>
                    <option value="misc">Misc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value || ""}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Challenge description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Flag
                </label>
                <input
                  type="text"
                  name="flag"
                  value={formData.flag}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="flag{example}"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {uploading && (
                  <p className="text-xs text-blue-400 mt-1">Uploading...</p>
                )}
                {formData.file_url && (
                  <p className="text-xs text-green-400 mt-1">File uploaded</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  name="visible"
                  checked={formData.visible}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="visible"
                  className="ml-2 text-xs text-slate-300"
                >
                  Visible to participants
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingChallenge ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingChallenge ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No challenges found
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Challenge
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="p-4">
                  {/* Challenge Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs font-medium rounded">
                        {challenge.category}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded">
                        <Trophy className="w-3 h-3" />
                        {challenge.value}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                          challenge.visible
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {challenge.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {challenge.visible ? "Live" : "Hidden"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(challenge)}
                        className="p-2 text-slate-400 hover:text-blue-400 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          toggleVisibility(challenge._id, challenge.visible)
                        }
                        disabled={togglingId === challenge._id}
                        className={`p-2 rounded transition-colors ${
                          challenge.visible
                            ? "text-red-400 hover:text-red-300 disabled:text-red-500"
                            : "text-green-400 hover:text-green-300 disabled:text-green-500"
                        }`}
                      >
                        {togglingId === challenge._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : challenge.visible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteChallenge(challenge._id)}
                        disabled={deletingId === challenge._id}
                        className="p-2 text-red-400 hover:text-red-300 disabled:text-red-500 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        {deletingId === challenge._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Challenge Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-100 mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-2">
                        by {challenge.author}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Flag Section */}
                      <div className="bg-slate-900 border border-slate-600 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-medium text-slate-300 uppercase">
                              Flag
                            </span>
                          </div>
                          <button
                            onClick={() => toggleFlagVisibility(challenge._id)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                          >
                            {visibleFlags.has(challenge._id) ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                          <code className="text-xs text-slate-200 font-mono break-all">
                            {visibleFlags.has(challenge._id)
                              ? challenge.flag
                              : "•".repeat(Math.min(challenge.flag.length, 20))}
                          </code>
                        </div>
                      </div>

                      {/* File Download */}
                      {challenge.file_url && (
                        <div className="bg-slate-900 border border-slate-600 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                File
                              </p>
                              <p className="text-xs text-slate-400">
                                Download available
                              </p>
                            </div>
                            <a
                              href={challenge.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
