/**
 * Service to extract quantitative claims from earnings call transcripts.
 */
export class ClaimExtractionService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async extractClaims(transcriptText, ticker, quarter) {
        return extractClaimsFromTranscript(transcriptText);
    }
}

export function extractClaimsFromTranscript(transcriptText) {
    if (!transcriptText || typeof transcriptText !== 'string') return [];

    const sentences = transcriptText
        .replace(/\s+/g, ' ')
        .split(/(?<=[\.\!\?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);

    const claims = [];

    const metricMatchers = [
        { key: 'Revenue', patterns: [/\b(revenue|top line|sales)\b/i], unit: 'billion' },
        { key: 'Net Income', patterns: [/\b(net income|profit)\b/i], unit: 'billion' },
        { key: 'Operating Income', patterns: [/\boperating income\b/i], unit: 'billion' },
        { key: 'Gross Profit', patterns: [/\bgross profit\b/i], unit: 'billion' },
        { key: 'EPS', patterns: [/\beps\b|earnings per share/i], unit: 'dollar' },
        { key: 'Gross Margin', patterns: [/\bgross margin\b/i], unit: 'percent' },
        { key: 'Operating Margin', patterns: [/\boperating margin\b/i], unit: 'percent' },
        { key: 'Net Margin', patterns: [/\bnet margin\b/i], unit: 'percent' },
    ];

    const dollarWithScale = /\$(\d{1,3}(?:[\.,]\d{1,3})*)(?:\s*(billion|million|thousand|bn|mn|k))?/i;
    const percentPattern = /(\d{1,3}(?:[\.,]\d{1,2})?)\s*%/;
    const epsPattern = /\bEPS\s*(?:of|was|came in at|grew to|reached)?\s*\$?(\d{1,3}(?:[\.,]\d{1,2})?)\b/i;

    function normalizeNumber(str) {
        if (typeof str !== 'string') return Number(str);
        return Number(str.replace(/[,]/g, ''));
    }

    function scaleToUnit(value, scale) {
        const v = Number(value);
        if (!scale) return v; // assume already in target unit
        const s = scale.toLowerCase();
        if (s === 'billion' || s === 'bn') return v;
        if (s === 'million' || s === 'mn') return v / 1000;
        if (s === 'thousand' || s === 'k') return v / 1_000_000;
        return v;
    }

    for (const sentence of sentences) {
        const isYoY = /year over year|yoy/i.test(sentence);
        const isQoQ = /quarter over quarter|qoq/i.test(sentence);

        let matchedMetric = null;
        for (const m of metricMatchers) {
            if (m.patterns.some(p => p.test(sentence))) { matchedMetric = m; break; }
        }

        // Try EPS first (distinct format)
        let claimObj = null;
        const epsMatch = sentence.match(epsPattern);
        if (epsMatch) {
            const val = normalizeNumber(epsMatch[1]);
            claimObj = {
                text: sentence,
                metric: 'EPS',
                claimed: val,
                unit: 'dollar'
            };
        }

        // Dollar with optional scale (billion/million)
        if (!claimObj) {
            const m = sentence.match(dollarWithScale);
            if (m && matchedMetric && matchedMetric.unit === 'billion') {
                const raw = normalizeNumber(m[1]);
                const scaled = scaleToUnit(raw, m[2]);
                claimObj = {
                    text: sentence,
                    metric: matchedMetric.key,
                    claimed: Math.round(scaled * 100) / 100,
                    unit: 'billion'
                };
            }
        }

        // Percent
        if (!claimObj) {
            const m = sentence.match(percentPattern);
            if (m && matchedMetric) {
                const pct = normalizeNumber(m[1]);
                const type = isYoY ? 'yoy_percent' : isQoQ ? 'qoq_percent' : 'percent';
                claimObj = {
                    text: sentence,
                    metric: matchedMetric.key,
                    claimed: pct,
                    unit: 'percent',
                    type
                };
            }
        }

        if (claimObj) {
            claims.push({ speaker: undefined, role: undefined, ...claimObj });
        }
    }

    return claims;
}
