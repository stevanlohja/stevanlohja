#!/usr/bin/env node
/* ============================================================
   Scaffold a new blog post.

   Usage:  node scripts/new-post.mjs "Post title goes here"

   Creates blog/<slug>.md with front matter and draft: true, so the
   post stays off the site until you flip it to false and run
   node scripts/build-blog.mjs
   ============================================================ */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG = join(dirname(fileURLToPath(import.meta.url)), '..', 'blog');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('usage: node scripts/new-post.mjs "Post title goes here"');
  process.exit(1);
}

const slug = title.toLowerCase()
  .replace(/['".,:;!?()]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80)
  .replace(/-+$/, '');

if (!slug) {
  console.error('could not derive a slug from that title - try including a letter or digit');
  process.exit(1);
}

const today = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// Posts are dated in the filename: blog/YYYY-MM-DD-slug.md. The whole filename
// (minus .md) becomes the URL slug, so the date is part of the permalink too.
const file = join(BLOG, `${date}-${slug}.md`);
if (existsSync(file)) {
  console.error(`blog/${date}-${slug}.md already exists - pick another title or edit that file`);
  process.exit(1);
}

const content = `---
title: ${title}
date: ${date}
summary: One sentence shown on the blog index and in link previews.
tags:
draft: true
---

Write the opening paragraph here. It should say what this post is about and
why it matters, in plain language.

## First section

Body text. **Bold**, *italic*, \`inline code\`, and [links](https://example.com)
all work. Lists look like this:

- First point
- Second point

\`\`\`bash
# fenced code blocks keep their formatting
node scripts/build-blog.mjs
\`\`\`

> Blockquotes work too.

When ready: set \`draft: false\` above, then run \`node scripts/build-blog.mjs\`.
`;

if (!existsSync(BLOG)) mkdirSync(BLOG, { recursive: true });
writeFileSync(file, content);

console.log(`created blog/${date}-${slug}.md`);
console.log('');
console.log('next steps:');
console.log(`  1. edit blog/${date}-${slug}.md (title, summary, tags, body)`);
console.log('  2. set draft: false when you want it published');
console.log('  3. run: node scripts/build-blog.mjs');
console.log('  4. commit and push (generated files are committed too)');
