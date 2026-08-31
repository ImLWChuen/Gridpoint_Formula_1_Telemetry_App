import Parser from "rss-parser";

const parser = new Parser({
    customFields: {
        item: [
            ["media:content", "media", { keepArray: false }],
            ["media:thumbnail", "thumbnail", { keepArray: false }],
            ["enclosure", "enclosure", { keepArray: false }],
        ],
    },
});

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    image?: string;
    category?: string;
    publishedAt: string;
    source: string;

    // F1 filtering
    teams: string[];
    drivers: string[];
    tags: string[];
}

/*
 * RSS feeds
 */
const NEWS_FEEDS = [
    {
        name: "Motorsport.com",
        url: "https://www.motorsport.com/rss/f1/news/",
    },
];

/*
 * F1 teams
 */
const F1_TEAMS = [
    "McLaren",
    "Ferrari",
    "Red Bull",
    "Mercedes",
    "Aston Martin",
    "Alpine",
    "Williams",
    "Racing Bulls",
    "Haas",
    "Audi",
    "Cadillac",
];

/*
 * F1 drivers
 */
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
    "Pierre Gasly",
    "Franco Colapinto",
    "Alex Albon",
    "Carlos Sainz",
    "Esteban Ocon",
    "Oliver Bearman",
    "Nico Hulkenberg",
    "Gabriel Bortoleto",
    "Liam Lawson",
    "Isack Hadjar",
    "Sergio Perez",
    "Valtteri Bottas",
];

/*
 * Detect F1 tags
 */
function getF1Tags(
    title: string,
    description: string,
    category?: string
): {
    teams: string[];
    drivers: string[];
    tags: string[];
} {
    const text = `${title} ${description} ${category ?? ""}`.toLowerCase();

    const teams: string[] = [];
    const drivers: string[] = [];
    const tags: string[] = [];

    /*
     * ==========================================
     * ALWAYS IDENTIFY AS FORMULA 1
     * ==========================================
     */

    tags.push("Formula 1");

    /*
     * ==========================================
     * NEWS TYPE TAGS
     * ==========================================
     */

    if (
        text.includes("qualifying") ||
        text.includes("qualification") ||
        text.includes("quali")
    ) {
        tags.push("Qualifying");
    }

    if (
        text.includes("grand prix") ||
        text.includes("race") ||
        text.includes("racing") ||
        text.includes("finish") ||
        text.includes("podium") ||
        text.includes("win") ||
        text.includes("winner")
    ) {
        tags.push("Race");
    }

    if (text.includes("sprint")) {
        tags.push("Sprint");
    }

    /*
     * ==========================================
     * TECHNICAL
     * ==========================================
     */

    if (
        text.includes("upgrade") ||
        text.includes("aero") ||
        text.includes("aerodynamic") ||
        text.includes("technical") ||
        text.includes("floor") ||
        text.includes("rear wing") ||
        text.includes("front wing") ||
        text.includes("diffuser") ||
        text.includes("sidepod") ||
        text.includes("downforce") ||
        text.includes("suspension") ||
        text.includes("engine") ||
        text.includes("power unit") ||
        text.includes("drs") ||
        text.includes("tyre") ||
        text.includes("tire")
    ) {
        tags.push("Technical");
    }

    /*
     * ==========================================
     * TRANSFER / CONTRACT
     * ==========================================
     */

    if (
        text.includes("contract") ||
        text.includes("signs") ||
        text.includes("signed") ||
        text.includes("signing") ||
        text.includes("joins") ||
        text.includes("joined") ||
        text.includes("move") ||
        text.includes("transfer") ||
        text.includes("deal") ||
        text.includes("future") ||
        text.includes("extension") ||
        text.includes("hire") ||
        text.includes("hired")
    ) {
        tags.push("Transfer");
    }

    /*
     * ==========================================
     * FIA
     * ==========================================
     */

    if (
        text.includes("penalty") ||
        text.includes("fia") ||
        text.includes("stewards") ||
        text.includes("regulation") ||
        text.includes("regulations")
    ) {
        tags.push("FIA");
    }

    /*
     * ==========================================
     * CHAMPIONSHIP
     * ==========================================
     */

    if (
        text.includes("championship") ||
        text.includes("standings") ||
        text.includes("points") ||
        text.includes("title") ||
        text.includes("leader") ||
        text.includes("lead")
    ) {
        tags.push("Championship");
    }

    /*
     * ==========================================
     * TEAM DETECTION
     * ==========================================
     */

    for (const team of F1_TEAMS) {
        if (text.includes(team.toLowerCase())) {
            teams.push(team);
            tags.push(team);
        }
    }

    /*
     * Alternative team names
     */

    const alternativeTeams: Record<string, string> = {
        "scuderia ferrari": "Ferrari",
        "red bull racing": "Red Bull",
        "oracle red bull": "Red Bull",
        "mercedes-amg": "Mercedes",
        "mercedes amg": "Mercedes",
        "aston martin aramco": "Aston Martin",
        "aston martin f1": "Aston Martin",
        "rb f1": "Racing Bulls",
        "vcarb": "Racing Bulls",
        "stake f1": "Audi",
        "sauber": "Audi",
    };

    for (const [keyword, team] of Object.entries(alternativeTeams)) {
        if (text.includes(keyword)) {
            if (!teams.includes(team)) {
                teams.push(team);
            }

            if (!tags.includes(team)) {
                tags.push(team);
            }
        }
    }

    /*
     * ==========================================
     * DRIVER DETECTION
     * ==========================================
     */

    for (const driver of F1_DRIVERS) {
        if (text.includes(driver.toLowerCase())) {
            drivers.push(driver);
            tags.push(driver);
        }
    }

    /*
     * ==========================================
     * REMOVE DUPLICATES
     * ==========================================
     */

    return {
        teams: [...new Set(teams)],
        drivers: [...new Set(drivers)],
        tags: [...new Set(tags)],
    };
}

