"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { US_STATES, US_CITIES } from "../helpers/usLocations";
import { toast } from "react-hot-toast";

const AccountInformationPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/users/user")
      .then(res => res.json())
      .then(data => {
        setUsername(data.data?.username || "");
        setState(data.data?.state || "");
        setCity(data.data?.city || "");
        if (data.data?.state && US_CITIES[data.data.state]) {
          setCityOptions(US_CITIES[data.data.state]);
        }
      });
  }, []);

  useEffect(() => {
    if (state && US_CITIES[state]) {
      setCityOptions(US_CITIES[state]);
    } else {
      setCityOptions([]);
    }
  }, [state]);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, state, city })
      });
      const data = await res.json();
      if (res.ok) toast.success("Account info updated");
      else toast.error(data.error || "Update failed");
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/users/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully");
        setTimeout(() => router.push("/profile"), 1200);
      } else if (data.error === "Old password incorrect") {
        toast.error("Old password is incorrect");
      } else {
        toast.error(data.error || "Password update failed");
      }
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--secondary)' }}>Account Information</h1>
      <div className="w-full max-w-md bg-white bg-opacity-80 rounded-xl shadow-lg p-8 flex flex-col items-center" style={{ background: 'var(--accent)' }}>
        <form onSubmit={handleAccountUpdate} className="mb-8 w-full">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--secondary)' }}>Update Username & Home Location</h2>
          <label className="block mb-2 font-medium">Username
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
          </label>
          <label className="block mb-2 font-medium">State
            <select value={state} onChange={e => setState(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]">
              <option value="">Select a state</option>
              {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
            </select>
          </label>
          <label className="block mb-2 font-medium">City
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
              disabled={!state}>
              <option value="">{state ? "Select a city" : "Select a state first"}</option>
              {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button type="submit" className="w-full py-2 rounded font-bold transition-colors" style={{ background: '#689B8A', color: 'white' }}>Update Info</button>
        </form>
        <form onSubmit={handlePasswordUpdate} className="w-full">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--secondary)' }}>Change Password</h2>
          <label className="block mb-2 font-medium">Old Password
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
          </label>
          <label className="block mb-2 font-medium">New Password
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
          </label>
          <label className="block mb-2 font-medium">Confirm New Password
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
          </label>
          <button type="submit" className="w-full py-2 rounded font-bold transition-colors" style={{ background: '#689B8A', color: 'white' }}>Change Password</button>
        </form>
        <button
          className="mt-6 w-full py-2 rounded font-bold transition-colors"
          style={{ background: '#415E72', color: 'white' }}
          type="button"
          onClick={() => router.push("/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default AccountInformationPage;
