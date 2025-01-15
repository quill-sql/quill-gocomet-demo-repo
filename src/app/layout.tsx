'use client';
import "./globals.css";
import { QuillProvider } from "@quillsql/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <QuillProvider
        publicKey={process.env.NEXT_PUBLIC_QUILL_PUBLIC_KEY!}
        queryEndpoint="http://localhost:3001/quill"
        queryHeaders={{}}
      >
        <body
          className={`antialiased`}
        >
          {children}
        </body>
      </QuillProvider>
    </html>
  );
}
