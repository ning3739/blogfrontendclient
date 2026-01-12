"use client";

import { Calendar, Heart, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../(feature)/langauge/LanguageSwitcher";
import ThemeSwitcher from "../(feature)/theme/ThemeSwitcher";
import SiteLogo from "../ui/logo/SiteLogo";

const Footer = () => {
  const footerT = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: footerT("about"),
      links: [
        { name: footerT("copyright"), href: "/copyright" },
        { name: footerT("privacyPolicy"), href: "/privacy-policy" },
        { name: footerT("siteMap"), href: "/sitemap.xml" },
      ],
    },
    {
      title: footerT("content"),
      links: [
        { name: footerT("tags"), href: "/tag" },
        { name: footerT("archive"), href: "/archive" },
      ],
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="backdrop-blur-sm border-t border-border-50 mt-auto"
    >
      <div className="container lg:max-w-6xl md:max-w-5xl sm:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:border-x lg:border-border-50">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="col-span-2 sm:col-span-2 lg:col-span-2"
            >
              <div>
                <Link href="/" className="inline-block mb-4">
                  <SiteLogo asChild />
                </Link>
              </div>
              <p className="text-foreground-300 mb-4 sm:mb-6 max-w-md leading-relaxed text-sm sm:text-base">
                {footerT("description")}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground-200">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{footerT("china")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground-200">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{footerT("since")}</span>
                </div>
              </div>
            </motion.div>

            {/* Navigation Links */}
            {footerLinks.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-foreground-50 mb-3 sm:mb-4 text-sm sm:text-base">
                  {section.title}
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.3 + sectionIndex * 0.1 + linkIndex * 0.05,
                      }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className="text-foreground-300 hover:text-primary-600 transition-colors text-xs sm:text-sm relative group"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-[width] duration-300" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-border-50 py-4 sm:py-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-foreground-200">
              <span>© {currentYear} 小李生活志 | Heyxiaoli.</span>
              <span className="hidden sm:inline">Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="hidden sm:inline"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
              </motion.div>
              <span className="hidden sm:inline">in China</span>
            </div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <ThemeSwitcher />
              <LanguageSwitcher />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
