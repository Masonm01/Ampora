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
    } catch (err) {
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
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Account Information</h1>
      <form onSubmit={handleAccountUpdate} className="mb-8 p-4 border rounded w-full max-w-md bg-white text-gray-900">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Update Username & Home Location</h2>
        <label className="block mb-2">Username
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900" />
        </label>
        <label className="block mb-2">State
          <select value={state} onChange={e => setState(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900">
            <option value="">Select a state</option>
            {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
          </select>
        </label>
        <label className="block mb-2">City
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900" disabled={!state}>
            <option value="">{state ? "Select a city" : "Select a state first"}</option>
            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Info</button>
      </form>
      <form onSubmit={handlePasswordUpdate} className="p-4 border rounded w-full max-w-md bg-white text-gray-900">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Change Password</h2>
        <label className="block mb-2">Old Password
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900" />
        </label>
        <label className="block mb-2">New Password
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900" />
        </label>
        <label className="block mb-2">Confirm New Password
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border rounded px-2 py-1 mb-2 text-gray-900" />
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Change Password</button>
      </form>
      <button
        className="mt-6 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600"
        type="button"
        onClick={() => router.push("/profile")}
      >
        Back to Profile
      </button>
    </div>
  );
};

export default AccountInformationPage;
