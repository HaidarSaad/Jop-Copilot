#!/usr/bin/env node
/**
 * Extract brand context for prompt injection
 * Run: node .opencode/skills/brand/scripts/inject-brand-context.cjs [--json]
 */

const fs = require('fs');
const path = require('path');

const GUIDELINES_PATH = path.resolve(__dirname, '../../../../docs/brand-guidelines.md');
const AS_JSON = process.argv.includes('--json');

function extractContext(content) {
  const ctx = {};

  // Brand essence
  const essenceMatch = content.match(/## Brand Essence[\s\S]*?\n((?:\|.*\n)+)/);
  if (essenceMatch) {
    const rows = essenceMatch[1].split('\n').filter(r => r.trim().startsWith('|'));
    ctx.essence = {};
    rows.forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2) ctx.essence[cols[0].toLowerCase()] = cols[1];
    });
  }

  // Colors
  const colorMatch = content.match(/## Color Palette[\s\S]*?\n((?:\|.*\n)+)/);
  if (colorMatch) {
    const rows = colorMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    ctx.colors = {};
    rows.forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        ctx.colors[cols[0].toLowerCase().replace(/\s+/g, '-')] = {
          light: cols[1],
          dark: cols[2],
          cssVar: cols[3]
        };
      }
    });
  }

  // Typography
  const typoMatch = content.match(/## Typography[\s\S]*?\n((?:\|.*\n)+)/);
  if (typoMatch) {
    const rows = typoMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    ctx.typography = {};
    rows.forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) {
        ctx.typography[cols[0].toLowerCase()] = {
          font: cols[1].replace(/\*\*/g, ''),
          weights: cols[2]
        };
      }
    });
  }

  // Voice attributes
  const voiceMatch = content.match(/## Voice & Tone[\s\S]*?### Voice Attributes[\s\S]*?\n((?:\|.*\n)+)/);
  if (voiceMatch) {
    const rows = voiceMatch[1].split('\n').filter(r => r.trim().startsWith('|') && !r.includes('---'));
    ctx.voice = {};
    rows.forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) {
        ctx.voice[cols[0].toLowerCase()] = { description: cols[1], example: cols[2] };
      }
    });
  }

  // Writing rules
  const rulesMatch = content.match(/### Writing Rules[\s\S]*?\n((?:- .*\n)+)/);
  if (rulesMatch) {
    ctx.writingRules = rulesMatch[1].split('\n').map(r => r.replace(/^-\s*/, '').trim()).filter(Boolean);
  }

  // Component standards
  const compMatch = content.match(/## Component Standards[\s\S]*?(?=##|$)/);
  if (compMatch) {
    ctx.components = compMatch[0];
  }

  return ctx;
}

function main() {
  try {
    const content = fs.readFileSync(GUIDELINES_PATH, 'utf8');
    const ctx = extractContext(content);

    if (AS_JSON) {
      console.log(JSON.stringify(ctx, null, 2));
    } else {
      // Human-readable format for prompt injection
      console.log('=== AI JOB COPILOT BRAND CONTEXT ===\n');
      console.log(`NAME: ${ctx.essence?.name || 'AI Job Copilot'}`);
      console.log(`TAGLINE: ${ctx.essence?.tagline || 'Your AI-powered job application copilot'}`);
      console.log(`MISSION: ${ctx.essence?.mission || ''}`);
      console.log(`VALUES: ${ctx.essence?.values || ''}\n`);

      console.log('COLORS:');
      Object.entries(ctx.colors || {}).forEach(([k, v]) => {
        console.log(`  ${k}: light=${v.light} dark=${v.dark} (${v.cssVar})`);
      });

      console.log('\nTYPOGRAPHY:');
      Object.entries(ctx.typography || {}).forEach(([k, v]) => {
        console.log(`  ${k}: ${v.font} (${v.weights})`);
      });

      console.log('\nVOICE:');
      Object.entries(ctx.voice || {}).forEach(([k, v]) => {
        console.log(`  ${k}: ${v.description} — "${v.example}"`);
      });

      console.log('\nWRITING RULES:');
      (ctx.writingRules || []).forEach(r => console.log(`  - ${r}`));

      console.log('\n=== END BRAND CONTEXT ===');
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

main();