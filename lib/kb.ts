import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

export type KbFrontmatter = {
  title: string;
  description?: string;
  tags?: string[];
  sources?: Array<{ title: string; url: string }>;
  createdAt?: string;
};

export type KbArticle = {
  slug: string;
  frontmatter: KbFrontmatter;
  markdown: string;
  html: string;
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'kb');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  typographer: true,
});

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/i, ''))
    .sort();
}

export function getArticle(slug: string): KbArticle {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);

  const fm = parsed.data as Partial<KbFrontmatter>;
  if (!fm.title) {
    throw new Error(`Missing title in frontmatter: ${filePath}`);
  }

  const markdown = String(parsed.content || '').trim();

  // Render markdown -> HTML for in-page display.
  // (We keep it simple; Intercom paste works best with the rendered HTML.)
  const html = md.render(markdown);

  return {
    slug,
    frontmatter: {
      title: fm.title,
      description: fm.description,
      tags: fm.tags ?? [],
      sources: fm.sources ?? [],
      createdAt: fm.createdAt,
    },
    markdown,
    html,
  };
}
