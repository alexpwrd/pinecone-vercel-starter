// File: pinecone-vercel-starter/src/app/api/crawl/seed.ts
// This file contains the seed function which is used to crawl a given URL and index the crawled documents into Pinecone.
import { getEmbeddings } from "@/utils/embeddings";
import { Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { utils as PineconeUtils, Vector } from "@pinecone-database/pinecone";
import md5 from "md5";
import { getPineconeClient } from "@/utils/pinecone";
import { Crawler, Page } from "./crawler";
import { TokenLimitSplitter } from "@/utils/TokenLimitSplitter";
import { truncateStringByBytes } from '../../utils/truncateString';
import logger from '../../utils/logger';


const { chunkedUpsert, createIndexIfNotExists } = PineconeUtils

// Interface for seed options. These are settings that can be changed.
interface SeedOptions {
  splittingMethod: 'recursive' | 'markdown' | 'tokenLimit'; // Method for splitting documents. Can be 'recursive', 'markdown' or 'tokenLimit'.
  chunkSize: number; // Size of each chunk when splitting documents.
  chunkOverlap: number; // Overlap between chunks when splitting documents.
}

type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter | TokenLimitSplitter

async function seed(url: string, limit: number, indexName: string, options: SeedOptions) {
  let vectorCount = 0; // Initialize the counter
  
  try {
    logger.info(`Starting seed function with url: ${url}, limit: ${limit}, indexName: ${indexName}`);

    // Initialize the Pinecone client
    const pinecone = await getPineconeClient();

    const { splittingMethod, chunkSize, chunkOverlap } = options;
    
    // Create a new Crawler with depth 1 and maximum pages as limit
    const crawler = new Crawler(1, limit || 10);

    // Crawl the given URL and get the pages
    const pages = await crawler.crawl(url) as Page[];

    // Choose the appropriate document splitter based on the splitting method
    const splitter: DocumentSplitter = splittingMethod === 'recursive'
      ? new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
      : splittingMethod === 'markdown'
      ? new MarkdownTextSplitter({})
      : new TokenLimitSplitter(500);

    // Prepare documents by splitting the pages
    const documents = await Promise.all(pages.map(page => prepareDocument(page, splitter)));

    // Create Pinecone index if it does not exist
    await createIndexIfNotExists(pinecone!, indexName, 1536);

    const index = pinecone && pinecone.Index(indexName);

    // Get the vector embeddings for the documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));
    
    // Upsert vectors into the Pinecone index
    vectorCount += vectors.length; // Increment the counter by the number of vectors
    await chunkedUpsert(index!, vectors, '', 10);

    logger.info(`Seed function completed successfully`);
    console.log(`Sent ${vectorCount} vectors to Pinecone.`); // Log the total number of vectors

    // Return the first document
    return documents[0];
  } catch (error) {
    logger.error("Error seeding:", error);
    throw error;
  }
}

async function embedDocument(doc: Document): Promise<Vector> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await getEmbeddings(doc.pageContent);

    // Create a hash of the document content
    const hash = md5(doc.pageContent);

    // Return the vector embedding object
    return {
      id: hash, // The ID of the vector is the hash of the document content
      values: embedding, // The vector values are the OpenAI embeddings
      metadata: { // The metadata includes details about the document
        chunk: doc.pageContent, // The chunk of text that the vector represents
        text: doc.metadata.text as string, // The text of the document
        url: doc.metadata.url as string, // The URL where the document was found
        hash: doc.metadata.hash as string // The hash of the document content
      }
    } as Vector;
  } catch (error) {
    console.log("Error embedding document: ", error)
    throw error
  }
}

async function prepareDocument(page: Page, splitter: DocumentSplitter): Promise<Document[]> {
  // Get the content of the page
  const pageContent = page.content;

  // Split the documents using the provided splitter
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        url: page.url,
        // Truncate the text to a maximum byte length
        text: truncateStringByBytes(pageContent, 36000)
      },
    }),
  ]);

  // Map over the documents and add a hash to their metadata
  return docs.map((doc: Document) => {
    return {
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        // Create a hash of the document content
        hash: md5(doc.pageContent)
      },
    };
  });
}

export default seed;



