// File: src/app/api/clearIndex/route.ts
// This file handles the deletion of all items in the Pinecone index. It is used to clear the index when needed.

import { NextRequest, NextResponse } from "next/server";
import { getPineconeClient } from "@/utils/pinecone";
import logger from "../../utils/logger";

export async function POST(req: Request) {
  const pinecone = await getPineconeClient()
  logger.info('Pinecone client obtained');
  const index = pinecone.Index(process.env.PINECONE_INDEX!)
  logger.info('Index obtained');
  try {
    await index.delete1({
      deleteAll: true
    });
    logger.info('Index cleared');
  } catch (error) {
    logger.error('Error clearing index', error);
  }
  return NextResponse.json({
    success: true
  })
}