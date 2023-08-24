// File: pinecone-vercel-starter/src/app/api/crawl/route.ts
// This file handles the POST request for the crawl API.
// the 10 indicates how many pages will be crawled, TO DO: let the user decide 
import seed from './seed'
import { NextResponse } from 'next/server';
export const runtime = 'edge'
export async function POST(req: Request) {
  const { url, options } = await req.json()
  try {
    const documents = await seed(url, 1, process.env.PINECONE_INDEX!, options)
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed crawling" })
  }
}