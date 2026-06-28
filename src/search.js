import { getSearchQuery } from './state.js';

/**
 * Performs search across all resources.
 * Returns grouped results (for rendering by caller).
 * This keeps the search logic pure-ish (data only).
 */
export function getSearchResults(resourcesData) {
  const searchQuery = getSearchQuery();
  const searchResults = [];

  Object.keys(resourcesData).forEach(catKey => {
    const category = resourcesData[catKey];
    const matchingResources = [];

    category.elements.forEach(el => {
      const hasLinks = el.links && el.links.length > 0;
      if (!hasLinks) return;

      const matchesText = el.text.toLowerCase().includes(searchQuery);
      const matchesCat = category.name.toLowerCase().includes(searchQuery);

      let matchesUrl = false;
      el.links.forEach(l => {
        if (l.url.toLowerCase().includes(searchQuery) || l.text.toLowerCase().includes(searchQuery)) {
          matchesUrl = true;
        }
      });

      if (matchesText || matchesCat || matchesUrl) {
        el.links.forEach(link => {
          matchingResources.push({
            title: el.text,
            url: link.url,
            linkText: link.text,
            catKey: catKey
          });
        });
      }
    });

    if (matchingResources.length > 0) {
      searchResults.push({
        categoryName: category.name,
        icon: category.icon,
        catKey: catKey,
        resources: matchingResources
      });
    }
  });

  return searchResults;
}

export function getMatchedCount(searchResults) {
  return searchResults.reduce((sum, group) => sum + group.resources.length, 0);
}
