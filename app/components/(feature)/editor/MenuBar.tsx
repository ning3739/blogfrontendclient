import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Video,
  Image,
  FileAudio,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  FileText,
  Link,
  Unlink,
} from "lucide-react";

import VideoPickerModal from "./VideoPickerModal";
import ImagePickerModal from "./ImagePickerModal";
import AudioPickerModal from "./AudioPickerModal";

interface MenuBarProps {
  editor: Editor;
}

// 支持的语言列表
const supportedLanguages = [
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

export default function MenuBar({ editor }: MenuBarProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionType, setCaptionType] = useState<
    "image" | "video" | "audio" | null
  >(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
        setShowLanguageSelector(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  if (!editor) {
    return null;
  }

  const handleVideoSelect = (mediaId: number, url: string) => {
    editor
      .chain()
      .focus()
      .setVideo({
        src: url,
        controls: true,
        width: "100%",
        height: "auto",
        autoplay: false,
      })
      .run();

    // 插入后延迟选中视频节点，确保可以进行对齐操作
    setTimeout(() => {
      const { state } = editor;
      const { doc, selection } = state;
      const { from } = selection;

      // 查找刚插入的视频节点
      const videoPos = from - 1;
      if (videoPos >= 0) {
        const node = doc.nodeAt(videoPos);
        if (node && node.type.name === "video") {
          // 选中视频节点
          editor.chain().setNodeSelection(videoPos).run();
        }
      }
    }, 50);
  };

  const handleImageSelect = (mediaId: number, url: string) => {
    editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: "Image",
        title: "Image",
      })
      .run();

    // 插入后延迟选中图片节点，确保可以进行对齐操作
    setTimeout(() => {
      const { state } = editor;
      const { doc, selection } = state;
      const { from } = selection;

      // 查找刚插入的图片节点
      const imagePos = from - 1;
      if (imagePos >= 0) {
        const node = doc.nodeAt(imagePos);
        if (node && node.type.name === "image") {
          // 选中图片节点
          editor.chain().setNodeSelection(imagePos).run();
        }
      }
    }, 50);
  };

  const handleAudioSelect = (mediaId: number, url: string) => {
    editor
      .chain()
      .focus()
      .setAudio({
        src: url,
        controls: true,
        autoplay: false,
      })
      .run();

    // 插入后延迟选中音频节点，确保可以进行对齐操作
    setTimeout(() => {
      const { state } = editor;
      const { doc, selection } = state;
      const { from } = selection;

      // 查找刚插入的音频节点
      const audioPos = from - 1;
      if (audioPos >= 0) {
        const node = doc.nodeAt(audioPos);
        if (node && node.type.name === "audio") {
          // 选中音频节点
          editor.chain().setNodeSelection(audioPos).run();
        }
      }
    }, 50);
  };

  // 获取当前代码块的语言
  const getCurrentCodeBlockLanguage = () => {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    // 查找当前代码块节点
    let node = $from.node();
    let depth = $from.depth;

    while (depth >= 0) {
      if (node.type.name === "codeBlock") {
        return node.attrs.language || "plaintext";
      }
      depth--;
      node = $from.node(depth);
    }

    return "plaintext";
  };

  // 设置代码块语言
  const setCodeBlockLanguage = (language: string) => {
    editor.chain().focus().updateAttributes("codeBlock", { language }).run();
    setIsLanguageDropdownOpen(false);
  };

  // 创建带语言的代码块
  const createCodeBlockWithLanguage = (language: string) => {
    editor
      .chain()
      .focus()
      .toggleCodeBlock()
      .updateAttributes("codeBlock", { language })
      .run();
    setIsLanguageDropdownOpen(false);
    setShowLanguageSelector(false);
  };

  // 处理代码块按钮点击
  const handleCodeBlockClick = () => {
    if (editor.isActive("codeBlock")) {
      // 如果已经在代码块内，则退出代码块
      editor.chain().focus().toggleCodeBlock().run();
      setShowLanguageSelector(false);
    } else {
      // 如果不在代码块内，显示语言选择器
      setShowLanguageSelector(true);
      setIsLanguageDropdownOpen(true);
    }
  };

  // 处理媒体 caption（image, video, audio）
  const handleCaptionClick = (type: "image" | "video" | "audio") => {
    if (editor.isActive(type)) {
      const currentCaption = editor.getAttributes(type).caption || "";
      setCaptionText(currentCaption);
      setCaptionType(type);
      setShowCaptionInput(true);
      setTimeout(() => {
        captionInputRef.current?.focus();
      }, 0);
    }
  };

  const handleCaptionSubmit = () => {
    if (captionType && editor.isActive(captionType)) {
      editor
        .chain()
        .focus()
        .updateAttributes(captionType, { caption: captionText || null })
        .run();
      setShowCaptionInput(false);
      setCaptionText("");
      setCaptionType(null);
    }
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCaptionSubmit();
    } else if (e.key === "Escape") {
      setShowCaptionInput(false);
      setCaptionText("");
      setCaptionType(null);
    }
  };

  // 处理链接
  const handleLinkClick = () => {
    if (editor.isActive("link")) {
      // 如果已经是链接，显示输入框以编辑或删除
      const currentUrl = editor.getAttributes("link").href || "";
      setLinkUrl(currentUrl);
      setShowLinkInput(true);
      setTimeout(() => {
        linkInputRef.current?.focus();
        linkInputRef.current?.select();
      }, 0);
    } else {
      // 如果不是链接，显示输入框以添加
      setLinkUrl("");
      setShowLinkInput(true);
      setTimeout(() => {
        linkInputRef.current?.focus();
      }, 0);
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      // 添加或更新链接
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim() })
        .run();
    } else {
      // 如果 URL 为空，删除链接
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLinkSubmit();
    } else if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const Button = ({
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
      onMouseDown={(e) => {
        e.preventDefault(); // 防止编辑器失去焦点和选区
      }}
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

  return (
    <div className="border-b border-border-50 p-3 sm:p-4 flex flex-wrap gap-2 bg-card-50">
      {/* 文本格式 */}
      <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="粗体"
        >
          <Bold size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="斜体"
        >
          <Italic size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="下划线"
        >
          <Underline size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="行内代码"
        >
          <Code size={18} />
        </Button>
        <Button
          onClick={handleCodeBlockClick}
          isActive={editor.isActive("codeBlock")}
          title="代码块"
        >
          <Code2 size={18} />
        </Button>

        {/* 语言选择下拉菜单 */}
        {(editor.isActive("codeBlock") || showLanguageSelector) && (
          <div className="relative" ref={dropdownRef}>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="p-2 rounded-sm transition-colors text-foreground-300 hover:bg-background-100 hover:text-foreground-50 flex items-center gap-1"
              title="选择语言"
            >
              <span className="text-sm font-mono">
                {editor.isActive("codeBlock")
                  ? supportedLanguages.find(
                      (lang) => lang.value === getCurrentCodeBlockLanguage()
                    )?.label || "纯文本"
                  : "选择语言"}
              </span>
              <ChevronDown size={14} />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card-50 border border-border-100 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto min-w-[120px]">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() =>
                      editor.isActive("codeBlock")
                        ? setCodeBlockLanguage(language.value)
                        : createCodeBlockWithLanguage(language.value)
                    }
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-background-100 transition-colors ${
                      editor.isActive("codeBlock") &&
                      getCurrentCodeBlockLanguage() === language.value
                        ? "bg-primary-50 text-primary-600"
                        : "text-foreground-200"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 标题 */}
      <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="标题 1"
        >
          <Heading1 size={18} />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="标题 2"
        >
          <Heading2 size={18} />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="标题 3"
        >
          <Heading3 size={18} />
        </Button>
      </div>

      {/* 列表 */}
      <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote size={18} />
        </Button>
      </div>

      {/* 链接 */}
      <div className="flex gap-1 items-center border-r border-border-50 pr-3 mr-2">
        {!showLinkInput ? (
          <>
            <Button
              onClick={handleLinkClick}
              isActive={editor.isActive("link")}
              title="添加链接"
            >
              <Link size={18} />
            </Button>
            {editor.isActive("link") && (
              <Button onClick={handleUnlink} title="移除链接">
                <Unlink size={18} />
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={linkInputRef}
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              onBlur={handleLinkSubmit}
              placeholder="输入链接 URL..."
              className="px-2 py-1 text-sm border border-border-100 rounded-sm bg-card-50 text-foreground-200 focus:outline-none focus:border-primary-500 min-w-[200px]"
            />
          </div>
        )}
      </div>

      {/* 对齐 */}
      <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">
        <Button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="左对齐"
        >
          <AlignLeft size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="居中"
        >
          <AlignCenter size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="右对齐"
        >
          <AlignRight size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="两端对齐"
        >
          <AlignJustify size={18} />
        </Button>
      </div>

      {/* 媒体说明 (图片/视频/音频) */}
      {(editor.isActive("image") ||
        editor.isActive("video") ||
        editor.isActive("audio")) && (
        <div className="flex gap-1 items-center border-r border-border-50 pr-3 mr-2">
          {!showCaptionInput ||
          captionType !==
            (editor.isActive("image")
              ? "image"
              : editor.isActive("video")
              ? "video"
              : "audio") ? (
            <Button
              onClick={() =>
                handleCaptionClick(
                  editor.isActive("image")
                    ? "image"
                    : editor.isActive("video")
                    ? "video"
                    : "audio"
                )
              }
              isActive={
                !!(
                  (editor.isActive("image") &&
                    editor.getAttributes("image").caption) ||
                  (editor.isActive("video") &&
                    editor.getAttributes("video").caption) ||
                  (editor.isActive("audio") &&
                    editor.getAttributes("audio").caption)
                )
              }
              title={
                editor.isActive("image")
                  ? "添加图片说明"
                  : editor.isActive("video")
                  ? "添加视频说明"
                  : "添加音频说明"
              }
            >
              <FileText size={18} />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={captionInputRef}
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                onKeyDown={handleCaptionKeyDown}
                onBlur={handleCaptionSubmit}
                placeholder={
                  captionType === "image"
                    ? "输入图片说明..."
                    : captionType === "video"
                    ? "输入视频说明..."
                    : "输入音频说明..."
                }
                className="px-2 py-1 text-sm border border-border-100 rounded-sm bg-card-50 text-foreground-200 focus:outline-none focus:border-primary-500 min-w-[200px]"
              />
            </div>
          )}
        </div>
      )}

      {/* 视频 */}
      <div className="flex gap-1 border-r border-border-50 pr-3 mr-2">
        <Button
          onClick={() => setIsVideoModalOpen(true)}
          isActive={editor.isActive("video")}
          title="视频"
        >
          <Video size={18} />
        </Button>

        <Button
          onClick={() => setIsImageModalOpen(true)}
          isActive={editor.isActive("image")}
          title="图片"
        >
          <Image size={18} />
        </Button>
        <Button
          onClick={() => setIsAudioModalOpen(true)}
          isActive={editor.isActive("audio")}
          title="音频"
        >
          <FileAudio size={18} />
        </Button>
      </div>

      {/* 撤销/重做 */}
      <div className="flex gap-1">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          title="撤销"
        >
          <Undo size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          title="重做"
        >
          <Redo size={18} />
        </Button>
      </div>

      {/* 视频选择模态框 */}
      <VideoPickerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelect={handleVideoSelect}
      />

      {/* 图片选择模态框 */}
      <ImagePickerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
      />

      {/* 音频选择模态框 */}
      <AudioPickerModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSelect={handleAudioSelect}
      />
    </div>
  );
}
