/**
 * Pages where the Trending tags right rail earns its space.
 * Everywhere else (notifications, bookmarks, post detail, admin, settings…)
 * keeps the center column wider without discovery chrome.
 */
const TRENDING_RAIL_PAGES = new Set([
    'feed/index',
    'search/index',
    'tags/show',
]);

export function shouldShowTrendingRail(component: string): boolean {
    return TRENDING_RAIL_PAGES.has(component);
}
