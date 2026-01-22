"use client";

import { Check, ChevronDown, Plus, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DropdownItem {
  id: number;
  title: string;
}

interface MultiSelectDropdownProps {
  items: DropdownItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  maxItems?: number;
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

const MultiSelectDropdown = ({
  items,
  selectedIds,
  onToggle,
  onRemove,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  maxItems = 3,
  hasMore,
  isLoading,
  onLoadMore,
  loadMoreText = "加载更多",
  showCreate,
  createText,
  onCreateClick,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const isMaxReached = selectedIds.length >= maxItems;

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  return (
    <div className="space-y-3">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-foreground-400">
            {selectedIds.length}/{maxItems}
          </span>
          {isMaxReached && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-sm bg-warning-50 text-warning-600 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-warning-500 rounded-full" />
              <span>已达上限</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tag className="h-4 w-4 text-foreground-300" />
              <span className="text-sm">{placeholder}</span>
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
                      onClick={() => onToggle(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground-50">{item.title}</span>
                        {selectedIds.includes(item.id) && (
                          <Check className="h-4 w-4 text-primary-500" />
                        )}
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
                  {isLoading ? "加载中..." : emptyMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-sm"
            >
              {item.title}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="hover:text-primary-900"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
