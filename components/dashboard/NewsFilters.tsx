"use client";

import { useState } from "react";
import { NewsArticle } from "@/lib/news";

interface NewsFiltersProps {
    news: NewsArticle[];
}

const F1_TEAMS = [
    "McLaren",
    "Ferrari",
    "Mercedes",
    "Red Bull",
    "Aston Martin",
    "Alpine",
    "Williams",
    "Racing Bulls",
    "Haas",
    "Audi",
    "Cadillac",
];

const F1_DRIVERS = [
    "Lando Norris",
    "Oscar Piastri",
    "Max Verstappen",
    "Charles Leclerc",
    "Lewis Hamilton",
    "George Russell",
    "Kimi Antonelli",
    "Fernando Alonso",
    "Lance Stroll",
    "Carlos Sainz",
    "Alex Albon",
    "Esteban Ocon",
    "Oliver Bearman",
    "Pierre Gasly",
    "Franco Colapinto",
    "Nico Hulkenberg",
    "Gabriel Bortoleto",
    "Liam Lawson",
    "Isack Hadjar",
    "Sergio Perez",
    "Valtteri Bottas",
];

export default function NewsFilters({
    news,
}: NewsFiltersProps) {
    const [selectedFilter, setSelectedFilter] =
        useState("latest");

    const [openMenu, setOpenMenu] =
        useState<"teams" | "drivers" | null>(null);

    const handleFilter = (filter: string) => {
        setSelectedFilter(filter);
        setOpenMenu(null);
    };

    /*
     * Filter articles
     */
    const filteredNews = news.filter((article) => {
        if (selectedFilter === "latest") {
            return true;
        }

        if (selectedFilter === "technical") {
            return article.tags?.includes("Technical");
        }

        if (selectedFilter.startsWith("team:")) {
            const team = selectedFilter.replace("team:", "");

            return article.tags?.includes(team);
        }

        if (selectedFilter.startsWith("driver:")) {
            const driver =
                selectedFilter.replace("driver:", "");

            return article.tags?.includes(driver);
        }

        return true;
    });

    return (
        <div>
            {/* ============================= */}
            {/* FILTER BAR */}
            {/* ============================= */}

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {/* Latest */}

                <button
                    type="button"
                    onClick={() => handleFilter("latest")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
    selectedFilter === "latest"
        ? "bg-white text-black"
        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
}`}
                >
                    Latest
                </button>

                {/* Teams */}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenMenu(
                                openMenu === "teams"
                                    ? null
                                    : "teams"
                            )
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
    selectedFilter.startsWith("team:")
        ? "bg-white text-black"
        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
}`}
                    >
                        Teams
                        <span className="ml-1 text-xs">
                            ▼
                        </span>
                    </button>

                    {openMenu === "teams" && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                            <div className="mb-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Teams
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {F1_TEAMS.map((team) => (
                                    <button
                                        key={team}
                                        type="button"
                                        onClick={() =>
                                            handleFilter(
                                                `team:${team}`
                                            )
                                        }
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                    >
                                        {team}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Drivers */}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenMenu(
                                openMenu === "drivers"
                                    ? null
                                    : "drivers"
                            )
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
    selectedFilter.startsWith("driver:")
        ? "bg-white text-black"
        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
}`}
                    >
                        Drivers
                        <span className="ml-1 text-xs">
                            ▼
                        </span>
                    </button>

                    {openMenu === "drivers" && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                            <div className="mb-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Drivers
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {F1_DRIVERS.map((driver) => (
                                    <button
                                        key={driver}
                                        type="button"
                                        onClick={() =>
                                            handleFilter(
                                                `driver:${driver}`
                                            )
                                        }
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                    >
                                        {driver}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Technical */}

                <button
                    type="button"
                    onClick={() =>
                        handleFilter("technical")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
    selectedFilter === "technical"
        ? "bg-white text-black"
        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
}`}
                >
                    Technical
                </button>
            </div>

            {/* ============================= */}
            {/* NEWS GRID */}
            {/* ============================= */}

            {filteredNews.length === 0 ? (
                <div className="rounded-xl bg-zinc-900 p-8 text-center">
                    <p className="text-sm text-zinc-500">
                        No news found for this filter.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredNews.map((article, index) => (
                        <a
                            key={`${article.url}-${index}`}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block overflow-hidden rounded-xl bg-zinc-900 transition hover:bg-zinc-800"
                        >
                            {/* ============================= */}
                            {/* IMAGE */}
                            {/* ============================= */}

                            {article.image ? (
                                <div className="h-48 overflow-hidden bg-zinc-800">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-48 items-center justify-center bg-zinc-800">
                                    <span className="text-sm text-zinc-500">
                                        No image available
                                    </span>
                                </div>
                            )}

                            {/* ============================= */}
                            {/* CONTENT */}
                            {/* ============================= */}

                            <div className="p-5">

                                {/* TAGS */}

                                {article.tags &&
                                    article.tags.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {article.tags.map(
                                                (tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}

                                {/* TITLE */}

                                <h3 className="line-clamp-3 text-lg font-bold leading-snug text-white">
                                    {article.title}
                                </h3>

                                {/* DESCRIPTION */}

                                {article.description && (
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                                        {article.description}
                                    </p>
                                )}

                                {/* FOOTER */}

                                <div className="mt-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-medium text-zinc-400">
                                            {article.source}
                                        </p>

                                        <span className="text-zinc-700">
                                            •
                                        </span>

                                        <p className="text-xs text-zinc-500">
                                            {formatRelativeTime(
                                                article.publishedAt
                                            )}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-xs font-medium text-white group-hover:underline">
                                        Read more
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

/*
 * Relative time helper
 */
function formatRelativeTime(date: string) {
    const published = new Date(date);

    if (Number.isNaN(published.getTime())) {
        return "Unknown date";
    }

    const seconds = Math.floor(
        (Date.now() - published.getTime()) / 1000
    );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return new Intl.DateTimeFormat("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(published);
}

