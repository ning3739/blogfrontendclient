"use client";

import { ChevronDown, LogOut, Menu, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  // 确保组件已挂载，避免 hydration 错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActiveLink = (slug: string) => {
    return pathname === `/${slug}`;
  };

  const isParentSectionActive = (section: SectionListResponse) => {
    if (!section.children || section.children.length === 0) {
      return false;
    }

    // 检查直接匹配的子section
    const hasDirectChildMatch = section.children.some(
      (child: SectionListResponse) => pathname === `/${child.slug}`,
    );

    // 检查是否在查看该父级section下的具体文章（二级路由）
    // 例如：/journal/some-article-slug 应该让 journal 父级section显示为活跃状态
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      const firstSegment = pathSegments[0];
      const hasChildWithMatchingSlug = section.children.some(
        (child: SectionListResponse) => child.slug === firstSegment,
      );

      if (hasChildWithMatchingSlug) {
        return true;
      }
    }

    return hasDirectChildMatch;
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // 关闭移动菜单当路由变化时
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownMenuOpen(false);
  }, []);

  // 滚动监听效果（带防抖优化）
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 如果滚动距离小于100px，始终显示header
          if (currentScrollY < 100) {
            setIsHeaderVisible(true);
          } else {
            // 向下滚动时隐藏，向上滚动时显示
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY) {
              setIsHeaderVisible(true);
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isHeaderVisible ? 1 : 0,
        y: isHeaderVisible ? 0 : -100,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="backdrop-blur-sm border-b border-border-50 fixed top-0 left-0 right-0 z-50"
      style={{ opacity: 1, transform: "translateY(0px)" }}
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
            {sections &&
              sections.length > 0 &&
              sections.map((section: SectionListResponse, index: number) => (
                <motion.div
                  key={section.section_id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="relative group"
                  onMouseEnter={() => {
                    if (section.children && section.children.length > 0) {
                      setExpandedSections((prev) =>
                        new Set(prev).add(section.section_id.toString()),
                      );
                    }
                  }}
                  onMouseLeave={() => {
                    if (section.children && section.children.length > 0) {
                      setExpandedSections((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(section.section_id.toString());
                        return newSet;
                      });
                    }
                  }}
                >
                  {section.children && section.children.length > 0 ? (
                    // 有子section的父section，不提供链接，只显示dropdown
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSectionExpansion(section.section_id.toString());
                      }}
                      className={`px-3 py-2 text-base font-semibold transition-[color,transform] duration-200 hover:scale-105 active:scale-95 ${
                        isParentSectionActive(section)
                          ? "text-primary-600 border-b-2 border-primary-600"
                          : "text-foreground-200 hover:text-primary-600"
                      }`}
                    >
                      {section.title}
                    </button>
                  ) : (
                    // 没有子section的section，提供正常链接
                    <div className="hover:scale-105 active:scale-95 transition-transform duration-200">
                      <Link
                        href={`/${section.slug}`}
                        className={`px-3 py-2 text-base font-semibold transition-colors duration-200 ${
                          isActiveLink(section.slug)
                            ? "text-primary-600 border-b-2 border-primary-600"
                            : "text-foreground-200 hover:text-primary-600"
                        }`}
                      >
                        {section.title}
                      </Link>
                    </div>
                  )}

                  {/* Dropdown for children sections */}
                  {section.children && section.children.length > 0 && (
                    <AnimatePresence>
                      {expandedSections.has(section.section_id.toString()) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-background-50 rounded-sm shadow-lg border border-border-50 z-10"
                        >
                          <div className="py-1">
                            {section.children.map((child: SectionListResponse) => (
                              <Link
                                key={child.section_id}
                                href={`/${child.slug}`}
                                className={`block px-4 py-2 text-sm font-medium transition-[color,background-color,transform] duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                  isActiveLink(child.slug)
                                    ? "text-primary-600 bg-primary-50"
                                    : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"
                                }`}
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              ))}
          </motion.nav>

          {/* User Menu / Login - Desktop Only */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-4"
          >
            {isAuthenticated ? (
              <div
                className="relative group hover:scale-[1.02] transition-transform duration-200"
                onMouseEnter={() => setDropdownMenuOpen(true)}
                onMouseLeave={() => setDropdownMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownMenuOpen(!dropdownMenuOpen)}
                  className="flex items-center space-x-2 text-base font-semibold text-foreground-200 hover:text-primary-600 transition-colors duration-200 active:scale-95"
                >
                  {user?.avatar_url && user.avatar_url.trim() !== "" ? (
                    <Image
                      src={user.avatar_url}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border border-border-100"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-border-100">
                      <span className="text-primary-600 text-base font-semibold">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block">{user?.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
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
                        className="flex items-center px-4 py-2 text-sm text-foreground-200 hover:bg-background-100 hover:text-primary-600 transition-colors duration-200"
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
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground-200 hover:bg-background-100 hover:text-error-500 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {headerT("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-base font-semibold text-white bg-primary-600 rounded-sm hover:bg-primary-700 hover:scale-105 active:scale-95 transition-[background-color,transform] duration-200"
              >
                {headerT("login")}
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground-200 hover:text-primary-600 hover:scale-110 active:scale-90 transition-[color,transform] duration-200"
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

      {/* Mobile Navigation Overlay - 使用 Portal 渲染到 body */}
      {isMounted &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-60 md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Mobile Menu Panel */}
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
                        className="p-2 text-foreground-200 hover:text-primary-600 transition-colors duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Navigation Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-1 p-4">
                        {sections &&
                          sections.length > 0 &&
                          sections.map((section: SectionListResponse, index: number) => (
                            <motion.div
                              key={section.section_id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: 0.1 + index * 0.1,
                              }}
                            >
                              {section.children && section.children.length > 0 ? (
                                // 有子section的父section，可点击展开/收起
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleSectionExpansion(section.section_id.toString())
                                  }
                                  className={`flex items-center justify-between w-full px-3 py-3 text-base font-medium transition-[color,background-color,transform] duration-200 rounded-sm hover:scale-[1.02] active:scale-[0.98] ${
                                    isParentSectionActive(section)
                                      ? "text-primary-600 bg-primary-50"
                                      : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"
                                  }`}
                                >
                                  <span>{section.title}</span>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                      expandedSections.has(section.section_id.toString())
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              ) : (
                                // 没有子section的section，提供正常链接
                                <Link
                                  href={`/${section.slug}`}
                                  className={`block px-3 py-3 text-base font-medium transition-[color,background-color,transform] duration-200 rounded-sm hover:scale-[1.02] active:scale-[0.98] ${
                                    isActiveLink(section.slug)
                                      ? "text-primary-600 bg-primary-50"
                                      : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {section.title}
                                </Link>
                              )}

                              {/* 子section展开内容 */}
                              {section.children &&
                                section.children.length > 0 &&
                                expandedSections.has(section.section_id.toString()) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-4 space-y-1 mt-1"
                                  >
                                    {section.children.map((child: SectionListResponse) => (
                                      <Link
                                        key={child.section_id}
                                        href={`/${child.slug}`}
                                        className={`block px-3 py-2 text-sm transition-[color,background-color,transform] duration-200 rounded-sm hover:scale-[1.02] active:scale-[0.98] ${
                                          isActiveLink(child.slug)
                                            ? "text-primary-600 bg-primary-50"
                                            : "text-foreground-200 hover:text-primary-600 hover:bg-background-100"
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {child.title}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                            </motion.div>
                          ))}
                      </div>

                      {/* User Menu Section - 显示在nav items下面 */}
                      {isAuthenticated && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="border-t border-border-50 p-4"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            {user?.avatar_url && user.avatar_url.trim() !== "" ? (
                              <Image
                                src={user.avatar_url}
                                alt="avatar"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover border border-border-100"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border border-border-100">
                                <span className="text-primary-600 text-lg font-medium">
                                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
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
                              className="flex items-center px-3 py-3 text-sm text-foreground-200 hover:bg-background-100 hover:text-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-[color,background-color,transform] duration-200 rounded-sm"
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
                              className="flex items-center w-full px-3 py-3 text-sm text-foreground-200 hover:bg-background-100 hover:text-error-500 hover:scale-[1.02] active:scale-[0.98] transition-[color,background-color,transform] duration-200 rounded-sm"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              {headerT("logout")}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Login Button for non-authenticated users */}
                      {!isAuthenticated && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="border-t border-border-50 p-4"
                        >
                          <Link
                            href="/login"
                            className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-sm hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-[background-color,transform] duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {headerT("login")}
                          </Link>
                        </motion.div>
                      )}
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
