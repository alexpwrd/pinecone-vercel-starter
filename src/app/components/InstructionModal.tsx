// File path: pinecone-vercel-starter/src/app/components/InstructionModal.tsx
// This file defines the InstructionModal component. This component is a modal that displays instructions to the user.

// Importing necessary libraries and icons
import React from "react";
import { AiFillGithub } from "react-icons/ai";

// Defining the properties for the InstructionModal component
interface InstructionModalProps {
  isOpen: boolean; // Determines if the modal is open or not
  onClose: () => void; // Function to close the modal
}

// Defining the InstructionModal component
const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
}) => {
  // If the modal is not open, return null
  if (!isOpen) return null;

  // If the modal is open, return the following JSX
  return (
    // A div that covers the entire screen
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      // A div that contains the actual modal content
      <div className="bg-gray-300 p-5 z-50 rounded-lg shadow-lg relative w-8/12 md:w-5/12">
        // A button that closes the modal when clicked
        <button
          onClick={onClose}
          className="absolute right-2 text-3xl top-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        // The title of the modal
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        // The instructions text
        <p>
          This chatbot demonstrates a simple RAG pattern using{" "}
          <a href="https://pinecone.io" target="_blank" className="text-gray">
            Pinecone
          </a>{" "}
          and Vercel&apos;s AI SDK. In the context panel on the right, you can
          see some articles you can index in Pinecone (on mobile, open the
          context panel by clicking the button at the top left of the message
          panel). Click on the blue link icons to open the URLs in a new window.
        </p>
        <br />
        <p>
          After you index them, you can ask the chatbot questions about the
          specific of each article. The segments relevant to the answers the
          chatbot gives will be highlighted.
        </p>
        <br />
        <p>
          You can clear the index by clicking the &quot;Clear Index&quot; button
          in the context panel.
        </p>
      </div>
      // A div that darkens the rest of the screen when the modal is open
      <div
        className="absolute inset-0 bg-black z-20 opacity-50"
        onClick={onClose}
      ></div>
    </div>
  );
};

// Exporting the InstructionModal component
export default InstructionModal;

