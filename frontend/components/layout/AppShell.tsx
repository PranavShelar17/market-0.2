"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <main className="flex-1 w-full overflow-y-auto bg-[#F7F4EE]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-row min-h-[calc(100vh-4.5rem)] bg-[#F7F4EE] w-full">
      {/* Fixed/Sticky Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};
