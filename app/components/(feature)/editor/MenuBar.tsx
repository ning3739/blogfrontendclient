import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Code2,
  FileAudio,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
  Unlink,
  Video,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const VideoPickerModal = dynamic(() => import("./VideoPickerModal"), { ssr: false });
const ImagePickerModal = dynamic(() => import("./ImagePickerModal"), { ssr: false });
const AudioPickerModal = dynamic(() => import("./AudioPickerModal"), { ssr: false });

interface MenuBarProps {
  editor: Editor;
}

const SUPPORTED_LANGUAGES = [
  { value: "plaintext", label: "纯文本" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
];

// Toolbar button component
const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-sm transition-colors ${
      disabled
        ? "text-foreground-400 opacity-50 cursor-not-allowed"
        : isActive
          ? "bg-primary-50 text-primary-600"
          : "text-foreground-300 hover:bg-background-100 hover:text-foreground-50"
    }`}
    title={title}
  >
    {children}
  </button>
);

// Button group wrapper
const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">{children}</div>
);

export default function MenuBar({ editor }: MenuBarProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionType, setCaptionType] = useState<"image" | "video" | "audio" | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
        setShowLanguageSelector(false);
      }
    };
    if (isLanguageDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLanguageDropdownOpen]);

  if (!editor) return null;

  // Media handlers
  const insertMedia = (type: "video" | "image" | "audio", url: string) => {
    const chain = editor.chain().focus();
    if (type === "video") {
      chain
        .setVideo({ src: url, controls: true, width: "100%", height: "auto", autoplay: false })
        .run();
    } else if (type === "image") {
      chain.setImage({ src: url, alt: "Image", title: "Image" }).run();
    } else {
      chain.setAudio({ src: url, controls: true, autoplay: false }).run();
    }
    // Select inserted node
    setTimeout(() => {
      const { doc, selection } = editor.state;
      const pos = selection.from - 1;
      if (pos >= 0 && doc.nodeAt(pos)?.type.name === type) {
        editor.chain().setNodeSelection(pos).run();
      }
    }, 50);
  };

  // Code block helpers
  const getCurrentCodeBlockLanguage = () => {
    const { $from } = editor.state.selection;
    let node = $from.node();
    let depth = $from.depth;
    while (depth >= 0) {
      if (node.type.name === "codeBlock") return node.attrs.language || "plaintext";
      depth--;
      node = $from.node(depth);
    }
    return "plaintext";
  };

  const handleCodeBlockClick = () => {
    if (editor.isActive("codeBlock")) {
      editor.chain().focus().toggleCodeBlock().run();
      setShowLanguageSelector(false);
    } else {
      setShowLanguageSelector(true);
      setIsLanguageDropdownOpen(true);
    }
  };

  const setCodeBlockLanguage = (language: string) => {
    if (editor.isActive("codeBlock")) {
      editor.chain().focus().updateAttributes("codeBlock", { language }).run();
    } else {
      editor.chain().focus().toggleCodeBlock().updateAttributes("codeBlock", { language }).run();
    }
    setIsLanguageDropdownOpen(false);
    setShowLanguageSelector(false);
  };

  // Caption handlers
  const getActiveMediaType = (): "image" | "video" | "audio" | null => {
    if (editor.isActive("image")) return "image";
    if (editor.isActive("video")) return "video";
    if (editor.isActive("audio")) return "audio";
    return null;
  };

  const handleCaptionClick = () => {
    const type = getActiveMediaType();
    if (type) {
      setCaptionText(editor.getAttributes(type).caption || "");
      setCaptionType(type);
      setShowCaptionInput(true);
      setTimeout(() => captionInputRef.current?.focus(), 0);
    }
  };

  const handleCaptionSubmit = () => {
    if (captionType && editor.isActive(captionType)) {
      editor
        .chain()
        .focus()
        .updateAttributes(captionType, { caption: captionText || null })
        .run();
    }
    setShowCaptionInput(false);
    setCaptionText("");
    setCaptionType(null);
  };

  // Link handlers
  const handleLinkClick = () => {
    setLinkUrl(editor.isActive("link") ? editor.getAttributes("link").href || "" : "");
    setShowLinkInput(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 0);
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, onSubmit: () => void, onCancel: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    } else if (e.key === "Escape") onCancel();
  };

  const activeMediaType = getActiveMediaType();
  const hasCaption = activeMediaType && editor.getAttributes(activeMediaType).caption;

  return (
    <div className="border-b border-border-50 p-3 sm:p-4 flex flex-wrap gap-2 bg-card-50">
      {/* Text formatting */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="粗体"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="斜体"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="下划线"
        >
          <Underline size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="行内代码"
        >
          <Code size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleCodeBlockClick}
          isActive={editor.isActive("codeBlock")}
          title="代码块"
        >
          <Code2 size={18} />
        </ToolbarButton>

        {/* Language selector */}
        {(editor.isActive("codeBlock") || showLanguageSelector) && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="p-2 rounded-sm transition-colors text-foreground-300 hover:bg-background-100 hover:text-foreground-50 flex items-center gap-1"
              title="选择语言"
            >
              <span className="text-sm font-mono">
                {editor.isActive("codeBlock")
                  ? SUPPORTED_LANGUAGES.find((l) => l.value === getCurrentCodeBlockLanguage())
                      ?.label || "纯文本"
                  : "选择语言"}
              </span>
              <ChevronDown size={14} />
            </button>
            {isLanguageDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card-50 border border-border-100 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto min-w-[120px]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    type="button"
                    key={lang.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setCodeBlockLanguage(lang.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-background-100 transition-colors ${
                      editor.isActive("codeBlock") && getCurrentCodeBlockLanguage() === lang.value
                        ? "bg-primary-50 text-primary-600"
                        : "text-foreground-200"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </ButtonGroup>

      {/* Headings */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="标题 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="标题 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="标题 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>
      </ButtonGroup>

      {/* Lists */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote size={18} />
        </ToolbarButton>
      </ButtonGroup>

      {/* Links */}
      <ButtonGroup>
        {showLinkInput ? (
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, handleLinkSubmit, () => {
                setShowLinkInput(false);
                setLinkUrl("");
              })
            }
            onBlur={handleLinkSubmit}
            placeholder="输入链接 URL..."
            className="px-2 py-1 text-sm border border-border-100 rounded-sm bg-card-50 text-foreground-200 focus:outline-none focus:border-primary-500 min-w-[200px]"
          />
        ) : (
          <>
            <ToolbarButton
              onClick={handleLinkClick}
              isActive={editor.isActive("link")}
              title="添加链接"
            >
              <Link size={18} />
            </ToolbarButton>
            {editor.isActive("link") && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="移除链接"
              >
                <Unlink size={18} />
              </ToolbarButton>
            )}
          </>
        )}
      </ButtonGroup>

      {/* Alignment */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="左对齐"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="居中"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="右对齐"
        >
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="两端对齐"
        >
          <AlignJustify size={18} />
        </ToolbarButton>
      </ButtonGroup>

      {/* Media caption */}
      {activeMediaType && (
        <ButtonGroup>
          {showCaptionInput && captionType === activeMediaType ? (
            <input
              ref={captionInputRef}
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, handleCaptionSubmit, () => {
                  setShowCaptionInput(false);
                  setCaptionText("");
                  setCaptionType(null);
                })
              }
              onBlur={handleCaptionSubmit}
              placeholder={`输入${activeMediaType === "image" ? "图片" : activeMediaType === "video" ? "视频" : "音频"}说明...`}
              className="px-2 py-1 text-sm border border-border-100 rounded-sm bg-card-50 text-foreground-200 focus:outline-none focus:border-primary-500 min-w-[200px]"
            />
          ) : (
            <ToolbarButton
              onClick={handleCaptionClick}
              isActive={!!hasCaption}
              title={`添加${activeMediaType === "image" ? "图片" : activeMediaType === "video" ? "视频" : "音频"}说明`}
            >
              <FileText size={18} />
            </ToolbarButton>
          )}
        </ButtonGroup>
      )}

      {/* Media */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => setIsVideoModalOpen(true)}
          isActive={editor.isActive("video")}
          title="视频"
        >
          <Video size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setIsImageModalOpen(true)}
          isActive={editor.isActive("image")}
          title="图片"
        >
          <Image size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setIsAudioModalOpen(true)}
          isActive={editor.isActive("audio")}
          title="音频"
        >
          <FileAudio size={18} />
        </ToolbarButton>
      </ButtonGroup>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="撤销">
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="重做">
          <Redo size={18} />
        </ToolbarButton>
      </div>

      {/* Modals */}
      <VideoPickerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelect={(_, url) => insertMedia("video", url)}
      />
      <ImagePickerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={(_, url) => insertMedia("image", url)}
      />
      <AudioPickerModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSelect={(_, url) => insertMedia("audio", url)}
      />
    </div>
  );
}
