"use client";
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { US_STATES, US_CITIES } from "../helpers/usLocations";
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { useUserAuth } from '../../context/UserAuthContext';
import { useFollowedArtists } from '../../context/FollowedArtistsContext';

const ProfilePage = () => {
    const { user, logout: contextLogout, loading } = useUserAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchState, setSearchState] = useState("");
    const [searchCity, setSearchCity] = useState("");
    const [events, setEvents] = useState([]);
    const { followedArtists } = useFollowedArtists();
    const [collapsed, setCollapsed] = useState(false);
    // In-memory cache for event search results
    const eventCache = useRef<{ [key: string]: any }>({});
    // Debounce timer
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState("");

    // Use contextLogout from context for logout
    const handleLogout = async () => {
        try {
            localStorage.removeItem("amporaFilters");
            await contextLogout();
            toast.success('Logout successful');
            router.push('/');
        } catch (error: any) {
            console.error('Error during logout:', error);
            toast.error(error.message);
        }
    };

    // On mount, read filters from URL query params (or fallback to user info)
    useEffect(() => {
        if (!user) return;
        const stateParam = searchParams.get("state") || user.state || "";
        const cityParam = searchParams.get("city") || user.city || "";
        const termParam = searchParams.get("term") || "";
        const pageParam = searchParams.get("page") || "0";
        setSearchState(stateParam);
        setSearchCity(cityParam);
        setSearchTerm(termParam);
        setPage(Number(pageParam));
        if (stateParam && US_CITIES[stateParam]) {
            setCityOptions(US_CITIES[stateParam]);
        }
    }, [user]);

    // Helper to update URL query params
    const updateQueryParams = (params: Record<string, string | number>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === "" || value === undefined || value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });
        router.replace(`${pathname}?${newParams.toString()}`);
    };

    useEffect(() => {
        if (searchState && US_CITIES[searchState]) {
            setCityOptions(US_CITIES[searchState]);
        } else {
            setCityOptions([]);
        }
    }, [searchState]);

    // Update URL query params when filters change
    useEffect(() => {
        updateQueryParams({ state: searchState, city: searchCity, term: searchTerm, page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchState, searchCity, searchTerm, page]);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("amporaFilters", JSON.stringify({
            searchState,
            searchCity,
            searchTerm,
            page
        }));
    }, [searchState, searchCity, searchTerm, page]);

    const fetchEvents = (debounced = false) => {
        if (!searchCity || !searchState) return;
        const params = [
            `city=${encodeURIComponent(searchCity)}`,
            `state=${encodeURIComponent(searchState)}`,
            `page=${page}`,
            `size=20`
        ];
        if (searchTerm.trim()) {
            params.push(`keyword=${encodeURIComponent(searchTerm.trim())}`);
        }
        const cacheKey = params.join("&");
        // Check cache first
        if (eventCache.current[cacheKey]) {
            const cached = eventCache.current[cacheKey];
            setEvents(cached.events);
            setPageInfo({ totalPages: cached.totalPages });
            return;
        }
        // Only fetch if not cached
        fetch(`/api/ticketmaster?${cacheKey}`)
            .then(res => res.json())
            .then(data => {
                const events = data._embedded?.events || [];
                const totalPages = data.page?.totalPages || 1;
                                // Sort events by soonest date
                                                const sortedEvents = events.slice().sort((a: any, b: any) => {
                                                    const dateA = new Date(a.dates?.start?.dateTime || a.dates?.start?.localDate || 0).getTime();
                                                    const dateB = new Date(b.dates?.start?.dateTime || b.dates?.start?.localDate || 0).getTime();
                                                    return dateA - dateB;
                                                });
                                setEvents(sortedEvents);
                setPageInfo({ totalPages });
                // Save to cache
                eventCache.current[cacheKey] = { events, totalPages };
            });
    };

    // Debounced search/filtering
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchEvents();
        }, 400); // 400ms debounce
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchCity, searchState, page, searchTerm]);

        return (
    <div className="relative min-h-screen mt-15 mb-8">
                        <div className="flex flex-row w-full" style={{ minHeight: '75vh' }}>
                        {/* Sidebar for followed artists */}
                        <aside className={`transition-all duration-300 p-4 hidden md:flex flex-col rounded-r-xl shadow-lg ${collapsed ? 'w-12' : 'w-48'}`}
                            style={{ background: '#F3E2D4', borderRight: '4px solid #415E72', height: '500px', minHeight: '300px', maxHeight: '500px' }}
                            >
                            <button
                                className="mb-2 self-end"
                                style={{ color: '#415E72' }}
                                title={collapsed ? 'Expand' : 'Collapse'}
                                onClick={() => setCollapsed(c => !c)}
                            >
                                {collapsed ? (
                                    <span>&#9654;</span> // right arrow
                                ) : (
                                    <span>&#9664;</span> // left arrow
                                )}
                            </button>
                            {!collapsed && (
                                <>
                                    <h2 className="text-xl font-bold mb-3" style={{ color: '#17313E' }}>Following</h2>
                                    <ul style={{ overflowY: 'auto', maxHeight: '380px' }}>
                                        {followedArtists.length === 0 && <li style={{ color: '#F3E2D4', fontStyle: 'italic' }}>No artists followed yet.</li>}
                                        {followedArtists.map(artist => (
                                            <li
                                                key={artist}
                                                className="py-1 truncate transition-colors cursor-pointer"
                                                style={{ color: '#415E72' }}
                                                onClick={() => router.push(`/artist-details/${encodeURIComponent(artist)}`)}
                                            >
                                                {artist}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </aside>
                    <div className="flex-1 flex flex-col items-center relative w-full">
            {/* Account link top right */}
            <div className="absolute top-0 right-8 z-20 flex flex-row items-center gap-4">
                <Link href="/account-information" className="text-2xl font-bold text-blue-700 hover:underline">Account</Link>
                <button onClick={handleLogout} className="ml-2" style={{ background: '#689B8A', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}>Logout</button>
            </div>
            {/* ...existing code... */}
                        <hr />
                        <h2 className='text-2xl'>Welcome, <span className="font-semibold">{user?.username || ""}</span>!</h2>
                                                {!user?.isVerified && (
                                                        <div className="w-full max-w-xl bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded flex flex-col items-start gap-2">
                                                                <strong>Email not verified.</strong> Please check your inbox and click the verification link to unlock all features.
                                                                <button
                                                                    className="mt-2 px-4 py-1 rounded font-bold transition-colors"
                                                                    style={{ background: '#415E72', color: 'white' }}
                                                                    onClick={async () => {
                                                                        try {
                                                                            const res = await fetch('/api/users/resend-verification', {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ email: user?.email })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (res.ok) {
                                                                                toast.success('Verification email resent!');
                                                                            } else {
                                                                                toast.error(data.error || 'Failed to resend email.');
                                                                            }
                                                                        } catch (err) {
                                                                            toast.error('Failed to resend email.');
                                                                        }
                                                                    }}
                                                                >
                                                                    Resend Verification Email
                                                                </button>
                                                        </div>
                                                )}
                        <p className="mt-2">Home State: <span className="font-semibold">{user?.state || ""}</span> | Home City: <span className="font-semibold">{user?.city || ""}</span></p>
            <form className="mt-4 flex items-center gap-2" onSubmit={e => { e.preventDefault(); }}>
                <label htmlFor="state-select">State:</label>
                <select
                    id="state-select"
                    value={searchState}
                    onChange={e => {
                        setSearchState(e.target.value);
                        setSearchCity("");
                        setPage(0);
                    }}
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                >
                    <option value="">Select a state</option>
                    {US_STATES.map(state => (
                        <option key={state.abbr} value={state.abbr}>{state.name}</option>
                    ))}
                </select>
                <label htmlFor="city-select">City:</label>
                <select
                    id="city-select"
                    value={searchCity}
                    onChange={e => { setSearchCity(e.target.value); setPage(0); }}
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    disabled={!searchState}
                >
                    <option value="">{searchState ? "Select a city" : "Select a state first"}</option>
                    {cityOptions.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </form>
            <Link href="/follow-artists" className="mt-5 px-4 py-2" style={{ background: '#689B8A', color: 'white', borderRadius: '0.375rem' }}>Follow Artists</Link>
            <hr className="my-4" />
            <div className="w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Ticketmaster Events In Your Area</h2>
                <form className="mb-4 flex items-center gap-2" onSubmit={e => { e.preventDefault(); setPage(0); }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border rounded px-2 py-1 text-gray-900 bg-white w-64"
                        placeholder="Search by artist or venue..."
                    />
                    <button type="submit" className="px-3 py-1 rounded" style={{ background: '#689B8A', color: 'white' }} onClick={() => setPage(0)}>Search</button>
                    <button
                        type="button"
                        className="px-3 py-1 rounded"
                        style={{ background: '#689B8A', color: 'white' }}
                        onClick={() => fetchEvents()}
                    >
                        Refresh Results
                    </button>
                </form>
                <ul>
                    {events.length === 0 && <li>No events found.</li>}
                    {events.map((event: any) => (
                        <li key={event.id} className="mb-2 p-2 border rounded flex items-center gap-4">
                    <Link href={`/event-details/${event.id}`} className="flex items-center gap-4 w-full rounded transition-colors" style={{ transition: 'background 0.2s', }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#7c807e')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                {event.images && event.images[0] && (
                                    <img src={event.images[0].url} alt={event.name} className="w-24 h-16 object-cover rounded" />
                                )}
                                <div>
                                    <strong>{event.name}</strong> <br />
                                    {event.dates?.start?.localDate}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        className="px-3 py-1 rounded disabled:opacity-50"
                        style={{ background: '#689B8A', color: 'white' }}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>
                    <span>Page {page + 1} of {pageInfo.totalPages}</span>
                    <button
                        className="px-3 py-1 rounded disabled:opacity-50"
                        style={{ background: '#689B8A', color: 'white' }}
                        onClick={() => setPage(p => Math.min(pageInfo.totalPages - 1, p + 1))}
                        disabled={page + 1 >= pageInfo.totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default ProfilePage;