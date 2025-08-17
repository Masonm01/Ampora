"use client";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import { US_STATES, US_CITIES } from "../helpers/usLocations";
import {useRouter} from "next/navigation"
import axios from "axios";
import {toast} from "react-hot-toast"

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
        state: "",
        city: "",
    })
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showCheckEmail, setShowCheckEmail] = useState(false);

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            setShowCheckEmail(true);
        } catch (error:any){
            console.log("Signup Failed", error);
            // Show backend error message if available
            const backendMsg = error.response?.data?.error;
            if (backendMsg) {
                toast.error(backendMsg);
            } else {
                toast.error(error.message || "Signup failed");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.state && US_CITIES[user.state]) {
            setCityOptions(US_CITIES[user.state]);
        } else {
            setCityOptions([]);
        }
    }, [user.state]);

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0 && user.state.length > 0 && user.city.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user])

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen py-8 px-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Link href="/" className="absolute top-4 left-4 text-[var(--secondary)] hover:underline">Home</Link>
            <div className="w-full max-w-sm bg-white bg-opacity-80 rounded-xl shadow-lg p-8 flex flex-col items-center" style={{ background: 'var(--accent)' }}>
                {showCheckEmail ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Check Your Email</h1>
                        <p className="mb-4 text-center">A verification link has been sent to your email address. Please check your inbox and follow the link to verify your account before logging in.</p>
                        <Link href="/login" className="text-[var(--foreground)] hover:underline">Go to Login</Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>{loading ? "Processing" : "Signup"}</h1>
                        <hr className="w-full mb-4 border-[var(--secondary)]" />
                        <label htmlFor="username" className="mb-1 self-start">Username</label>
                        <input id="username"
                            type="text"
                            value={user.username}
                            onChange={(e) => setUser({...user, username: e.target.value})}
                            placeholder="username"
                            className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                        />
                        <label htmlFor="email" className="mb-1 self-start">Email</label>
                        <input id="email"
                            type="text"
                            value={user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}
                            placeholder="email"
                            className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                        />
                        <label htmlFor="state" className="mb-1 self-start">State</label>
                        <select
                            id="state"
                            value={user.state}
                            onChange={e => setUser({ ...user, state: e.target.value, city: "" })}
                            className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                            style={{ color: user.state ? '#1a202c' : 'rgba(31, 41, 55, 0.6)' }}
                        >
                            <option value="">Select a state</option>
                            {US_STATES.map(state => (
                                <option key={state.abbr} value={state.abbr}>{state.name}</option>
                            ))}
                        </select>
                        <label htmlFor="city" className="mb-1 self-start">City</label>
                        <select
                            id="city"
                            value={user.city}
                            onChange={e => setUser({ ...user, city: e.target.value })}
                            className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                            style={{ color: user.city ? '#1a202c' : 'rgba(31, 41, 55, 0.6)' }}
                            disabled={!user.state}
                        >
                            <option value="">{user.state ? "Select a city" : "Select a state first"}</option>
                            {cityOptions.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <label htmlFor="password" className="mb-1 self-start">Password</label>
                        <input id="password"
                            type="password"
                            value={user.password}
                            onChange={(e) => setUser({...user, password: e.target.value})}
                            placeholder="password"
                            className="w-full mb-6 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                        />
                        <button onClick={onSignup} disabled={buttonDisabled || loading}
                            className="w-full mb-4 py-2 rounded font-bold transition-colors"
                            style={{ background: 'var(--secondary)', color: 'white', opacity: buttonDisabled ? 0.6 : 1 }}>
                            {loading ? 'Processing...' : buttonDisabled ? 'No signup' : 'Signup'}
                        </button>
                        <Link href="/login" className="text-[var(--foreground)] hover:underline">Login Page</Link>
                    </>
                )}
            </div>
        </div>
    )
}