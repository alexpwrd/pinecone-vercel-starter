// File: pinecone-vercel-starter/src/app/api/crawl/crawler.ts
// This file contains the Crawler class which is used to crawl web pages up to a certain depth and number of pages.

import cheerio from 'cheerio';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import logger from '../../utils/logger.ts'; // Import logger

interface Page {
  url: string;
  content: string;
}

class Crawler {
  private seen = new Set<string>();
  private pages: Page[] = [];
  private queue: { url: string; depth: number }[] = [];

  // maxDepth and MaxPages
  constructor(private maxDepth = 0, private maxPages = 1) { }

  async crawl(startUrl: string): Promise<Page[]> {
    // Add the start URL to the queue
    this.addToQueue(startUrl);
    
    // While there are URLs in the queue and we haven't reached the maximum number of pages...
    while (this.shouldContinueCrawling()) {
      const { url, depth } = this.queue.shift()!;
      logger.info(`Dequeued URL: ${url}. Current depth: ${depth}`);

      // If the depth is too great or we've already seen this URL, skip it
      if (this.isTooDeep(depth)) {
        logger.info(`Skipping ${url} due to depth.`);
        continue;
      }

      if (this.isAlreadySeen(url)) {
        logger.info(`Skipping ${url} because it's already seen.`);
        continue;
      }
      
      // Add the URL to the set of seen URLs
      this.seen.add(url);

      const html = await this.fetchPage(url);
      if (!html) {
        logger.info(`No content fetched for URL: ${url}`);
        continue;
      }

      logger.info(`Successfully crawled URL: ${url}`);

      // Parse the HTML and add the page to the list of crawled pages
      this.pages.push({ url, content: this.parseHtml(html) });

      // Extract new URLs from the page HTML and add them to the queue
      this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
    }
    
    // Log the URLs of the crawled pages
    logger.info(`Crawled pages: ${this.pages.map(page => page.url)}`);
    
    // Return the list of crawled pages
    return this.pages;
  }


  private isTooDeep(depth: number) {
    return depth > this.maxDepth;
  }

  private isAlreadySeen(url: string) {
    return this.seen.has(url);
  }

  private shouldContinueCrawling() {
    return this.queue.length > 0 && this.pages.length < this.maxPages;
  }

  private addToQueue(url: string, depth = 0) {
    this.queue.push({ url, depth });
    logger.info(`Added URL to queue: ${url}. Total URLs in queue: ${this.queue.length}`);
  }

  private addNewUrlsToQueue(urls: string[], depth: number) {
    this.queue.push(...urls.map(url => ({ url, depth: depth + 1 })));
    logger.info(`Added ${urls.length} new URLs to queue. Total URLs in queue: ${this.queue.length}`);
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      logger.error(`Failed to fetch ${url}: ${error}`);
      return '';
    }
  }

  private parseHtml(html: string): string {
    const $ = cheerio.load(html);
    $('a').removeAttr('href');
    return NodeHtmlMarkdown.translate($.html());
  }

  private extractUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const relativeUrls = $('a').map((_, link) => $(link).attr('href')).get() as string[];
    return relativeUrls.map(relativeUrl => new URL(relativeUrl, baseUrl).href);
  }
}

export { Crawler };
export type { Page };

