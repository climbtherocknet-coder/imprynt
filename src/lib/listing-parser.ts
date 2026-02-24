// Listing URL parser — extract structured data from real estate listing URLs

export interface ListingMeta {
  source: string;        // 'zillow' | 'realtor' | 'redfin' | 'trulia' | 'generic'
  address?: string;      // extracted from URL path
  price?: string;        // extracted from URL (rare)
  zpid?: string;         // Zillow property ID
  imageBlocked: boolean; // whether OG images are known to be blocked
}

interface DomainRule {
  source: string;
  match: (hostname: string) => boolean;
  parseAddress: (pathname: string) => string | undefined;
  imageBlocked: boolean;
  extractId?: (pathname: string) => string | undefined;
}

const DOMAIN_RULES: DomainRule[] = [
  {
    source: 'zillow',
    match: (h) => h.includes('zillow.com'),
    parseAddress: (p) => {
      // /homedetails/123-Main-St-City-ST-12345/12345_zpid
      const m = p.match(/\/homedetails\/([^/]+)\//);
      if (!m) return undefined;
      return m[1]
        .replace(/_zpid.*/, '')
        .replace(/\d{4,}_zpid/, '')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },
    imageBlocked: true,
    extractId: (p) => {
      const m = p.match(/(\d+)_zpid/);
      return m?.[1];
    },
  },
  {
    source: 'realtor',
    match: (h) => h.includes('realtor.com'),
    parseAddress: (p) => {
      // /realestateandhomes-detail/123-Main-St_City_ST_12345
      const m = p.match(/\/realestateandhomes-detail\/([^/?]+)/);
      if (!m) return undefined;
      return m[1].replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    },
    imageBlocked: true,
  },
  {
    source: 'redfin',
    match: (h) => h.includes('redfin.com'),
    parseAddress: (p) => {
      // /ST/City/123-Main-St-12345/home/12345
      const m = p.match(/\/[A-Z]{2}\/[^/]+\/([^/]+)\//);
      if (!m) return undefined;
      return m[1].replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    },
    imageBlocked: false,
  },
  {
    source: 'trulia',
    match: (h) => h.includes('trulia.com'),
    parseAddress: (p) => {
      // /p/st/city-st/123-Main-St-City-ST-12345/12345
      const m = p.match(/\/p\/[^/]+\/[^/]+\/([^/]+)\//);
      if (!m) return undefined;
      return m[1].replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    },
    imageBlocked: true,
  },
];

export function parseListingUrl(url: string): ListingMeta {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    for (const rule of DOMAIN_RULES) {
      if (rule.match(hostname)) {
        return {
          source: rule.source,
          address: rule.parseAddress(pathname),
          imageBlocked: rule.imageBlocked,
          zpid: rule.extractId?.(pathname),
        };
      }
    }

    return { source: 'generic', imageBlocked: false };
  } catch {
    return { source: 'generic', imageBlocked: false };
  }
}

export function extractPrice(html: string): string | undefined {
  // Common patterns: $123,456 or $1,234,567
  const m = html.match(/\$[\d,]{4,10}/);
  return m?.[0];
}

export function extractDetails(html: string): { beds?: string; baths?: string; sqft?: string } {
  const details: { beds?: string; baths?: string; sqft?: string } = {};

  // Bed patterns: "3 bed", "3 bd", "3 bedroom"
  const bedMatch = html.match(/(\d+)\s*(?:bed(?:room)?s?|bd)/i);
  if (bedMatch) details.beds = bedMatch[1];

  // Bath patterns: "2 bath", "2 ba", "2.5 bath"
  const bathMatch = html.match(/([\d.]+)\s*(?:bath(?:room)?s?|ba)/i);
  if (bathMatch) details.baths = bathMatch[1];

  // Sqft patterns: "1,500 sqft", "1500 sq ft", "1,500 square feet"
  const sqftMatch = html.match(/([\d,]+)\s*(?:sq\.?\s*ft|square\s*feet)/i);
  if (sqftMatch) details.sqft = sqftMatch[1];

  return details;
}
