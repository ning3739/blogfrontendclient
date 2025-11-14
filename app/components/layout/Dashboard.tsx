"use client";

import React, { useState } from "react";
import { PanelLeft } from "lucide-react";
import { motion } from "motion/react";
import SideBar from "@/app/components/layout/SideBar";

export default function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-50">
      {/* Desktop Sidebar - No fixed width container */}
      <div className="hidden lg:block">
        <SideBar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar - Slide-in from left */}
      <div className="lg:hidden">
        <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Dashboard content */}
      <div className="flex-1">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden sticky top-0 z-30 bg-background-50 border-b border-border-50 px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-foreground-200 hover:text-primary-600 transition-colors"
          >
            <PanelLeft className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Main Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
