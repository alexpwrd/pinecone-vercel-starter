// File: pinecone-vercel-starter/src/app/api/crawl/route.ts
// This file handles the POST request for the crawl API.
// the 10 indicates how many pages will be crawled, TO DO: let the user decide 
import seed from './seed'
import { NextResponse } from 'next/server';
import logger from '../../utils/logger.ts';
export const runtime = 'edge'
export async function POST(req: Request) {
  const { url, options } = await req.json()
  logger.info(`Received request to crawl url: ${url} with options: ${JSON.stringify(options)}`);
  try {
    logger.info(`Attempting to crawl url: ${url}`);
    const documents = await seed(url, 1, process.env.PINECONE_INDEX!, options)
    logger.info(`Successfully crawled url: ${url}`);
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    logger.error(`Failed to crawl url: ${url}. Error: ${error}`);
    return NextResponse.json({ success: false, error: "Failed crawling" })
  }
}