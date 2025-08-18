"use client";
import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter, useSearchParams } from "next/navigation";
// ...existing code...

export default function VerifyEmailPage() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending'|'success'|'error'>("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    fetch(`/api/users/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus("success");
          setMessage("Your email has been verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="w-full max-w-md bg-white bg-opacity-80 rounded-xl shadow-lg p-8 flex flex-col items-center" style={{ background: 'var(--accent)' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Email Verification</h1>
        {status === "pending" && <p>Verifying your email...</p>}
        {status !== "pending" && (
          <>
            <p className={status === "success" ? "text-green-700" : "text-red-700"}>{message}</p>
            {status === "success" && (
              <a
                href="/login"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                style={{ textDecoration: 'none' }}
              >
                Go to Login
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
