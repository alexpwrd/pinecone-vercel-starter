// File Path: pinecone-vercel-starter/src/app/utils/pinecone.ts
// This file contains utility functions for interacting with the Pinecone database. 
// It includes the function `getPineconeClient` which initializes and returns a Pinecone client, 
// and the function `getMatchesFromEmbeddings` which retrieves matches for the given embeddings from the Pinecone database.

import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";
import logger from './logger';

let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new PineconeClient();
    logger.info('Initializing Pinecone client...');
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    logger.info('Pinecone client initialized successfully');
  }
  return pinecone
}

// The function `getMatchesFromEmbeddings` is used to retrieve matches for the given embeddings
const getMatchesFromEmbeddings = async (embeddings: number[], topK: number, namespace: string): Promise<ScoredVector[]> => {
  // Obtain a client for Pinecone
  const pinecone = await getPineconeClient();
  logger.info('Obtained Pinecone client');

  // Retrieve the list of indexes
  const indexes = await pinecone.listIndexes()
  logger.info('Retrieved list of indexes');

  // Check if the desired index is present, else throw an error
  if (!indexes.includes(process.env.PINECONE_INDEX!)) {
    logger.error(`Index ${process.env.PINECONE_INDEX} does not exist`);
    throw (new Error(`Index ${process.env.PINECONE_INDEX} does not exist`))
  }

  // Get the Pinecone index
  const index = pinecone!.Index(process.env.PINECONE_INDEX!);
  logger.info('Obtained Pinecone index');

  // Define the query request
  const queryRequest = {
    vector: embeddings,
    topK,
    includeMetadata: true,
    namespace
  }

  try {
    // Query the index with the defined request
    const queryResult = await index.query({ queryRequest })
    logger.info('Query to index successful');

    return queryResult.matches || []
  } catch (e) {
    // Log the error and throw it
    logger.error("Error querying embeddings: ", e);
    throw (new Error(`Error querying embeddings: ${e}`,))
  }
}

export { getMatchesFromEmbeddings }