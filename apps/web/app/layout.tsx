import type { ReactNode } from 'react';

import './globals.css';

export const metadata = {
  title: 'Edu Portal',
  description: 'School management portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
