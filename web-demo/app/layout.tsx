import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ONUG Agentic AI Overlay — Security Demo',
  description: 'AI Networking Summit 2026 — Security Vulnerability Live Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-50 overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
