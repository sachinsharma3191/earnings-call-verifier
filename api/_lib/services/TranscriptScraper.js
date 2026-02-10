
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Service to fetch and parse earnings call transcripts from public sources.
 */
export class TranscriptScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Fetches and parses a transcript from a given URL based on the source type.
   * @param {string} url - The URL of the transcript
   * @param {string} source - The source name (e.g., 'The Motley Fool', 'Yahoo Finance', 'Investing.com')
   * @returns {Promise<string|null>} - The parsed transcript text or null if failed
   */
  async fetchTranscript(url, source) {
    if (!url) return null;

    try {
      console.log(`Fetching transcript from ${source}: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000 // 10s timeout
      });

      const html = response.data;
      
      switch (source) {
        case 'The Motley Fool':
          return this.parseMotleyFool(html);
        case 'Yahoo Finance':
          return this.parseYahoo(html);
        case 'Investing.com':
          return this.parseInvesting(html);
        case 'Seeking Alpha':
           // Seeking Alpha is heavily gated, but we can try basic parsing if public
           return this.parseSeekingAlpha(html);
        default:
          console.warn(`Unknown source parser for: ${source}`);
          return null;
      }
    } catch (error) {
      console.error(`Error fetching transcript from ${source}:`, error.message);
      return null;
    }
  }

  /**
   * Parses transcripts from The Motley Fool.
   * Usually contained in <div class="article-body"> or similar.
   */
  parseMotleyFool(html) {
    const $ = cheerio.load(html);
    // Remove ads and unnecessary elements
    $('.interad, .promo, script, style').remove();
    
    // Main content container
    const content = $('.article-body, .tailwind-article-body').first();
    
    if (content.length > 0) {
      return this.cleanText(content.text());
    }
    return null;
  }

  /**
   * Parses transcripts from Yahoo Finance.
   * content is usually in <div class="caas-body">.
   */
  parseYahoo(html) {
    const $ = cheerio.load(html);
    $('.caas-content-wrapper-ads, script, style').remove();
    
    const content = $('.caas-body').first();
    
    if (content.length > 0) {
      return this.cleanText(content.text());
    }
    return null;
  }

  /**
   * Parses transcripts from Investing.com.
   * Content usually in <div class="WYSIWYG articlePage">.
   */
  parseInvesting(html) {
    const $ = cheerio.load(html);
    const content = $('#leftColumn .WYSIWYG').first();
    
    if (content.length > 0) {
      return this.cleanText(content.text());
    }
    return null;
  }

  /**
   * Basic parser for Seeking Alpha (often gated/protected).
   */
  parseSeekingAlpha(html) {
     const $ = cheerio.load(html);
     const content = $('[data-test-id="article-content"]').first();
     if (content.length > 0) {
         return this.cleanText(content.text());
     }
     return null;
  }

  /**
   * Cleans up the extracted text.
   */
  cleanText(text) {
    if (!text) return null;
    return text
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }
}
