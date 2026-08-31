import {
    getLatestNews,
    NewsArticle,
} from "@/lib/news";

import NewsFilters from "./NewsFilters";

export default async function NewsWidget() {
    const news: NewsArticle[] =
        await getLatestNews();

return (
    <section className="rounded-2xl bg-zinc-950 p-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">

            <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Formula 1
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                    Latest News
                </h2>
            </div>

            <a
                href="https://www.formula1.com/en/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 transition hover:text-white"
            >
                View All
            </a>

        </div>

        <NewsFilters news={news} />

    </section>
);


}