/*
 * ==========================================
 * GET ARTICLE IMAGE
 * ==========================================
 */

function getImage(item: any): string | undefined {
    /*
     * Standard RSS enclosure
     */
    if (item.enclosure?.url) {
        return item.enclosure.url;
    }

    /*
     * media:content
     */
    if (item.media?.url) {
        return item.media.url;
    }

    if (item.media?.$?.url) {
        return item.media.$.url;
    }

    /*
     * media:thumbnail
     */
    if (item.thumbnail?.url) {
        return item.thumbnail.url;
    }

    if (item.thumbnail?.$?.url) {
        return item.thumbnail.$.url;
    }

    /*
     * Image inside normal content
     */
    if (item.content) {
        const imageMatch = item.content.match(
            /<img[^>]+src=["']([^"']+)["']/i
        );

        if (imageMatch?.[1]) {
            return imageMatch[1];
        }
    }

    /*
     * Image inside content:encoded
     */
    if (item["content:encoded"]) {
        const imageMatch = item["content:encoded"].match(
            /<img[^>]+src=["']([^"']+)["']/i
        );

        if (imageMatch?.[1]) {
            return imageMatch[1];
        }
    }

    return undefined;
}

/*
 * ==========================================
 * CLEAN RSS DESCRIPTION
 * ==========================================
 */

function cleanDescription(description?: string): string {
    if (!description) {
        return "";
    }

    return description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .trim();
}

/*
 * ==========================================
 * FETCH ONE RSS FEED
 * ==========================================
 */

async function fetchFeed(
    feedUrl: string,
    sourceName: string
): Promise<NewsArticle[]> {
    try {
        const response = await fetch(feedUrl, {
            next: {
                revalidate: 300,
            },
        });

        if (!response.ok) {
            throw new Error(
                `RSS request failed: ${response.status}`
            );
        }

        const xml = await response.text();

        const feed = await parser.parseString(xml);

        return feed.items.map((item) => {
            /*
             * Extract title
             */
            const title = item.title ?? "Untitled";

            /*
             * Extract description
             */
            const description = cleanDescription(
                item.contentSnippet ??
                    item.content ??
                    item.description
            );

            /*
             * Extract ALL RSS categories
             *
             * This is important because Motorsport.com
             * may provide more than one category.
             */
            const categories = item.categories ?? [];

            const category =
                categories[0] ?? "Formula 1";

            /*
             * Generate F1 tags
             */
            const {
                teams,
                drivers,
                tags,
            } = getF1Tags(
                title,
                description,
                categories.join(" ")
            );

            /*
             * Return article
             */
            return {
                title,

                description,

                url: item.link ?? "",

                image: getImage(item),

                category,

                publishedAt:
                    item.isoDate ??
                    item.pubDate ??
                    "",

                source: sourceName,

                teams,

                drivers,

                tags,
            };
        });
    } catch (error) {
        console.error(
            `Error fetching ${sourceName} RSS feed:`,
            error
        );

        return [];
    }
}

/*
 * ==========================================
 * GET LATEST F1 NEWS
 * ==========================================
 */

export async function getLatestNews(): Promise<NewsArticle[]> {
    const results = await Promise.all(
        NEWS_FEEDS.map((feed) =>
            fetchFeed(
                feed.url,
                feed.name
            )
        )
    );

    /*
     * Flatten feeds
     */
    const articles = results.flat();

    /*
     * Remove invalid articles
     */
    const validArticles = articles.filter(
        (article) =>
            article.url &&
            article.title
    );

    /*
     * Remove duplicates
     */
    const uniqueArticles = validArticles.filter(
        (article, index, array) =>
            index ===
            array.findIndex(
                (item) =>
                    item.url === article.url
            )
    );

    /*
     * Sort newest first
     */
    uniqueArticles.sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
    );

    /*
     * Latest 6
     */
    return uniqueArticles.slice(0, 6);
}

/*
 * ==========================================
 * FORMAT RELATIVE TIME
 * ==========================================
 */

export function formatRelativeTime(date: string): string {
    const published = new Date(date);

    if (
        Number.isNaN(
            published.getTime()
        )
    ) {
        return "Unknown date";
    }

    const now = new Date();

    const seconds = Math.floor(
        (
            now.getTime() -
            published.getTime()
        ) / 1000
    );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(
        seconds / 60
    );

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 7) {
        return `${days}d ago`;
    }

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    ).format(published);
}

