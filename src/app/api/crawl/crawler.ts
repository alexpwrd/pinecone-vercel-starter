// File: pinecone-vercel-starter/src/app/api/crawl/crawler.ts
// This file contains the Crawler class which is used to crawl web pages up to a certain depth and number of pages.

import cheerio from 'cheerio';
import { NodeHtmlMarkdown } from 'node-html-markdown';

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
    this.addToQueue(startUrl);

    while (this.shouldContinueCrawling()) {
      const { url, depth } = this.queue.shift()!;
      console.log(`Dequeued URL: ${url}. Current depth: ${depth}`);

      if (this.isTooDeep(depth)) {
        console.log(`Skipping ${url} due to depth.`);
        continue;
      }

      if (this.isAlreadySeen(url)) {
        console.log(`Skipping ${url} because it's already seen.`);
        continue;
      }

      this.seen.add(url);

      const html = await this.fetchPage(url);
      if (!html) {
        console.log(`No content fetched for URL: ${url}`);
        continue;
      }

      console.log(`Successfully crawled URL: ${url}`);
      this.pages.push({ url, content: this.parseHtml(html) });
      this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
    }

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
    console.log(`Added URL to queue: ${url}. Total URLs in queue: ${this.queue.length}`);
  }

  private addNewUrlsToQueue(urls: string[], depth: number) {
    this.queue.push(...urls.map(url => ({ url, depth: depth + 1 })));
    console.log(`Added ${urls.length} new URLs to queue. Total URLs in queue: ${this.queue.length}`);
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}: ${error}`);
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
