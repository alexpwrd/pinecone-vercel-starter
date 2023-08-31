/**
 * File: pinecone-vercel-starter/src/app/components/Context/Card.tsx
 * 
 * This file defines the Card component and its properties. The Card component represents a card in the application.
 * Each card contains a markdown content and a unique hash in its metadata. The card's appearance changes based on whether it is selected or not.
 * 
 * The Card component uses the ReactMarkdown library to render the markdown content.
 */

import React, { FC } from "react";
import ReactMarkdown from "react-markdown";

// Define the properties for a card
export interface ICard {
  pageContent: string; // The markdown content of the card
  metadata: {
    hash: string; // The unique hash of the card
  };
}

// Define the properties for the Card component
interface ICardProps {
  card: ICard; // The card to be rendered
  selected: string[] | null; // The list of selected cards
}

// The Card component
export const Card: FC<ICardProps> = ({ card, selected }) => {
  return (
    <div
      id={card.metadata.hash} // Use the card's hash as the id
      className={`card w-full p-5 m-2 text-white ${
        // Change the card's appearance based on whether it is selected or not
        selected && selected.includes(card.metadata.hash)
          ? "bg-gray-600"
          : "bg-gray-800"
      } ${
        selected && selected.includes(card.metadata.hash)
          ? "border-double border-4 border-sky-500"
          : "opacity-60 hover:opacity-80 transition-opacity duration-300 ease-in-out"
      }`}
    >
      <ReactMarkdown>{card.pageContent}</ReactMarkdown> // Render the card's markdown content
      <b className="text-xs">{card.metadata.hash}</b> // Display the card's hash
    </div>
  );
};


