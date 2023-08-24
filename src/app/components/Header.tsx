// File Path: pinecone-vercel-starter/src/app/components/Header.tsx
// This file defines the Header component of the application. It imports the PWRD AI image and displays it in the header.
// The header is styled with tailwind CSS classes and the className prop is used to allow additional styles to be passed in.

import Image from "next/image";
import PWRDAIlogo from "../../../public/pwrdai-logo1.png";

export default function Header({ className }: { className?: string }) {
  return (
    <header
      className={`flex items-center justify-center text-gray-200 text-2xl ${className}`}
    >
      <Image
        src={PWRDAIlogo}
        alt="pinecone-logo"
        width="230"
        height="50"
        className="ml-3"
      />
    </header>
  );
}



