"use client";
import Link from "next/link";
import React from "react";
import {useRouter} from "next/navigation"

import {toast} from "react-hot-toast"
import { useUserAuth } from '../../context/UserAuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login, loading } = useUserAuth();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);

    const onLogin = async () => {
        try {
            await login(user.email, user.password);
            toast.success("Login Success");
            router.push("/profile");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
            toast.error(message);
        }
    };

    React.useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user])

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen py-8 px-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Link href="/" className="absolute top-4 left-4 text-[var(--secondary)] hover:underline">Home</Link>
            <div className="w-full max-w-sm bg-white bg-opacity-80 rounded-xl shadow-lg p-8 flex flex-col items-center" style={{ background: 'var(--accent)' }}>
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Login</h1>
                <hr className="w-full mb-4 border-[var(--secondary)]" />
                <label htmlFor="email" className="mb-1 self-start">Email</label>
                <input id="email"
                    type="text"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    placeholder="email"
                    className="w-full mb-4 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <label htmlFor="password" className="mb-1 self-start">Password</label>
                <input id="password"
                    type="password"
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}
                    placeholder="password"
                    className="w-full mb-6 px-3 py-2 rounded border border-[var(--secondary)] bg-white text-gray-900 placeholder-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <button onClick={onLogin} disabled={buttonDisabled || loading}
                    className="w-full mb-4 py-2 rounded font-bold transition-colors"
                    style={{ background: 'var(--secondary)', color: 'white', opacity: buttonDisabled ? 0.6 : 1 }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <Link href="/signup" className="text-[var(--foreground)] hover:underline">Signup Page</Link>
            </div>
        </div>
    )
}