/**
 * CLI utility to append a new resource to resources.json.
 * Designed to be run programmatically (e.g. by a Telegram bot webhook or developer CLI).
 *
 * Usage: node scripts/add-resource.js --category <slug> --title "Title" --url "URL" [--section "Subheading"]
 *
 * Example:
 * node scripts/add-resource.js --category python --title "Aprende Python" --url "https://python.org" --section "Esenciales"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/resources.json');

/**
 * Sanitize user-provided text to prevent XSS when rendered in the frontend.
 * Removes HTML tags and limits length.
 */
function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  // Strip HTML tags
  const stripped = input.replace(/<[^>]*>/g, '').trim();
  // Basic length limit
  return stripped.slice(0, maxLength);
}

// Parse arguments
function getArgs() {
  const args = {};
  process.argv.slice(2).forEach((val, index, array) => {
    if (val.startsWith('--')) {
      const key = val.substring(2);
      const nextVal = array[index + 1];
      if (nextVal && !nextVal.startsWith('--')) {
        args[key] = nextVal;
      } else {
        args[key] = true;
      }
    }
  });
  return args;
}

function printUsageAndExit(categories) {
  console.log(`
Usage: node scripts/add-resource.js --category <slug> --title "Title" --url "URL" [--section "Subheading"]

Parámetros requeridos:
  --category  El slug de la categoría (ej: "python", "matemticas")
  --title     El nombre o título del recurso
  --url       Enlace directo al recurso (debe empezar con http/https)

Parámetros opcionales:
  --section   Subtítulo/Grupo bajo el cual clasificar el recurso (Ej: "Algebra lineal", "Intermedio")

Categorías válidas (slugs disponibles):
${categories.map(c => `  - ${c}`).join('\n')}
`);
  process.exit(1);
}

function main() {
  // Load database
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: No se encontró la base de datos en ${dbPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dbPath, 'utf8');
  let db;
  try {
    db = JSON.parse(rawData);
  } catch (err) {
    console.error(`Error de parseo en resources.json: ${err.message}`);
    process.exit(1);
  }

  const args = getArgs();
  const availableSlugs = Object.keys(db);

  if (!args.category || !args.title || !args.url) {
    printUsageAndExit(availableSlugs);
  }

  const slug = args.category.toLowerCase().trim();
  const title = sanitizeText(args.title);
  const url = args.url.trim();
  const sectionName = args.section ? sanitizeText(args.section, 200) : null;

  if (!availableSlugs.includes(slug)) {
    console.error(`Error: La categoría "${slug}" no es válida.`);
    printUsageAndExit(availableSlugs);
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(`Error: El enlace URL debe ser válido y empezar con http:// o https://`);
    process.exit(1);
  }

  const category = db[slug];
  const elements = category.elements;

  // If a section subheading is specified, let's find it or create it
  if (sectionName) {
    let sectionIndex = -1;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      // Strict: only list_item depth===1 (to match main.js literal grouping for subheadings)
      if (el.type === 'list_item' && el.depth === 1 && el.text.toLowerCase() === sectionName.toLowerCase()) {
        sectionIndex = i;
        break;
      }
    }

    const newResource = {
      type: "list_item",
      depth: 2,
      text: `${title}: ${url}`,
      links: [
        {
          url: url,
          text: title
        }
      ]
    };

    if (sectionIndex !== -1) {
      // Find the end of this section to append it (before next heading or end of list)
      let insertIndex = elements.length;
      for (let i = sectionIndex + 1; i < elements.length; i++) {
        const el = elements[i];
        // Only stop at next list_item depth 1 subheading (consistent with grouping)
        if (el.type === 'list_item' && el.depth === 1) {
          insertIndex = i;
          break;
        }
      }
      elements.splice(insertIndex, 0, newResource);
      console.log(`Recurso insertado bajo la sección existente "${sectionName}" en la posición ${insertIndex}.`);
    } else {
      // Create new section heading at the end, and append the resource
      elements.push({
        type: "list_item",
        depth: 1,
        text: sectionName,
        links: []
      });
      elements.push(newResource);
      console.log(`Creada nueva sección "${sectionName}" al final de la lista de recursos.`);
    }
  } else {
    // If no section subheading is specified, append directly as a paragraph at the end
    elements.push({
      type: "paragraph",
      text: `${title}: ${url}`,
      links: [
        {
          url: url,
          text: title
        }
      ]
    });
    console.log(`Recurso insertado en la sección general de la categoría.`);
  }

  // Save changes
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Base de datos actualizada con éxito en: ${dbPath}`);
    console.log(`Recurso añadido: [${title}] -> ${url}`);
  } catch (err) {
    console.error(`Error guardando los cambios: ${err.message}`);
    process.exit(1);
  }
}

main();
