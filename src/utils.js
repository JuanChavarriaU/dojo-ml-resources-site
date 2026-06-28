import { highlightMap } from './constants.js';

/**
 * Determines the source badge for a given URL based on hostname.
 * Pure function - no side effects.
 */
export function getDomainBadge(url) {
  if (!url) return { name: 'Enlace', class: 'badge-default' };

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { name: 'YouTube', class: 'badge-youtube' };
    }
    if (host.includes('github.com')) {
      return { name: 'GitHub', class: 'badge-github' };
    }
    if (host.includes('coursera.org')) {
      return { name: 'Coursera', class: 'badge-coursera' };
    }
    if (host.includes('udemy.com')) {
      return { name: 'Udemy', class: 'badge-udemy' };
    }
    if (host.includes('deeplearning.ai')) {
      return { name: 'DeepLearning.AI', class: 'badge-deeplearning' };
    }
    if (host.includes('microsoft.com') && !host.includes('azure')) {
      return { name: 'Microsoft', class: 'badge-microsoft' };
    }
    if (host.includes('azure.com') || (host.includes('microsoft.com') && host.includes('azure'))) {
      return { name: 'Azure', class: 'badge-azure' };
    }
    if (host.includes('aws.amazon.com') || host.includes('amazon.com')) {
      return { name: 'AWS', class: 'badge-aws' };
    }
    if (host.includes('comptia.org')) {
      return { name: 'CompTIA', class: 'badge-aws' };
    }
    if (host.includes('ibm.com') || host.includes('cognitiveclass.ai')) {
      return { name: 'IBM', class: 'badge-coursera' };
    }
    if (host.includes('kaggle.com')) {
      return { name: 'Kaggle', class: 'badge-microsoft' };
    }

    // Default fallback
    const cleanHost = host.replace('www.', '');
    const name = cleanHost.split('.')[0].toUpperCase();
    return { name, class: 'badge-default' };
  } catch (e) {
    return { name: 'Recurso', class: 'badge-default' };
  }
}

/**
 * Cleans title text that may contain raw URLs or Notion breadcrumbs.
 * Pure function.
 */
export function cleanTitle(titleText, defaultUrl) {
  if (!titleText) return 'Sin título';
  let cleaned = titleText;

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return 'Documento de Apoyo / Enlace';
  }

  const urlIndex = cleaned.indexOf('http');
  if (urlIndex !== -1) {
    cleaned = cleaned.substring(0, urlIndex);
  }

  cleaned = cleaned.trim().replace(/:$/, '');

  return cleaned || 'Documentación / Curso';
}

/**
 * Groups Notion-style elements into sections based on depth-1 list_items.
 * Pure data transformation - high cohesion for grouping logic.
 */
export function groupResources(elements) {
  const sections = [];
  let currentSection = { name: 'General', resources: [] };

  elements.forEach(el => {
    const isSubheading = el.type === 'list_item' && el.depth === 1;
    const hasLinks = el.links && el.links.length > 0;

    if (isSubheading) {
      if (currentSection.resources.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { name: el.text, resources: [] };
    }

    if (hasLinks) {
      el.links.forEach(link => {
        currentSection.resources.push({
          title: el.text,
          url: link.url,
          linkText: link.text,
          originalType: el.type
        });
      });
    }
  });

  if (currentSection.resources.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Computes total resource count from grouped sections.
 */
export function getTotalResourceCount(sections) {
  return sections.reduce((sum, sec) => sum + sec.resources.length, 0);
}

/**
 * Basic HTML escape function for extra safety.
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
