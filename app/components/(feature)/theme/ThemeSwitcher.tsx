"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const themeOptions = [
    {
      value: "light",
      icon: <Sun className="w-4 h-4" />,
      label: "Light",
    },
    {
      value: "dark",
      icon: <Moon className="w-4 h-4" />,
      label: "Dark",
    },
    {
      value: "system",
      icon: <Monitor className="w-4 h-4" />,
      label: "System",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center bg-background-100/60 backdrop-blur-sm border border-border-50 rounded-sm p-0.5">
        {themeOptions.map((option) => (
          <div
            key={option.value}
            className="w-8 h-8 rounded-sm flex items-center justify-center"
          >
            <div className="text-foreground-300">{option.icon}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center bg-background-100/60 backdrop-blur-sm border border-border-50 rounded-sm p-0.5">
      {themeOptions.map((option, index) => {
        const isActive = theme === option.value;

        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(option.value)}
            title={option.label}
            className={`
              relative w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-200
              ${
                isActive
                  ? "bg-primary-100 text-primary-600"
                  : "text-foreground-300 hover:bg-background-200 hover:text-foreground-200"
              }
            `}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="theme-active-bg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary-100 rounded-sm"
                />
              )}
            </AnimatePresence>

            <motion.div
              className="relative z-10"
              animate={{
                rotate: isActive ? [0, 5, -5, 0] : 0,
                scale: isActive ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {option.icon}
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
