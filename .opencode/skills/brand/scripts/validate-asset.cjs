#!/usr/bin/env node
/**
 * Validate asset against brand guidelines
 * Run: node .opencode/skills/brand/scripts/validate-asset.cjs <file>
 */

const fs = require('fs');
const path = require('path');

const GUIDELINES_PATH = path.resolve(__dirname, '../../../../docs/brand-guidelines.md');
const ASSET_PATH = process.argv[2];

if (!ASSET_PATH) {
  console.error('Usage: node validate-asset.cjs <file>');
  process.exit(1);
}

function loadGuidelines() {
  return fs.readFileSync(GUIDELINES_PATH, 'utf8');
}

function extractRules(content) {
  const rules = [];

  // Colors
  const colorMatch = content.match(/## Color Palette[\s\S]*?\n((?:\|.*\n)+)/);
  if (colorMatch) {
    const rows = colorMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    rules.push(...rows.map(r => {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 4) return { type: 'color', role: cols[0], light: cols[1], dark: cols[2] };
      return null;
    }).filter(Boolean));
  }

  // Typography
  const typoMatch = content.match(/## Typography[\s\S]*?\n((?:\|.*\n)+)/);
  if (typoMatch) {
    const rows = typoMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    rules.push(...rows.map(r => {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) return { type: 'typography', role: cols[0], font: cols[1].replace(/\*\*/g, '') };
      return null;
    }).filter(Boolean));
  }

  // Spacing
  const spacingMatches = content.matchAll(/--space-(\w+):\s*([^;]+)/g);
  for (const match of spacingMatches) {
    rules.push({ type: 'spacing', token: match[1], value: match[2].trim() });
  }

  // Radius
  const radiusMatch = content.match(/## Border Radius[\s\S]*?\n((?:\|.*\n)+)/);
  if (radiusMatch) {
    const rows = radiusMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    rules.push(...rows.map(r => {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) return { type: 'radius', size: cols[0], value: cols[1] };
      return null;
    }).filter(Boolean));
  }

  // Shadows
  const shadowMatch = content.match(/## Shadows[\s\S]*?\n((?:\|.*\n)+)/);
  if (shadowMatch) {
    const rows = shadowMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    rules.push(...rows.map(r => {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) return { type: 'shadow', level: cols[0], value: cols[1] };
      return null;
    }).filter(Boolean));
  }

  return rules;
}

function validateAsset(assetPath, rules) {
  const ext = path.extname(assetPath).toLowerCase();
  const content = fs.readFileSync(assetPath, 'utf8');
  const errors = [];
  const warnings = [];

  // CSS/SCSS files
  if (['.css', '.scss', '.sass'].includes(ext)) {
    // Check for hardcoded colors (hex/rgb not using CSS vars)
    const hardcodedColors = content.match(/#[0-9a-fA-F]{3,8}\b|rgb\([^)]+\)|rgba\([^)]+\)/g) || [];
    const allowedHardcoded = ['#000000', '#ffffff', '#fff', '#000'];
    hardcodedColors.forEach(c => {
      if (!allowedHardcoded.includes(c.toLowerCase())) {
        warnings.push(`Hardcoded color found: ${c} (use CSS variables)`);
      }
    });

    // Check for hardcoded spacing (px/rem not using --space-)
    const hardcodedSpacing = content.match(/\b\d+(\.\d+)?(px|rem|em)\b/g) || [];
    hardcodedSpacing.forEach(s => {
      if (!s.includes('0') && !content.includes('--space-')) {
        warnings.push(`Potential hardcoded spacing: ${s} (consider --space- tokens)`);
      }
    });
  }

  // SVG files - check for hardcoded fills
  if (ext === '.svg') {
    const hardcodedFills = content.match(/fill=["'][^"']*["']/g) || [];
    hardcodedFills.forEach(f => {
      if (!f.includes('var(') && !f.includes('currentColor') && !f.includes('none')) {
        warnings.push(`Hardcoded fill in SVG: ${f}`);
      }
    });
  }

  // HTML/JSX - check for Tailwind arbitrary values
  if (['.html', '.jsx', '.tsx', '.vue'].includes(ext)) {
    const arbitrary = content.match(/\[.*#.*\]/g) || [];
    arbitrary.forEach(a => warnings.push(`Tailwind arbitrary value: ${a} (use design tokens)`));
  }

  // General checks
  if (content.includes('Plus Jakarta Sans') || content.includes('JetBrains Mono')) {
    // These are allowed in code but not in brand assets
  }

  return { errors, warnings };
}

function main() {
  try {
    const guidelines = loadGuidelines();
    const rules = extractRules(guidelines);
    const assetFullPath = path.resolve(ASSET_PATH);

    if (!fs.existsSync(assetFullPath)) {
      console.error(`❌ File not found: ${assetFullPath}`);
      process.exit(1);
    }

    const { errors, warnings } = validateAsset(assetFullPath, rules);

    console.log(`\n🔍 Validating: ${path.basename(assetFullPath)}`);
    console.log(`📋 Rules loaded: ${rules.length}\n`);

    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      errors.forEach(e => console.log(`  - ${e}`));
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      warnings.forEach(w => console.log(`  - ${w}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All checks passed!');
    }

    console.log('');
    process.exit(errors.length > 0 ? 1 : 0);

  } catch (err) {
    console.error('❌ Validation failed:', err.message);
    process.exit(1);
  }
}

main();