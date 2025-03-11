"use client";
import "./globals.css";
import { QuillProvider } from "@quillsql/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <QuillProvider
          publicKey={process.env.NEXT_PUBLIC_QUILL_PUBLIC_KEY!}
          tenants={["d08218d5-5ce3-4e2d-af6a-05e130e62730"]}
          // queryEndpoint="http://localhost:3001/quill"
          // queryHeaders={{}}
        >
          {children}
        </QuillProvider>
      </body>
    </html>
  );
}
