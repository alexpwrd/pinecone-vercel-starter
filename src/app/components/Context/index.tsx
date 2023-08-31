/**
 * File: pinecone-vercel-starter/src/app/components/Context/index.tsx
 * 
 * This file defines the Context component which is a functional component in React.
 * It manages the state and behavior of the application, including the entries and cards,
 * the splitting method, chunk size, overlap, and the scroll behavior to the selected card.
 * It also defines the DropdownLabel component and the buttons for each entry.
 * 
 * The Context component returns a div element that contains the buttons, the Clear Index button,
 * and the controls for the splitting method, chunk size, and overlap.
 */
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { urls } from "./urls";
import UrlButton from "./UrlButton";
import { Card, ICard } from "./Card";
import { clearIndex, crawlDocument } from "./utils";

import { Button } from "./Button";
// Define the properties for the Context component
interface ContextProps {
  className: string;
  selected: string[] | null;
}

// Define the Context component
export const Context: React.FC<ContextProps> = ({ className, selected }) => {
  // State for the entries and cards
  const [entries, setEntries] = useState(urls);
  const [cards, setCards] = useState<ICard[]>([]);

  // New state variable for the inputted URL
  const [inputUrl, setInputUrl] = useState('');

  // State for the splitting method, chunk size, and overlap
  const [splittingMethod, setSplittingMethod] = useState("markdown");
  const [chunkSize, setChunkSize] = useState(256);
  const [overlap, setOverlap] = useState(1);

  // Scroll to the selected card
useEffect(() => {
  const element = selected && document.getElementById(selected[0]);
  element?.scrollIntoView({ behavior: "smooth" });
}, [selected]);

  // Define the DropdownLabel component
  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-white p-2 font-bold">
      {children}
    </label>
  );

  // Create the buttons for each entry
  const buttons = entries.map((entry, key) => (
    <div className="" key={`${key}-${entry.loading}`}>
      <UrlButton
        entry={entry}
        onClick={() =>
          crawlDocument(
            entry.url,
            setEntries,
            setCards,
            splittingMethod,
            chunkSize,
            overlap
          )
        }
      />
    </div>
  ));

  // Return the Context component
  return (
    <div
      className={`flex flex-col border-2 overflow-y-auto rounded-lg border-gray-500 w-full ${className}`}
    >
      <div className="flex flex-col items-start sticky top-0 w-full">
        <div className="flex flex-col items-start lg:flex-row w-full lg:flex-wrap p-2">
          {buttons}
        </div>
        <div className="flex-grow w-full px-4">
          <Button
            className="w-full my-2 uppercase active:scale-[98%] transition-transform duration-100"
            style={{
              backgroundColor: "#4f6574",
              color: "white",
            }}
            onClick={() => clearIndex(setEntries, setCards)}
          >
            Clear Index
          </Button>
        </div>
        <div className="flex p-2"></div>
        <div className="text-left w-full flex flex-col rounded-b-lg bg-gray-600 p-3 subpixel-antialiased">
          <DropdownLabel htmlFor="splittingMethod">
            Splitting Method:
          </DropdownLabel>
          <div className="relative w-full">
            <select
              id="splittingMethod"
              value={splittingMethod}
              className="p-2 bg-gray-700 rounded text-white w-full appearance-none hover:cursor-pointer"
              onChange={(e) => setSplittingMethod(e.target.value)}
            >
              <option value="recursive">Recursive Text Splitting</option>
              <option value="markdown">Markdown Splitting</option>
              <option value="token">Token Splitting</option> {/* New option */}
            </select>
          </div>
          {splittingMethod === "recursive" && (
            <div className="my-4 flex flex-col">
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="chunkSize">
                  Chunk Size: {chunkSize}
                </DropdownLabel>
                <input
                  className="p-2 bg-gray-700"
                  type="range"
                  id="chunkSize"
                  min={1}
                  max={2048}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="overlap">
                  Overlap: {overlap}
                </DropdownLabel>
                <input
                  className="p-2 bg-gray-700"
                  type="range"
                  id="overlap"
                  min={1}
                  max={200}
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap w-full">
        {cards &&
          cards.map((card, key) => (
            <Card key={key} card={card} selected={selected} />
          ))}
      </div>
      <div className="flex items-center justify-center my-4">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL"
          className="p-2 flex-grow mr-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={() =>
            crawlDocument(
              inputUrl,
              setEntries,
              setCards,
              splittingMethod,
              chunkSize,
              overlap
            )
          }
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Vectorize URL
        </button>
      </div>
    </div>
  );
};
