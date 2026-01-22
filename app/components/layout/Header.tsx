"use client";

import { ChevronDown, LogOut, Menu, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import UserAvatar from "@/app/components/ui/avatar/UserAvatar";
import SiteLogo from "@/app/components/ui/logo/SiteLogo";
import { useAuth } from "@/app/hooks/useAuth";
import useSection from "@/app/hooks/useSection";
import type { SectionListResponse } from "@/app/types/sectionServiceType";

const Header = () => {
  const headerT = useTranslations("header");
  const pathname = usePathname();
  const { sections } = useSection();
  const { isAuthenticated, accountLogout, user } = useAuth();
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActiveLink = (slug: string) => pathname === `/${slug}`;

  const isParentSectionActive = (section: SectionListResponse) => {
    if (!section.children?.length) return false;
    const hasDirectChildMatch = section.children.some((child) => pathname === `/${child.slug}`);
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      const hasChildWithMatchingSlug = section.children.some(
        (child) => child.slug === pathSegments[0],
      );
      if (hasChildWithMatchingSlug) return true;
    }
    return hasDirectChildMatch;
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(sectionId) ? newSet.delete(sectionId) : newSet.add(sectionId);
      return newSet;
    });
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownMenuOpen(false);
  }, []);

  // Scroll handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 100) setIsHeaderVisible(true);
          else if (currentScrollY > lastScrollY && currentScrollY > 100) setIsHeaderVisible(false);
          else if (currentScrollY < lastScrollY) setIsHeaderVisible(true);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Nav link styles
  const navLinkClass = (isActive: boolean) =>
    `px-3 py-2 text-base font-semibold transition-colors duration-200 ${isActive ? "text-primary-600 border-b-2 border-primary-600" : "text-foreground-200 hover:text-primary-600"}`;

  const mobileNavLinkClass = (isActive: boolean) =>
    `block px-3 py-3 text-base font-medium transition-[color,background-color,transform] duration-200 rounded-sm hover:scale-[1.02] active:scale-[0.98] ${isActive ? "text-primary-600 bg-primary-50" : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"}`;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isHeaderVisible ? 1 : 0, y: isHeaderVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="backdrop-blur-sm border-b border-border-50 fixed top-0 left-0 right-0 z-50"
    >
      <div className="container lg:max-w-6xl md:max-w-5xl sm:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="shrink-0"
          >
            <SiteLogo />
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center space-x-8"
          >
            {sections?.map((section: SectionListResponse, index: number) => (
              <motion.div
                key={section.section_id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="relative group"
                onMouseEnter={() =>
                  section.children?.length &&
                  setExpandedSections((prev) => new Set(prev).add(section.section_id.toString()))
                }
                onMouseLeave={() =>
                  section.children?.length &&
                  setExpandedSections((prev) => {
                    const s = new Set(prev);
                    s.delete(section.section_id.toString());
                    return s;
                  })
                }
              >
                {section.children?.length ? (
                  <button
                    type="button"
                    onClick={() => toggleSectionExpansion(section.section_id.toString())}
                    className={navLinkClass(isParentSectionActive(section))}
                  >
                    {section.title}
                  </button>
                ) : (
                  <div className="hover:scale-105 active:scale-95 transition-transform duration-200">
                    <Link
                      href={`/${section.slug}`}
                      className={navLinkClass(isActiveLink(section.slug))}
                    >
                      {section.title}
                    </Link>
                  </div>
                )}

                {/* Dropdown */}
                {section.children?.length > 0 && (
                  <AnimatePresence>
                    {expandedSections.has(section.section_id.toString()) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-background-50 rounded-sm shadow-lg border border-border-50 z-10 py-1"
                      >
                        {section.children.map((child: SectionListResponse) => (
                          <Link
                            key={child.section_id}
                            href={`/${child.slug}`}
                            className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActiveLink(child.slug) ? "text-primary-600 bg-primary-50" : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"}`}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            ))}
          </motion.nav>

          {/* Desktop User Menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-4"
          >
            {isAuthenticated ? (
              <nav
                className="relative group"
                onMouseEnter={() => setDropdownMenuOpen(true)}
                onMouseLeave={() => setDropdownMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownMenuOpen(!dropdownMenuOpen)}
                  className="flex items-center space-x-2 text-base font-semibold text-foreground-200 hover:text-primary-600 transition-colors duration-200"
                >
                  <UserAvatar user={user} />
                  <span className="hidden sm:block">{user?.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {dropdownMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-background-50 rounded-sm shadow-lg border border-border-50 py-1 z-50"
                    >
                      <Link
                        href="/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-foreground-200 hover:bg-background-100 hover:text-primary-600"
                        onClick={() => setDropdownMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        {headerT("dashboard")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          accountLogout();
                          setDropdownMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground-200 hover:bg-background-100 hover:text-error-500"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {headerT("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-base font-semibold text-white bg-primary-600 rounded-sm hover:bg-primary-700 transition-colors duration-200"
              >
                {headerT("login")}
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground-200 hover:text-primary-600 transition-colors duration-200"
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Portal */}
      {isMounted &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-60 md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 h-full w-80 bg-background-50 shadow-xl z-70 md:hidden"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border-50">
                      <SiteLogo />
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-foreground-200 hover:text-primary-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-1 p-4">
                        {sections?.map((section: SectionListResponse, index: number) => (
                          <motion.div
                            key={section.section_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                          >
                            {section.children?.length ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleSectionExpansion(section.section_id.toString())
                                  }
                                  className={`flex items-center justify-between w-full ${mobileNavLinkClass(isParentSectionActive(section))}`}
                                >
                                  <span>{section.title}</span>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${expandedSections.has(section.section_id.toString()) ? "rotate-180" : ""}`}
                                  />
                                </button>
                                {expandedSections.has(section.section_id.toString()) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="ml-4 space-y-1 mt-1"
                                  >
                                    {section.children.map((child: SectionListResponse) => (
                                      <Link
                                        key={child.section_id}
                                        href={`/${child.slug}`}
                                        className={`block px-3 py-2 text-sm rounded-sm ${isActiveLink(child.slug) ? "text-primary-600 bg-primary-50" : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {child.title}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </>
                            ) : (
                              <Link
                                href={`/${section.slug}`}
                                className={mobileNavLinkClass(isActiveLink(section.slug))}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {section.title}
                              </Link>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* User Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="border-t border-border-50 p-4"
                      >
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center space-x-3 mb-4">
                              <UserAvatar user={user} size="md" />
                              <div>
                                <p className="text-sm font-medium text-foreground-50">
                                  {user?.username}
                                </p>
                                <p className="text-xs text-foreground-500">{user?.email}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Link
                                href="/dashboard"
                                className="flex items-center px-3 py-3 text-sm text-foreground-200 hover:bg-background-100 hover:text-primary-600 rounded-sm"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Settings className="w-4 h-4 mr-3" />
                                {headerT("dashboard")}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  accountLogout();
                                  setMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-3 text-sm text-foreground-200 hover:bg-background-100 hover:text-error-500 rounded-sm"
                              >
                                <LogOut className="w-4 h-4 mr-3" />
                                {headerT("logout")}
                              </button>
                            </div>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-sm hover:bg-primary-700"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {headerT("login")}
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </motion.header>
  );
};

export default Header;
