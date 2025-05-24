import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Das Board | Dealership Management Solution',
  description: 'A comprehensive management solution for auto dealerships',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-8 md:mb-0">
                <h2 className="text-xl font-bold mb-4">Das Board</h2>
                <p className="text-gray-300">
                  A comprehensive management solution for auto dealerships
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/screenshots" className="text-gray-300 hover:text-white">
                        Screenshots
                      </a>
                    </li>
                    <li>
                      <a href="/pricing" className="text-gray-300 hover:text-white">
                        Pricing
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Company</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/about-us" className="text-gray-300 hover:text-white">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="/legal" className="text-gray-300 hover:text-white">
                        Legal
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/signup" className="text-gray-300 hover:text-white">
                        Sign Up
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://app.thedasboard.com"
                        className="text-gray-300 hover:text-white"
                      >
                        Login
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-gray-300 text-sm text-center">
              <p>&copy; {new Date().getFullYear()} Das Board. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
