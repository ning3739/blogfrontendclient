"use client";

import clsx from "clsx";
import { LogOut, PanelLeft, PanelRight, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import SiteLogo from "@/app/components/ui/logo/SiteLogo";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import { type MenuItem, useSidebarRoutes } from "@/app/contexts/hooks/useSidebarRoutes";

interface SideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// --- Components ---
interface SidebarItemProps {
  item: MenuItem;
  index: number;
  isCollapsed: boolean;
  onClick: (path: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, index, isCollapsed, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      onClick={() => onClick(item.path)}
      className={clsx(
        "group flex items-center cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isCollapsed ? "justify-center py-4 mx-1" : "px-4 py-3 mx-2 space-x-3",
        item.active
          ? "bg-primary-50 text-primary-600 border-l-4 border-primary-500 rounded-sm font-semibold"
          : "hover:bg-background-100 text-foreground-200 hover:text-foreground-50 rounded-lg",
      )}
    >
      <item.icon
        className={clsx(
          "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isCollapsed ? "w-5 h-5" : "w-5 h-5",
          item.active
            ? "text-primary-600 scale-105"
            : "text-foreground-300 group-hover:text-foreground-50 group-hover:scale-102",
        )}
      />
      {!isCollapsed && (
        <span
          className={clsx(
            "text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            item.active ? "font-semibold scale-102" : "font-medium",
          )}
        >
          {item.label}
        </span>
      )}
    </motion.div>
  );
};

const SideBar: React.FC<SideBarProps> = ({ isOpen = true, onClose }) => {
  const { user, accountLogout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const menuItems = useSidebarRoutes();

  const handleMenuClick = (path: string) => {
    router.push(path);
    // Close mobile sidebar after navigation
    if (onClose) {
      onClose();
    }
  };

  const renderMenuItems = () => (
    <nav className="space-y-1">
      {menuItems.map((item, index) => (
        <SidebarItem
          key={item.label}
          item={item}
          index={index}
          isCollapsed={isCollapsed}
          onClick={handleMenuClick}
        />
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on larger screens */}
      <aside
        className={clsx(
          "hidden lg:block h-screen sticky top-0 bg-card-50 border-r border-border-50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Title & Collapse Button */}
          <div className="py-6 px-4 border-b border-border-50 flex items-center justify-between">
            {!isCollapsed && <SiteLogo size="lg" />}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-foreground-300 hover:text-foreground-100 transition-colors duration-200"
            >
              {isCollapsed ? <PanelRight className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6">{renderMenuItems()}</div>

          {/* User Info & Logout */}
          <div
            className={clsx(
              "border-t border-border-50 bg-background-100",
              isCollapsed ? "p-2" : "p-4",
            )}
          >
            <div
              className={clsx(
                "flex hover:bg-background-200 rounded-lg cursor-pointer transition-all duration-200 group",
                isCollapsed ? "justify-center p-3" : "items-center space-x-3 p-3",
              )}
            >
              {!isCollapsed && (
                <div className="w-10 h-10 bg-background-200 rounded-full flex items-center justify-center">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground-50 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-foreground-400 truncate">{user?.email}</p>
                </div>
              )}
              <LogOut
                className={clsx(
                  "text-foreground-400 hover:text-error-500 transition-colors duration-200 cursor-pointer",
                  isCollapsed ? "w-7 h-7" : "w-5 h-5",
                )}
                onClick={accountLogout}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide-in from left */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Mobile Sidebar Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-card-50 z-50 lg:hidden overflow-y-auto"
          >
            <div className="h-full flex flex-col">
              {/* Close Button & Logo */}
              <div className="flex justify-between items-center py-6 px-4 border-b border-border-50">
                <div>
                  <SiteLogo size="md" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-foreground-200 hover:text-foreground-100 transition-colors rounded-lg hover:bg-background-100"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Navigation */}
              <div className="flex-1 py-6">{renderMenuItems()}</div>

              {/* User Info & Logout */}
              <div className="border-t border-border-50 p-4 bg-background-100">
                <div className="flex items-center space-x-3 p-3 hover:bg-background-100 rounded-lg cursor-pointer transition-all duration-200 group">
                  <div className="w-10 h-10 bg-background-200 rounded-full flex items-center justify-center">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground-50 truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-foreground-400 truncate">{user?.email}</p>
                  </div>
                  <LogOut
                    className="w-4 h-4 text-foreground-400 hover:text-error-500 transition-colors duration-200 cursor-pointer"
                    onClick={accountLogout}
                  />
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
};

export default SideBar;
