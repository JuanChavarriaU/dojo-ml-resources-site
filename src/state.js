// Private state
let state = {
  activeCategory: 'matemticas',
  searchQuery: ''
};

// Simple state accessors (low coupling - consumers don't mutate directly)
export function getActiveCategory() {
  return state.activeCategory;
}

export function setActiveCategory(category) {
  state.activeCategory = category;
}

export function getSearchQuery() {
  return state.searchQuery;
}

export function setSearchQuery(query) {
  state.searchQuery = query.trim().toLowerCase();
}

export function clearSearch() {
  state.searchQuery = '';
}
