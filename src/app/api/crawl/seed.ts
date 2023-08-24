// File: pinecone-vercel-starter/src/app/api/crawl/seed.ts
// This file contains the seed function which is used to crawl a given URL and index the crawled documents into Pinecone.
import { getEmbeddings } from "@/utils/embeddings";
import { Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { utils as PineconeUtils, Vector } from "@pinecone-database/pinecone";
import md5 from "md5";
import { getPineconeClient } from "@/utils/pinecone";
import { Crawler, Page } from "./crawler";
import { truncateStringByBytes } from "@/utils/truncateString"

const { chunkedUpsert, createIndexIfNotExists } = PineconeUtils

// Interface for seed options. These are settings that can be changed.
interface SeedOptions {
  splittingMethod: string // Method for splitting documents. Can be 'recursive' or 'markdown'.
  chunkSize: number // Size of each chunk when splitting documents.
  chunkOverlap: number // Overlap between chunks when splitting documents.
}

type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter

async function seed(url: string, limit: number, indexName: string, options: SeedOptions) {
  try {
    const pinecone = await getPineconeClient();
    const { splittingMethod, chunkSize, chunkOverlap } = options;
    // The line below creates a new instance of the Crawler class with a maximum depth of 2 and a maximum page limit.
    // If the limit is not provided, it defaults to 10.
    const crawler = new Crawler(0, limit || 10);
    const pages = await crawler.crawl(url) as Page[];
    const splitter: DocumentSplitter = splittingMethod === 'recursive' ?
      new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }) : new MarkdownTextSplitter({});
    const documents = await Promise.all(pages.map(page => prepareDocument(page, splitter)));
    await createIndexIfNotExists(pinecone!, indexName, 1536);
    const index = pinecone && pinecone.Index(indexName);
    const vectors = await Promise.all(documents.flat().map(embedDocument));
    await chunkedUpsert(index!, vectors, '', 10);
    return documents[0];
  } catch (error) {
    console.error("Error seeding:", error);
    throw error;
  }
}

async function embedDocument(doc: Document): Promise<Vector> {
  try {
    const embedding = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embedding,
      metadata: {
        chunk: doc.pageContent,
        text: doc.metadata.text as string,
        url: doc.metadata.url as string,
        hash: doc.metadata.hash as string
      }
    } as Vector;
  } catch (error) {
    console.log("Error embedding document: ", error)
    throw error
  }
}

async function prepareDocument(page: Page, splitter: DocumentSplitter): Promise<Document[]> {
  const pageContent = page.content;
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        url: page.url,
        text: truncateStringByBytes(pageContent, 36000)
      },
    }),
  ]);
  return docs.map((doc: Document) => {
    return {
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        hash: md5(doc.pageContent)
      },
    };
  });
}

export default seed;

