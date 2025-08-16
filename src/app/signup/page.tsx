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

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Singup success", response.data);
            router.push("/login");
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
        <div className="relative p-2 flex flex-col items-center justify-center min-h-screen py-2">
            <Link href="/" className="absolute top-4 left-4 text-white-600 hover:underline">Home</Link>
            <h1>{loading ? "Processing" : "Signup"}</h1>
            <hr />
            <label htmlFor="username">username</label>
            <input id="username"
                type="text"
                value={user.username}
                onChange={(e) => setUser({...user, username: e.target.value})}
                placeholder="username"
            />
            <label htmlFor="email">email</label>
            <input id="email"
                type="text"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
                placeholder="email"
            />
            <label htmlFor="state">state</label>
            <select
                id="state"
                value={user.state}
                onChange={e => setUser({ ...user, state: e.target.value, city: "" })}
                className="border rounded px-2 py-1 mb-2 text-gray-900 bg-white"
            >
                <option value="">Select a state</option>
                {US_STATES.map(state => (
                    <option key={state.abbr} value={state.abbr}>{state.name}</option>
                ))}
            </select>
            <label htmlFor="city">city</label>
            <select
                id="city"
                value={user.city}
                onChange={e => setUser({ ...user, city: e.target.value })}
                className="border rounded px-2 py-1 mb-2 text-gray-900 bg-white"
                disabled={!user.state}
            >
                <option value="">{user.state ? "Select a city" : "Select a state first"}</option>
                {cityOptions.map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
            <label htmlFor="password">password</label>
            <input id="password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({...user, password: e.target.value})}
                placeholder="password"
            />
            <button onClick={onSignup} className="p-2 border border-gray-300 rounded -lg mb-4 focus:outline-one focus:border-gray-600">
                {buttonDisabled ? "No signup" : "Signup"}
                </button>
            <Link href="/login">Login Page</Link>
        </div>
    )
}