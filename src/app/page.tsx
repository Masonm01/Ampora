
import Link from "next/link";
import Image from 'next/image';

export default function Home() {

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen w-full font-serif relative"
      style={{ fontFamily: 'Merriweather, serif', minHeight: '100vh', height: 'auto', overflowY: 'auto', backgroundColor: '#0a0a0a' }}
    >
      <nav className="w-full absolute top-0 left-0 z-10">
        <div className="w-full flex justify-end p-4 shadow-md" style={{ backgroundColor: '#070c1b' }}>
          <Link
            href="/login"
            className="mr-4 px-5 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition font-semibold shadow"
          >
            Signup
          </Link>
        </div>
      </nav>
      {/* Hero section with background image behind text */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-4 z-0" style={{ minHeight: '60vh' }}>
    <Image
      src="/homepage background.webp"
      alt="Ampora Live Music Background"
      fill
      className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
      style={{ pointerEvents: 'none' }}
      priority
    />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <div
            className="rounded-xl p-6 shadow-2xl inline-block max-w-xl mt-8"
            style={{
              background: `linear-gradient(rgba(10,18,40,0.95), rgba(10,18,40,0.95)), url('/file.svg') repeat`,
              backgroundSize: 'auto',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)',
            }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-3 mt-10">Welcome to Ampora!</h1>
            <p className="text-lg md:text-xl text-blue-200 mb-4 font-semibold">Discover Live Music Events Near You</p>
            <p className="text-base md:text-lg text-gray-200 mb-6 max-w-2xl">Ampora connects you to the best concerts, festivals, and local shows. Find your next unforgettable music experience today.</p>
            <Link href="/signup" className="px-6 py-3 mb-4 bg-blue-600 text-white text-base rounded-full shadow-lg hover:bg-blue-700 transition font-semibold">Get Started</Link>
          </div>
        </div>
      </section>
      {/* Featured events section placeholder */}
      <section
        className="w-full flex flex-col items-center py-12 px-4 z-10 relative"
        style={{
          background: `linear-gradient(rgba(40,60,100,0.92), rgba(40,60,100,0.92)), url('/globe.svg') repeat`,
          backgroundSize: 'auto',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Featuring Your Favorite Artists, Anywhere in the U.S.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Simple mock events with image and date only */}
              <div className="bg-blue-950 bg-opacity-80 rounded-lg p-4 shadow flex flex-col items-center">
                <Image src="/demopics/taylor-swift.jpg" alt="Taylor Swift" width={96} height={96} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-blue-700" />
                <div className="text-white font-semibold">Taylor Swift</div>
                <div className="text-blue-200 text-sm">Aug 30 &bull; Los Angeles, CA</div>
              </div>
              <div className="bg-blue-950 bg-opacity-80 rounded-lg p-4 shadow flex flex-col items-center">
                <Image src="/demopics/lollapalooza.jpg" alt="Lollapalooza" width={96} height={96} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-blue-700" />
                <div className="text-white font-semibold">Lollapalooza</div>
                <div className="text-blue-200 text-sm">Sep 5-7 &bull; Chicago, IL</div>
              </div>
              <div className="bg-blue-950 bg-opacity-80 rounded-lg p-4 shadow flex flex-col items-center">
                <Image src="/demopics/beyonce.jpg" alt="Beyoncé" width={96} height={96} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-blue-700" />
                <div className="text-white font-semibold">Beyoncé</div>
                <div className="text-blue-200 text-sm">Sep 12 &bull; New York, NY</div>
              </div>
        </div>
      </section>
      {/* Footer message */}
      <div className="w-full flex flex-col items-center py-8 bg-transparent">
        <p className="text-2xl text-blue-200 text-center mb-4">Follow your favorite bands and see when they will be in your city.</p>
        {/* Demo follow feature */}
        <div className="bg-blue-950 bg-opacity-80 rounded-lg p-6 shadow flex flex-col md:flex-row items-center gap-6 max-w-xl w-full justify-center">
          <div className="flex flex-col items-center">
            <Image src="/demopics/foo-fighters.avif" alt="Foo Fighters" width={64} height={64} className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-blue-700" />
            <div className="text-white font-semibold mb-2">Foo Fighters</div>
            <button className="px-4 py-2 rounded-full font-semibold transition" style={{ background: 'var(--accent)', color: 'white' }}>Unfollow</button>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/demopics/polyphia.jpg" alt="Polyphia" width={64} height={64} className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-blue-700" />
            <div className="text-white font-semibold mb-2">Polyphia</div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">Follow</button>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/demopics/radiohead.jpg" alt="Radiohead" width={64} height={64} className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-blue-700" />
            <div className="text-white font-semibold mb-2">Radiohead</div>
            <button className="px-4 py-2 rounded-full font-semibold transition" style={{ background: 'var(--accent)', color: 'white' }}>Unfollow</button>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/demopics/band-of-horses.jpg" alt="Band of Horses" width={64} height={64} className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-blue-700" />
            <div className="text-white font-semibold mb-2">Band of Horses</div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">Follow</button>
          </div>
        </div>
      </div>
    </main>
  )
}
