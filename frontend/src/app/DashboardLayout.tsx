import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Top Navigation Bar using shadcn NavigationMenu */}
      <nav className="bg-white shadow-sm px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-4 no-underline">
          <Image src="/globe.svg" alt="CloudSpy" width={40} height={40} />
            <span className="text-2xl font-extrabold text-amber-700 tracking-tight">CloudSpy</span>
          </Link>
          <NavigationMenu className="bg-gray-100 rounded-lg px-2 py-1">
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-semibold text-gray-700 hover:text-indigo-700"
                  >
                    <span className="text-xl">📊</span> Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/aws"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-100 transition font-semibold text-gray-700 hover:text-orange-700"
                  >
                    <span className="text-xl">☁️</span> AWS
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/azure"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-semibold text-gray-700 hover:text-blue-700"
                  >
                    <span className="text-xl">🔷</span> Azure
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/gcp"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-100 transition font-semibold text-gray-700 hover:text-green-700"
                  >
                    <span className="text-xl">🌐</span> GCP
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      {/* Main Content in shadcn Card */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 bg-transparent">
        <Card className="w-full max-w-5xl mx-auto p-8 rounded-2xl shadow-lg border border-gray-100">
          {children}
        </Card>
      </main>
      {/* Footer */}
      <footer className="bg-white text-xs text-gray-400 text-center py-6 mt-8 border-t shadow-sm">
        <span>
          🔐 Privacy first &nbsp;|&nbsp; 🌐 Cloud-agnostic &nbsp;|&nbsp; ⚡ Fast, clean, actionable UI
        </span>
      </footer>
    </div>
  );
}
