"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Image src="/globe.svg" alt="CloudSpy" width={64} height={64} className="mb-6 drop-shadow-lg" />
      <h1 className="text-5xl font-extrabold text-amber-700 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link href="/">
        <button className="bg-amber-600 text-white px-6 py-2 rounded-lg shadow hover:bg-amber-700 transition text-lg font-semibold">
          Go to Home
        </button>
      </Link>
    </div>
  );
}
