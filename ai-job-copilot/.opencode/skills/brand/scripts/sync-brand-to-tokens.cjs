#!/usr/bin/env node
/**
 * Sync brand-guidelines.md → design-tokens.json + design-tokens.css
 * Run: node .opencode/skills/brand/scripts/sync-brand-to-tokens.cjs
 */

const fs = require('fs');
const path = require('path');

const GUIDELINES_PATH = path.resolve(__dirname, '../../../../docs/brand-guidelines.md');
const TOKENS_JSON_PATH = path.resolve(__dirname, '../../../../assets/design-tokens.json');
const TOKENS_CSS_PATH = path.resolve(__dirname, '../../../../assets/design-tokens.css');

function parseMarkdownTable(tableContent) {
  const rows = tableContent.split('\n')
    .map(r => r.trim())
    .filter(r => r.startsWith('|') && !r.match(/^\|[\s\-:|]+\|$/));
  
  if (rows.length < 2) return [];
  
  // Skip header row (first row after filtering)
  return rows.slice(1).map(row => {
    const cols = row.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < row.split('|').length - 1);
    return cols;
  }).filter(cols => cols.length > 0);
}

function stripBackticks(s) {
  return s.replace(/`/g, '').trim();
}

function parseGuidelines(content) {
  const tokens = {
    colors: {},
    gradients: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    shadows: {}
  };

  // Parse Color Palette table
  const colorMatch = content.match(/### Color Palette[\s\S]*?\n((?:\|.*\n)+)/);
  if (colorMatch) {
    const rows = parseMarkdownTable(colorMatch[1]);
    rows.forEach(cols => {
      if (cols.length >= 4) {
        const [role, light, dark] = cols.slice(0, 3).map(stripBackticks);
        if (role && role !== 'Role' && !role.includes('---')) {
          const key = role.toLowerCase().replace(/\s+/g, '-');
          tokens.colors[key] = { light, dark };
        }
      }
    });
  }

  // Parse Gradients table
  const gradMatch = content.match(/### Gradients[\s\S]*?\n((?:\|.*\n)+)/);
  if (gradMatch) {
    const rows = parseMarkdownTable(gradMatch[1]);
    rows.forEach(cols => {
      if (cols.length >= 2) {
        const [name, value, usage] = cols.map(stripBackticks);
        if (name && name !== 'Name' && !name.includes('---')) {
          const key = name.toLowerCase().replace(/\s+/g, '-');
          // Prefer the gradient value (contains linear-gradient)
          tokens.gradients[key] = value.includes('linear-gradient') ? value : usage;
        }
      }
    });
  }

  // Parse Typography table
  const typoMatch = content.match(/### Typography[\s\S]*?\n((?:\|.*\n)+)/);
  if (typoMatch) {
    const rows = parseMarkdownTable(typoMatch[1]);
    rows.forEach(cols => {
      if (cols.length >= 2) {
        const [role, font] = cols.map(stripBackticks);
        if (role && role !== 'Role' && !role.includes('---')) {
          const key = role.toLowerCase().replace(/\s+/g, '-');
          tokens.typography[key] = font.replace(/\*\*/g, '');
        }
      }
    });
  }

  // Parse Spacing (from markdown list format: - `--space-xs`: `4px` / `0.25rem`)
  const spacingMatches = content.matchAll(/--space-(\w+):\s*`([^`]+)`/g);
  for (const match of spacingMatches) {
    tokens.spacing[match[1]] = match[2].trim();
  }

  // Parse Border Radius table
  const radiusMatch = content.match(/### Border Radius[\s\S]*?\n((?:\|.*\n)+)/);
  if (radiusMatch) {
    const rows = parseMarkdownTable(radiusMatch[1]);
    rows.forEach(cols => {
      if (cols.length >= 2) {
        const [size, value] = cols.slice(0, 2).map(stripBackticks);
        if (size && size !== 'Size' && !size.includes('---')) {
          const key = size.toLowerCase().replace(/\s+/g, '-');
          tokens.borderRadius[key] = value;
        }
      }
    });
  }

  // Parse Shadows table
  const shadowMatch = content.match(/### Shadows[\s\S]*?\n((?:\|.*\n)+)/);
  if (shadowMatch) {
    const rows = parseMarkdownTable(shadowMatch[1]);
    rows.forEach(cols => {
      if (cols.length >= 2) {
        const [level, value] = cols.slice(0, 2).map(stripBackticks);
        if (level && level !== 'Level' && !level.includes('---')) {
          const key = level.toLowerCase().replace(/\s+/g, '-');
          tokens.shadows[key] = value;
        }
      }
    });
  }

  return tokens;
}

function generateJSON(tokens) {
  const output = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "source": "docs/brand-guidelines.md",
    "colors": { light: {}, dark: {} },
    "gradients": tokens.gradients,
    "typography": tokens.typography,
    "spacing": tokens.spacing,
    "borderRadius": tokens.borderRadius,
    "shadows": tokens.shadows
  };

  Object.entries(tokens.colors).forEach(([key, val]) => {
    output.colors.light[key] = val.light;
    output.colors.dark[key] = val.dark;
  });

  return JSON.stringify(output, null, 2);
}

function generateCSS(tokens) {
  let css = '/* Auto-generated from docs/brand-guidelines.md */\n';
  css += '/* Do not edit directly — edit brand-guidelines.md and run sync script */\n\n';

  css += ':root {\n';
  Object.entries(tokens.colors).forEach(([key, val]) => {
    css += `  --color-${key}: ${val.light};\n`;
  });
  Object.entries(tokens.gradients).forEach(([key, val]) => {
    css += `  --gradient-${key}: ${val};\n`;
  });
  Object.entries(tokens.typography).forEach(([key, val]) => {
    css += `  --font-${key}: ${val};\n`;
  });
  Object.entries(tokens.spacing).forEach(([key, val]) => {
    css += `  --space-${key}: ${val};\n`;
  });
  Object.entries(tokens.borderRadius).forEach(([key, val]) => {
    css += `  --radius-${key}: ${val};\n`;
  });
  Object.entries(tokens.shadows).forEach(([key, val]) => {
    css += `  --shadow-${key}: ${val};\n`;
  });
  css += '}\n\n';

  css += '.dark {\n';
  Object.entries(tokens.colors).forEach(([key, val]) => {
    css += `  --color-${key}: ${val.dark};\n`;
  });
  css += '}\n';

  return css;
}

function main() {
  try {
    const content = fs.readFileSync(GUIDELINES_PATH, 'utf8');
    const tokens = parseGuidelines(content);

    const json = generateJSON(tokens);
    fs.writeFileSync(TOKENS_JSON_PATH, json);
    console.log(`✅ Generated ${TOKENS_JSON_PATH}`);

    const css = generateCSS(tokens);
    fs.writeFileSync(TOKENS_CSS_PATH, css);
    console.log(`✅ Generated ${TOKENS_CSS_PATH}`);

  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

main();