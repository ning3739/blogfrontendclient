"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const TOC = () => {
  const contentT = useTranslations("content");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeItem, setActiveItem] = useState<string>("");

  useEffect(() => {
    // 从DOM中提取标题元素
    const extractHeadings = () => {
      const headings: TOCItem[] = [];

      // 查找所有 h1, h2, h3 标题
      const headingElements = document.querySelectorAll("h1[data-id], h2[data-id], h3[data-id]");

      headingElements.forEach((element) => {
        const dataId = element.getAttribute("data-id");
        const text = element.textContent?.trim() || "";
        const tagName = element.tagName.toLowerCase();

        // 将标签名转换为级别 (h1 -> 1, h2 -> 2, h3 -> 3)
        const level = parseInt(tagName.charAt(1), 10);

        if (dataId && text && level >= 1 && level <= 3) {
          headings.push({
            id: dataId,
            text,
            level,
          });
        }
      });

      return headings;
    };

    // 监听滚动事件，更新当前激活的标题
    const handleScroll = () => {
      const headingElements = document.querySelectorAll("h1[data-id], h2[data-id], h3[data-id]");

      let currentActive = "";
      const scrollPosition = window.scrollY + 100; // 提前100px触发

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;

        if (elementTop <= scrollPosition) {
          currentActive = element.getAttribute("data-id") || "";
        }
      });

      setActiveItem(currentActive);
    };

    // 初始提取
    const headings = extractHeadings();
    setTocItems(headings);

    // 监听DOM变化（如果内容动态更新）
    const observer = new MutationObserver(() => {
      const updatedHeadings = extractHeadings();
      setTocItems(updatedHeadings);
    });

    // 观察文档body的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 添加滚动监听
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 初始调用

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-background-50 border border-border-100 rounded-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-transform duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-card-200 group-hover:bg-card-300 transition-colors duration-200">
            <BookOpen className="w-4 h-4 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground-50 group-hover:text-primary-600 transition-colors duration-200">
            {contentT("toc")}
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-1 rounded-sm hover:bg-background-200 transition-colors duration-200"
        >
          <ChevronDown className="w-5 h-5 text-foreground-100 group-hover:text-primary-600 transition-colors duration-200" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.nav
            className="space-y-1 mt-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {tocItems.map((item, index) => {
              const isActive = activeItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  className={`
                    group relative cursor-pointer rounded-lg transition-[background-color,transform] duration-300 ease-out
                    ${
                      item.level === 1
                        ? "py-3 px-4 font-semibold text-foreground-50 text-sm"
                        : item.level === 2
                          ? "py-2.5 px-4 ml-6 font-medium text-foreground-100 text-sm"
                          : "py-2 px-4 ml-10 text-foreground-200 text-xs"
                    }
                    ${isActive ? "bg-primary-50 shadow-sm" : "hover:bg-card-100 hover:shadow-sm"}
                  `}
                  onClick={() => {
                    // 通过 data-id 查找元素并滚动
                    const element = document.querySelector(`[data-id="${item.id}"]`);
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    x: 6,
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 激活状态指示器 */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary-500 to-primary-600 rounded-r-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* 层级指示器 */}
                  <div className="flex items-center gap-3">
                    {/* 层级数字 */}
                    <div
                      className={`
                      shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200
                      ${
                        item.level === 1
                          ? "bg-primary-100 text-primary-700 group-hover:bg-primary-200"
                          : item.level === 2
                            ? "bg-card-200 text-foreground-300 group-hover:bg-card-300"
                            : "bg-card-300 text-foreground-400 group-hover:bg-card-400"
                      }
                      ${isActive ? "bg-primary-200 text-primary-800" : ""}
                    `}
                    >
                      {item.level}
                    </div>

                    {/* 文本内容 */}
                    <span
                      className={`
                      flex-1 transition-colors duration-200 line-clamp-2 leading-relaxed
                      ${
                        isActive ? "text-primary-700 font-semibold" : "group-hover:text-primary-600"
                      }
                    `}
                    >
                      {item.text}
                    </span>

                    {/* 悬停时的箭头指示器 */}
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3 text-primary-500 -rotate-90" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TOC;
