import { IUrlEntry } from "./UrlButton";
import { ICard } from "./Card";
import { TokenLimitSplitter } from "@/utils/TokenLimitSplitter"; // New import
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'; // Added import
import logger from "../../utils/logger"; // Added logger import

export async function crawlDocument(
  url: string,
  setEntries: React.Dispatch<React.SetStateAction<IUrlEntry[]>>,
  setCards: React.Dispatch<React.SetStateAction<ICard[]>>,
  splittingMethod: string,
  chunkSize: number,
  overlap: number
): Promise<void> {
  logger.info('Starting crawlDocument function'); // Added log
  setEntries((seeded: IUrlEntry[]) =>
    seeded.map((seed: IUrlEntry) =>
      seed.url === url ? { ...seed, loading: true } : seed
    )
  );

  // New code: Create the appropriate splitter based on the splitting method
  let splitter;
  const chunkOverlap = overlap; // Added initializer for chunkOverlap
  switch (splittingMethod) {
    case 'recursive':
      splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
      break;
    case 'markdown':
      splitter = new MarkdownTextSplitter({});
      break;
    case 'token':
      splitter = new TokenLimitSplitter(chunkSize); // New case
      break;
    default:
      throw new Error(`Unsupported splitting method: ${splittingMethod}`);
  }
  logger.info(`Splitter created: ${splitter}`); // Added log

  const response = await fetch("/api/crawl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      options: {
        splittingMethod,
        chunkSize,
        overlap,
      },
    }),
  });
  logger.info('Fetch request sent'); // Added log

  const { documents } = await response.json();
  logger.info('Response received and parsed'); // Added log

  setCards(documents);

  setEntries((prevEntries: IUrlEntry[]) =>
    prevEntries.map((entry: IUrlEntry) =>
      entry.url === url ? { ...entry, seeded: true, loading: false } : entry
    )
  );
  logger.info('Entries updated'); // Added log
}

export async function clearIndex(
  setEntries: React.Dispatch<React.SetStateAction<IUrlEntry[]>>,
  setCards: React.Dispatch<React.SetStateAction<ICard[]>>
) {
  logger.info('Starting clearIndex function'); // Added log
  const response = await fetch("/api/clearIndex", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  logger.info('Fetch request sent'); // Added log

  if (response.ok) {
    setEntries((prevEntries: IUrlEntry[]) =>
      prevEntries.map((entry: IUrlEntry) => ({
        ...entry,
        seeded: false,
        loading: false,
      }))
    );
    setCards([]);
    logger.info('Entries and cards cleared'); // Added log
  }
}
