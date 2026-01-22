"use client";

import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DropdownItem {
  id: number;
  title: string;
  description?: string;
  extra?: string;
}

interface SearchableDropdownProps {
  items: DropdownItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  icon?: React.ReactNode;
  // Load more
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  loadMoreText?: string;
  // Create new
  showCreate?: boolean;
  createText?: string;
  onCreateClick?: () => void;
}

const SearchableDropdown = ({
  items,
  selectedId,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  icon,
  hasMore,
  isLoading,
  onLoadMore,
  loadMoreText = "加载更多",
  showCreate,
  createText,
  onCreateClick,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.extra?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (id: number) => {
    onSelect(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon || <Search className="h-4 w-4 text-foreground-300" />}
            <span className="text-sm">{selectedItem?.title || placeholder}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-foreground-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card-50 border border-border-100 rounded-sm shadow-lg max-h-80 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-3 border-b border-border-100 bg-card-100 shrink-0">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-50 border border-border-100 rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Create new option */}
            {showCreate && onCreateClick && (
              <button
                type="button"
                className="w-full px-4 py-3 border-b border-border-100 cursor-pointer hover:bg-primary-50 text-left"
                onClick={() => {
                  onCreateClick();
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-primary-600 font-medium">{createText}</span>
                </div>
              </button>
            )}

            {/* Items list */}
            {filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 text-left"
                    onClick={() => handleSelect(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground-50">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-foreground-300 mt-1">{item.description}</div>
                        )}
                        {item.extra && (
                          <div className="text-xs text-foreground-400 mt-1">{item.extra}</div>
                        )}
                      </div>
                      {selectedId === item.id && <Check className="h-4 w-4 text-primary-500" />}
                    </div>
                  </button>
                ))}

                {/* Load more button */}
                {hasMore && onLoadMore && (
                  <button
                    type="button"
                    className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 border-t border-border-100 text-left"
                    onClick={onLoadMore}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-primary-600">
                          {isLoading ? "加载中..." : loadMoreText}
                        </div>
                        <div className="text-xs text-foreground-400 mt-1">点击加载更多选项</div>
                      </div>
                      <div className="h-4 w-4 text-primary-500">
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="px-3 py-4 text-sm text-foreground-300 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
