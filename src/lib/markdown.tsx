import React from 'react';

// ── HTML sanitizer for TipTap output ────────────────────
// Only allows the tags/attributes TipTap's StarterKit + Link produce.
// Everything else is stripped. No external dependency needed.

const ALLOWED_TAGS = new Set([
  'p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br',
]);

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tag: string, attrs: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return '';

    // Self-closing tags
    if (t === 'br') return '<br/>';

    // Closing tags — allow if tag is in whitelist
    if (match.startsWith('</')) return `</${t}>`;

    // Opening tags — strip all attributes except href on <a>
    if (t === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*"([^"]*?)"/i) ||
                         attrs.match(/href\s*=\s*'([^']*?)'/i);
      if (hrefMatch && SAFE_HREF.test(hrefMatch[1])) {
        return `<a href="${hrefMatch[1]}" target="_blank" rel="noopener noreferrer">`;
      }
      return '<a href="#" target="_blank" rel="noopener noreferrer">';
    }

    return `<${t}>`;
  });
}

// ── Detect HTML content vs plain text/markdown ──────────

function isHtml(text: string): boolean {
  return /<[a-z][a-z0-9]*(\s|>)/i.test(text);
}

// ── Legacy markdown → React elements renderer ───────────

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    if (m[2]) {
      nodes.push(<strong key={k++}>{m[2]}</strong>);
    } else if (m[4]) {
      nodes.push(<em key={k++}>{m[4]}</em>);
    } else if (m[6] && m[7]) {
      const href = SAFE_HREF.test(m[7]) ? m[7] : '#';
      nodes.push(
        <a key={k++} href={href} target="_blank" rel="noopener noreferrer">{m[6]}</a>
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdownLegacy(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, bi) => {
    const lines = block.split('\n');

    if (lines.every(l => l.startsWith('- ') || l.trim() === '')) {
      const items = lines.filter(l => l.startsWith('- '));
      if (items.length > 0) {
        elements.push(
          <ul key={bi}>
            {items.map((l, li) => <li key={li}>{parseInline(l.slice(2))}</li>)}
          </ul>
        );
        return;
      }
    }

    if (lines.every(l => /^\d+\.\s/.test(l) || l.trim() === '')) {
      const items = lines.filter(l => /^\d+\.\s/.test(l));
      if (items.length > 0) {
        elements.push(
          <ol key={bi}>
            {items.map((l, li) => (
              <li key={li}>{parseInline(l.replace(/^\d+\.\s/, ''))}</li>
            ))}
          </ol>
        );
        return;
      }
    }

    elements.push(
      <p key={bi}>
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {parseInline(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });

  return <>{elements}</>;
}

// ── Public API ──────────────────────────────────────────

/**
 * Render pod body content. Handles both:
 * - HTML from TipTap (sanitized, rendered via dangerouslySetInnerHTML)
 * - Legacy plain text / markdown (rendered to React elements)
 */
export function renderPodBody(text: string): React.ReactNode {
  if (!text) return null;

  if (isHtml(text)) {
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
    );
  }

  return renderMarkdownLegacy(text);
}

// Keep the old export name for backward compat
export const renderMarkdown = renderPodBody;
