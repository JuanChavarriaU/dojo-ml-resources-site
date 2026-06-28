import { highlightMap } from '../constants.js';

/**
 * Renders the category sidebar.
 * High cohesion: only responsible for sidebar UI.
 * Accepts callback for low coupling (instead of knowing about selectCategory).
 */
export function renderSidebar(resourcesData, activeCategory, categoryList, onCategorySelect) {
  if (!categoryList) return;
  categoryList.innerHTML = '';

  Object.keys(resourcesData).forEach(key => {
    const category = resourcesData[key];
    const li = document.createElement('li');
    li.className = `category-item ${key === activeCategory ? 'active' : ''} ${highlightMap[key] || 'highlight-default'}`;
    li.dataset.key = key;

    const resourceCount = category.elements.filter(el => el.links && el.links.length > 0).length;

    const button = document.createElement('button');
    button.className = 'category-btn';
    button.setAttribute('aria-label', `Ver categoría ${category.name}`);

    const content = document.createElement('div');
    content.className = 'category-btn-content';

    const emoji = document.createElement('span');
    emoji.className = 'cat-emoji';
    emoji.textContent = category.icon;

    const name = document.createElement('span');
    name.className = 'cat-name';
    name.textContent = category.name;

    content.appendChild(emoji);
    content.appendChild(name);

    const count = document.createElement('span');
    count.className = 'cat-count';
    count.textContent = resourceCount;

    button.appendChild(content);
    button.appendChild(count);

    li.appendChild(button);

    li.addEventListener('click', () => {
      onCategorySelect(key);
    });

    categoryList.appendChild(li);
  });
}

/**
 * Updates active states in sidebar.
 */
export function updateSidebarActive(activeCategory) {
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.toggle('active', item.dataset.key === activeCategory);
  });
}
