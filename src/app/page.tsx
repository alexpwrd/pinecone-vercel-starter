/**
 * File: pinecone-vercel-starter/src/app/page.tsx
 * 
 * This file is the main page of the application. It handles the state and effects for the chat interface,
 * including the messages, input, and context. It also manages the submission of messages and the retrieval
 * of context from the server. The page layout and components such as the header, chat interface, and context
 * panel are also defined here.
 */

"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";
import InstructionModal from "./components/InstructionModal";

// Main page component
const Page: React.FC = () => {
  // State variables for messages, context, and modal
  const [gotMessages, setGotMessages] = useState(false);
  const [context, setContext] = useState<string[] | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Chat hooks for handling messages and input
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: async () => {
      setGotMessages(true);
    },
  });

  // Reference to the previous length of messages
  const prevMessagesLengthRef = useRef(messages.length);

  // Function to handle the submission of a message
  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setContext(null);
    setGotMessages(false);
  };

  // Effect to get the context from the server when new messages are received
  useEffect(() => {
    const getContext = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages,
        }),
      });
      const { context } = await response.json();
      setContext(context.map((c: any) => c.id));
    };
    if (gotMessages && messages.length >= prevMessagesLengthRef.current) {
      getContext();
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, gotMessages]);

  // Render the page layout and components
  return (
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />

      <InstructionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
         <div className="flex w-full flex-grow overflow-hidden relative">
        <Chat
          input={input}
          handleInputChange={handleInputChange}
          handleMessageSubmit={handleMessageSubmit}
          messages={messages}
        />
        <div className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-gray-700 overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5 lg:mx-2 rounded-lg">
          <Context className="" selected={context} />
        </div>
        <button
          type="button"
          className="absolute left-20 transform -translate-x-12 bg-gray-800 text-white rounded-l py-2 px-4 lg:hidden"
          onClick={(e) => {
            e.currentTarget.parentElement
              ?.querySelector(".transform")
              ?.classList.toggle("translate-x-full");
          }}
        >
          ☰
        </button>
      </div>
    </div>
  );
};

// Export the page component
export default Page;

