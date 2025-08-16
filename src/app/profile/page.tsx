"use client";
import axios from 'axios';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { US_STATES, US_CITIES } from "../helpers/usLocations";
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const ProfilePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [username, setUsername] = useState("");
    const [homeState, setHomeState] = useState("");
    const [homeCity, setHomeCity] = useState("");
    const [searchState, setSearchState] = useState("");
    const [searchCity, setSearchCity] = useState("");
    const [events, setEvents] = useState([]);
    const [followedArtists, setFollowedArtists] = useState<string[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    // In-memory cache for event search results
    const eventCache = useRef<{ [key: string]: any }>({});
    // Debounce timer
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState("");

    const logout = async () => {
        try {
            // Clear filters from localStorage on logout
            localStorage.removeItem("amporaFilters");
            await axios.get('/api/users/logout')
            toast.success('Logout successful');
            router.push('/login');
        } catch (error: any) {
            console.error('Error during logout:', error);
            toast.error(error.message)
        }
    };

    // On mount, read filters from URL query params (or fallback to user info)
    useEffect(() => {
        fetch("/api/users/user")
            .then(res => res.json())
            .then(data => {
                setUsername(data.data?.username || "");
                setHomeState(data.data?.state || "");
                setHomeCity(data.data?.city || "");
                const stateParam = searchParams.get("state") || data.data?.state || "";
                const cityParam = searchParams.get("city") || data.data?.city || "";
                const termParam = searchParams.get("term") || "";
                const pageParam = searchParams.get("page") || "0";
                setSearchState(stateParam);
                setSearchCity(cityParam);
                setSearchTerm(termParam);
                setPage(Number(pageParam));
                if (stateParam && US_CITIES[stateParam]) {
                    setCityOptions(US_CITIES[stateParam]);
                }
                // Load followed artists from user data
                setFollowedArtists(data.data?.followedArtists || []);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                setEvents(events);
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
                <div className="flex flex-row min-h-screen py-2">
                        {/* Sidebar for followed artists */}
                        <aside className={`transition-all duration-300 bg-gradient-to-b from-blue-100 via-purple-900 to-pink-100 border-r p-4 hidden md:flex flex-col rounded-r-xl shadow-lg ${collapsed ? 'w-12' : 'w-48'}`}>
                            <button
                                className="mb-2 self-end text-purple-800 hover:text-purple-600 focus:outline-none"
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
                                    <h2 className="text-xl font-bold mb-3 text-purple-800">Followed Artists</h2>
                                    <ul>
                                        {followedArtists.length === 0 && <li className="text-gray-500 italic">No artists followed yet.</li>}
                                        {followedArtists.map(artist => (
                                            <li key={artist} className="py-1 truncate text-blue-900 hover:text-purple-700 transition-colors cursor-pointer">{artist}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </aside>
                        <div className="flex-1 flex flex-col items-center">
            <Link href="/account-information" className="text-2xl font-bold text-blue-700 hover:underline mb-2">Account</Link>
            <Link href="/follow-artists" className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Follow Artists</Link>
            <hr />
            <p>Welcome, <span className="font-semibold">{username}</span>!</p>
            <p className="mt-2">Home State: <span className="font-semibold">{homeState}</span> | Home City: <span className="font-semibold">{homeCity}</span></p>
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
            <hr className="my-4" />
            <button onClick={logout} className="bg-amber-500 hover:bg-blue-700 text-white font-bold py-2 px-4">Logout</button>
            <div className="mt-8 w-full max-w-2xl">
                <button
                    className="mb-4 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => fetchEvents()}
                >
                    Refresh Results
                </button>
                <h2 className="text-2xl font-bold mb-4">Ticketmaster Events</h2>
                <form className="mb-4 flex items-center gap-2" onSubmit={e => { e.preventDefault(); setPage(0); }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border rounded px-2 py-1 text-gray-900 bg-white w-64"
                        placeholder="Search by artist or venue..."
                    />
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setPage(0)}>Search</button>
                </form>
                <ul>
                    {events.length === 0 && <li>No events found.</li>}
                    {events.map((event: any) => (
                        <li key={event.id} className="mb-2 p-2 border rounded flex items-center gap-4">
                            <Link href={`/event-details/${event.id}`} className="flex items-center gap-4 w-full hover:bg-gray-100 rounded transition-colors">
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
                        className="px-3 py-1 rounded bg-gray-200 text-gray-900 disabled:opacity-50"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>
                    <span>Page {page + 1} of {pageInfo.totalPages}</span>
                    <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-900 disabled:opacity-50"
                        onClick={() => setPage(p => Math.min(pageInfo.totalPages - 1, p + 1))}
                        disabled={page + 1 >= pageInfo.totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}

export default ProfilePage;