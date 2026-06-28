import './style.css';
import resourcesData from '../data/resources.json';

import { highlightMap, DEFAULT_CATEGORY } from './constants.js';
import { 
  getActiveCategory, 
  setActiveCategory, 
  getSearchQuery, 
  setSearchQuery, 
  clearSearch 
} from './state.js';
import { initTheme, setTheme } from './theme.js';
import { renderSidebar, updateSidebarActive } from './ui/sidebar.js';
import { 
  renderCategoryResources, 
  updateCategoryHeader, 
  renderSearchResults,
  createResourceCard 
} from './ui/resources.js';
import { getSearchResults, getMatchedCount } from './search.js';
import { copyToClipboard } from './clipboard.js';

// DOM references
let els = {};

// ==========================================================================
// Initialization
// ==========================================================================
function init() {
  els = {
    categoryList: document.getElementById('categoryList'),
    resourcesContainer: document.getElementById('resourcesContainer'),
    emptyState: document.getElementById('emptyState'),
    headerIcon: document.getElementById('headerIcon'),
    headerTitle: document.getElementById('headerTitle'),
    headerDesc: document.getElementById('headerDesc'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    resultsCount: document.getElementById('resultsCount'),
    toastNotification: document.getElementById('toastNotification'),
    menuBtn: document.getElementById('menuBtn'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    appSidebar: document.getElementById('appSidebar'),
    themeDarkBtn: document.getElementById('themeDarkBtn'),
    themeLightBtn: document.getElementById('themeLightBtn'),
  };

  const critical = [els.categoryList, els.resourcesContainer, els.searchInput];
  if (critical.some(el => !el)) {
    console.error('Critical DOM elements missing');
    return;
  }

  initTheme(els.themeDarkBtn, els.themeLightBtn);
  setupEventListeners();

  renderSidebar(resourcesData, getActiveCategory(), els.categoryList, handleCategorySelect);
  selectCategory(getActiveCategory());
}

// ==========================================================================
// Events
// ==========================================================================
function setupEventListeners() {
  const { searchInput, searchClearBtn, menuBtn, sidebarToggleBtn, categoryList, appSidebar } = els;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      searchClearBtn.style.display = 'block';
      executeSearch();
    } else {
      searchClearBtn.style.display = 'none';
      selectCategory(getActiveCategory());
    }
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch();
    searchClearBtn.style.display = 'none';
    selectCategory(getActiveCategory());
  });

  menuBtn?.addEventListener('click', () => els.appSidebar?.classList.add('open'));
  sidebarToggleBtn?.addEventListener('click', () => els.appSidebar?.classList.remove('open'));

  categoryList.addEventListener('click', (e) => {
    if (e.target.closest('.category-btn')) {
      els.appSidebar?.classList.remove('open');
    }
  });

  els.themeDarkBtn?.addEventListener('click', () => 
    setTheme('theme-dark', els.themeDarkBtn, els.themeLightBtn)
  );
  els.themeLightBtn?.addEventListener('click', () => 
    setTheme('theme-light', els.themeDarkBtn, els.themeLightBtn)
  );
}

// ==========================================================================
// Handlers (thin orchestration)
// ==========================================================================
function handleCategorySelect(key) {
  els.searchInput.value = '';
  clearSearch();
  els.searchClearBtn.style.display = 'none';
  selectCategory(key);
}

function selectCategory(key) {
  setActiveCategory(key);
  updateSidebarActive(key);

  const category = resourcesData[key];
  const highlightClass = highlightMap[key] || 'highlight-default';

  updateCategoryHeader(key, resourcesData, els.headerIcon, els.headerTitle, highlightClass);

  renderCategoryResources(
    category.elements,
    highlightClass,
    els.resourcesContainer,
    els.emptyState,
    els.resultsCount,
    els.headerDesc,
    handleCopy
  );
}

function executeSearch() {
  const results = getSearchResults(resourcesData);
  const count = getMatchedCount(results);

  renderSearchResults(
    results,
    els.resourcesContainer,
    els.emptyState,
    els.resultsCount,
    els.headerIcon,
    els.headerTitle,
    els.headerDesc,
    getSearchQuery(),
    handleCopy
  );
}

// Copy handler passed down to cards (keeps clipboard concern in its module)
function handleCopy(url, button) {
  copyToClipboard(url, button, els.toastNotification);
}

// Bootstrap
window.addEventListener('DOMContentLoaded', init);
