import { highlightMap } from '../constants.js';
import { groupResources, getTotalResourceCount } from '../utils.js';
import { getDomainBadge, cleanTitle } from '../utils.js';

/**
 * Renders resources for a category.
 * Takes data + DOM refs + callbacks.
 */
export function renderCategoryResources(elements, highlightClass, resourcesContainer, emptyState, resultsCount, headerDesc, onCopy) {
  if (!resourcesContainer || !emptyState || !resultsCount || !headerDesc) return;

  resourcesContainer.innerHTML = '';
  emptyState.style.display = 'none';

  const sections = groupResources(elements);
  const totalCount = getTotalResourceCount(sections);

  resultsCount.textContent = `${totalCount} recurso${totalCount !== 1 ? 's' : ''}`;
  headerDesc.textContent = `Lista de ${totalCount} recurso${totalCount !== 1 ? 's' : ''} y guías de estudio curadas por la comunidad.`;

  if (sections.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  sections.forEach(section => {
    const groupDiv = document.createElement('div');
    groupDiv.className = `section-group ${highlightClass}`;

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = section.name;

    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    groupDiv.appendChild(sectionTitle);
    groupDiv.appendChild(grid);

    section.resources.forEach(res => {
      const card = createResourceCard(res, highlightClass, onCopy);
      grid.appendChild(card);
    });

    resourcesContainer.appendChild(groupDiv);
  });
}

export function createResourceCard(res, highlightClass, onCopy) {
  const badgeInfo = getDomainBadge(res.url);
  const cardTitle = cleanTitle(res.title, res.url);
  const description = res.title !== cardTitle && res.title 
    ? res.title 
    : 'Recurso de aprendizaje interactivo recomendado por el Dojo.';

  const card = document.createElement('div');
  card.className = `resource-card ${highlightClass}`;

  // Safe DOM construction to avoid XSS
  const cardTop = document.createElement('div');
  cardTop.className = 'card-top';

  const cardBadges = document.createElement('div');
  cardBadges.className = 'card-badges';
  const badge = document.createElement('span');
  badge.className = `badge ${badgeInfo.class}`;
  badge.textContent = badgeInfo.name;
  cardBadges.appendChild(badge);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'action-btn copy-btn';
  copyBtn.title = 'Copiar enlace';
  copyBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onCopy === 'function') {
      onCopy(res.url, copyBtn);
    }
  });

  cardTop.appendChild(cardBadges);
  cardTop.appendChild(copyBtn);

  const titleLink = document.createElement('a');
  titleLink.href = res.url;
  titleLink.target = '_blank';
  titleLink.rel = 'noopener noreferrer';
  titleLink.className = 'card-title-link';

  const titleH3 = document.createElement('h3');
  titleH3.className = 'card-title';
  titleH3.textContent = cardTitle;
  titleLink.appendChild(titleH3);

  const descP = document.createElement('p');
  descP.className = 'card-description';
  descP.textContent = description;

  const cardBottom = document.createElement('div');
  cardBottom.className = 'card-bottom';

  const actionLink = document.createElement('a');
  actionLink.href = res.url;
  actionLink.target = '_blank';
  actionLink.rel = 'noopener noreferrer';
  actionLink.className = 'card-btn';
  actionLink.innerHTML = `
    <span>Ir al recurso</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  `;

  cardBottom.appendChild(actionLink);

  card.appendChild(cardTop);
  card.appendChild(titleLink);
  card.appendChild(descP);
  card.appendChild(cardBottom);

  return card;
}

/**
 * Updates header and highlights for a category.
 */
export function updateCategoryHeader(key, resourcesData, headerIcon, headerTitle, highlightClass) {
  const category = resourcesData[key];
  if (headerIcon) headerIcon.textContent = category.icon;
  if (headerTitle) headerTitle.textContent = category.name;

  // Apply highlight classes
  document.querySelectorAll('.app-layout, .category-header').forEach(el => {
    Object.values(highlightMap).forEach(cls => el.classList.remove(cls));
    el.classList.add(highlightClass);
  });
}

/**
 * Renders search results (grouped by category).
 */
export function renderSearchResults(searchResults, resourcesContainer, emptyState, resultsCount, headerIcon, headerTitle, headerDesc, searchQuery, onCopy) {
  if (!resourcesContainer || !emptyState) return;

  resourcesContainer.innerHTML = '';
  emptyState.style.display = 'none';

  // Reset highlights during search
  document.querySelectorAll('.app-layout, .category-header').forEach(el => {
    Object.values(highlightMap).forEach(cls => el.classList.remove(cls));
    el.classList.add('highlight-default');
  });

  headerIcon.textContent = '🔍';
  headerTitle.textContent = 'Resultados de búsqueda';
  headerDesc.textContent = `Buscando "${searchQuery}" en todas las secciones del Dojo.`;

  const matchedCount = searchResults.reduce((sum, g) => sum + g.resources.length, 0);
  resultsCount.textContent = `${matchedCount} recurso${matchedCount !== 1 ? 's' : ''}`;

  if (matchedCount === 0) {
    emptyState.style.display = 'block';
    return;
  }

  searchResults.forEach(group => {
    const highlightClass = highlightMap[group.catKey] || 'highlight-default';

    const groupDiv = document.createElement('div');
    groupDiv.className = `section-group highlight-default`;

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = `${group.icon} ${group.categoryName}`;

    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    groupDiv.appendChild(sectionTitle);
    groupDiv.appendChild(grid);

    group.resources.forEach(res => {
      const card = createResourceCard(res, highlightClass, onCopy);
      grid.appendChild(card);
    });

    resourcesContainer.appendChild(groupDiv);
  });
}
