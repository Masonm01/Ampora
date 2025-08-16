
import Link from "next/link";

export default function Home() {
  return (
  <main className="flex flex-col items-center justify-center min-h-screen w-full font-serif" style={{ fontFamily: 'Merriweather, serif' }}>
      <nav className="w-full flex justify-end p-4 absolute top-0 left-0">
        <Link href="/login" className="mr-4 text-white-600 hover:underline">Login</Link>
        <Link href="/signup" className="text-white-600 hover:underline">Signup</Link>
      </nav>
      <h1 className="text-4xl font-bold text-center">Welcome to Ampora!</h1>
    </main>
  )
}
