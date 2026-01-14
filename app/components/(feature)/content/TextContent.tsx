"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import UniqueID from "@tiptap/extension-unique-id";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Audio } from "@/app/lib/extensions/audio";
import { Image } from "@/app/lib/extensions/image";
import { Video } from "@/app/lib/extensions/video";
import ImagePreview from "./ImagePreview";

const lowlight = createLowlight(common);

// 注册额外的语言（补充 common 包中没有的，与 MenuBar 中 supportedLanguages 保持一致）
import bash from "highlight.js/lib/languages/bash";
import csharp from "highlight.js/lib/languages/csharp";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import sql from "highlight.js/lib/languages/sql";
import html from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

lowlight.register("html", html);
lowlight.register("xml", html);
lowlight.register("dockerfile", dockerfile);
lowlight.register("bash", bash);
lowlight.register("shell", bash);
lowlight.register("sql", sql);
lowlight.register("yaml", yaml);
lowlight.register("csharp", csharp);

const TextContent = ({ content }: { content: JSONContent | string }) => {
  // 国际化
  const contentT = useTranslations("content");
  // 图片预览状态
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // 解析 JSON 内容
  const parsedContent = useMemo(() => {
    return typeof content === "string" ? JSON.parse(content) : content;
  }, [content]);

  // 复制代码块内容
  const copyCodeBlock = useCallback(
    async (codeElement: HTMLElement, button: HTMLButtonElement) => {
      const code = codeElement.textContent || "";
      try {
        await navigator.clipboard.writeText(code);
        // 添加视觉反馈
        const originalText = button.textContent;
        button.textContent = contentT("copied");
        button.classList.remove("bg-background-500", "hover:bg-background-400");
        button.classList.add("bg-success-500");
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("bg-success-500");
          button.classList.add("bg-background-500", "hover:bg-background-400");
        }, 2000);
      } catch (err) {
        console.error(contentT("failedCopy"), err);
      }
    },
    [contentT],
  );

  // 切换代码块折叠状态
  const toggleCodeBlockCollapse = useCallback(
    (preElement: HTMLElement, collapseButton: HTMLButtonElement) => {
      const isCollapsed = preElement.classList.contains("collapsed");

      if (isCollapsed) {
        // 展开
        preElement.classList.remove("collapsed");
        preElement.style.maxHeight = "none";
        preElement.style.overflowY = "hidden";
        collapseButton.innerHTML = contentT("collapse");
        collapseButton.classList.remove("bg-primary-500");
        collapseButton.classList.add("bg-background-500", "hover:bg-background-400");
      } else {
        // 折叠
        preElement.classList.add("collapsed");
        preElement.style.maxHeight = "300px";
        preElement.style.overflowY = "hidden";
        collapseButton.innerHTML = contentT("expand");
        collapseButton.classList.remove("bg-background-500", "hover:bg-background-400");
        collapseButton.classList.add("bg-primary-500");
      }
    },
    [contentT],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 禁用默认的 codeBlock，使用 CodeBlockLowlight
        horizontalRule: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        languageClassPrefix: "language-",
        HTMLAttributes: {
          class: "code-block",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "horizontal-rule",
        },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: "markdown-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image", "video", "audio"],
        alignments: ["left", "center", "right", "justify"],
      }),
      UniqueID.configure({ types: ["heading"] }),
      Video,
      Audio,
      Image,
    ],
    content: parsedContent,
    editable: false,
    immediatelyRender: false,
  });

  // 为代码块添加复制按钮和行号
  useEffect(() => {
    if (!editor) return;

    const addCopyButtonsAndLineNumbers = () => {
      const codeBlocks = document.querySelectorAll(".ProseMirror pre");
      codeBlocks.forEach((preElement) => {
        // 检查是否已经处理过
        if (
          preElement.querySelector(".copy-button") ||
          preElement.querySelector(".line-numbers") ||
          preElement.querySelector(".language-label")
        )
          return;

        const codeElement = preElement.querySelector("code");
        if (!codeElement) return;

        // 获取语言信息
        const language = codeElement.className.match(/language-(\w+)/)?.[1] || "plaintext";

        // 语言标签映射
        const languageMap: { [key: string]: string } = {
          javascript: "JavaScript",
          typescript: "TypeScript",
          python: "Python",
          java: "Java",
          css: "CSS",
          html: "HTML",
          xml: "XML",
          json: "JSON",
          sql: "SQL",
          bash: "Bash",
          shell: "Shell",
          markdown: "Markdown",
          yaml: "YAML",
          dockerfile: "Dockerfile",
          go: "Go",
          rust: "Rust",
          php: "PHP",
          ruby: "Ruby",
          swift: "Swift",
          kotlin: "Kotlin",
          csharp: "C#",
          plaintext: "Text",
        };

        // 获取代码内容并计算行数（移除末尾空行）
        const codeText = (codeElement.textContent || "").replace(/\n+$/, "").replace(/\s+$/, "");
        const lines = codeText.split("\n");
        const lineCount = lines.length;

        // 移除 innerHTML 末尾的空行，同时保留语法高亮标签
        // 注意：不能使用 textContent，因为它会移除所有 HTML 标签（包括语法高亮的 span）
        let cleanedHTML = codeElement.innerHTML;
        // 循环清理直到没有变化（处理嵌套情况）
        let prevHTML = "";
        while (prevHTML !== cleanedHTML) {
          prevHTML = cleanedHTML;
          cleanedHTML = cleanedHTML
            .replace(/\n+$/g, "") // 移除末尾换行
            .replace(/[\s\u00A0]+$/g, "") // 移除末尾空白（包括非断行空格）
            .replace(/<span[^>]*>\s*<\/span>$/g, "") // 移除末尾空 span
            .replace(/<br\s*\/?>\s*$/gi, ""); // 移除末尾 br 标签
        }
        codeElement.innerHTML = cleanedHTML;

        // 计算精确的高度：行数 × 行高
        const exactHeight = lineCount * 24; // 1.5rem = 24px

        // 确保 code 元素没有额外的底部空间
        codeElement.style.display = "block";
        codeElement.style.lineHeight = "1.5rem";
        codeElement.style.height = `${exactHeight}px`;
        codeElement.style.width = "max-content";
        codeElement.style.minWidth = "100%";

        const lineNumbersContainer = document.createElement("div");
        lineNumbersContainer.className =
          "line-numbers absolute left-0 top-0 h-full w-12 bg-background-200 text-foreground-500 text-xs font-mono select-none pointer-events-none py-4 border-r border-border-200 z-10 flex flex-col";

        // 添加行号
        for (let i = 1; i <= lineCount; i++) {
          const lineNumber = document.createElement("div");
          lineNumber.className =
            "line-number text-center h-6 min-h-6 flex items-center justify-center text-xs font-mono";
          lineNumber.style.lineHeight = "1.5rem"; // 与代码行高保持一致
          lineNumber.textContent = i.toString();
          lineNumbersContainer.appendChild(lineNumber);
        }

        const copyButton = document.createElement("button");
        copyButton.className =
          "copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-background-500 text-foreground-50 rounded hover:bg-background-400 transition-colors duration-200 opacity-100 z-10";
        copyButton.textContent = contentT("copy");
        copyButton.onclick = () => copyCodeBlock(codeElement as HTMLElement, copyButton);

        const collapseButton = document.createElement("button");
        collapseButton.className =
          "collapse-button absolute top-2 right-16 px-2 py-1 text-xs bg-background-500 text-foreground-50 rounded hover:bg-background-400 transition-colors duration-200 opacity-100 z-10 hidden";
        collapseButton.textContent = contentT("expand");
        collapseButton.onclick = () =>
          toggleCodeBlockCollapse(preElement as HTMLElement, collapseButton);

        // 调整代码容器的样式
        const codeContainer = document.createElement("div");
        codeContainer.className = "code-container relative pl-16 pt-4 pb-4";
        codeContainer.style.lineHeight = "1.5rem";
        codeContainer.style.whiteSpace = "pre";
        codeContainer.style.fontFamily =
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

        // 将代码元素移动到新容器中
        codeElement.parentNode?.insertBefore(codeContainer, codeElement);
        codeContainer.appendChild(codeElement);

        // 确保 code 元素也使用等宽字体，并移除额外的底部空间
        codeElement.style.fontFamily =
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
        codeElement.style.whiteSpace = "pre";
        codeElement.style.margin = "0";
        codeElement.style.padding = "0";
        codeElement.style.paddingRight = "1rem";
        codeElement.style.width = "max-content";
        codeElement.style.minWidth = "100%";

        // 为 pre 元素添加样式和子元素
        const preHTMLElement = preElement as HTMLElement;
        preHTMLElement.classList.add("relative", "group", "code-block-wrapper", "rounded-sm");
        preHTMLElement.style.backgroundColor = "var(--color-background-200)";
        preHTMLElement.style.color = "var(--color-foreground-50)";
        preHTMLElement.style.border = "1px solid var(--color-border-200)";
        preHTMLElement.style.overflowX = "auto";
        preHTMLElement.style.overflowY = "hidden";
        preHTMLElement.style.position = "relative";
        preHTMLElement.style.padding = "0";
        preHTMLElement.style.fontFamily =
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

        // 使用 scrollbar-gutter 避免内容跳动，但只在需要时显示滚动条
        preHTMLElement.style.scrollbarGutter = "stable";

        // 检测高度和宽度并应用相应功能
        setTimeout(() => {
          const height = preHTMLElement.scrollHeight;

          // 检测高度并应用折叠
          let hasCollapseButton = false;
          if (height > 300) {
            collapseButton.classList.remove("hidden");
            hasCollapseButton = true;
            // 应用折叠状态
            preHTMLElement.classList.add("collapsed");
            preHTMLElement.style.maxHeight = "300px";
            preHTMLElement.style.overflowY = "hidden";
            collapseButton.textContent = contentT("expand");
            collapseButton.classList.remove("bg-background-500", "hover:bg-background-400");
            collapseButton.classList.add("bg-primary-500");
          }

          const languageLabel = document.createElement("div");
          const languagePosition = hasCollapseButton ? "right-32" : "right-16";
          languageLabel.className = `language-label absolute top-2 ${languagePosition} px-2 py-1 text-xs bg-primary-500 text-white rounded-sm font-medium z-10`;
          languageLabel.textContent = languageMap[language] || language;

          // 添加语言标签
          preElement.appendChild(languageLabel);
        }, 100);

        // 添加行号、复制按钮和折叠按钮
        preElement.appendChild(lineNumbersContainer);
        preElement.appendChild(copyButton);
        preElement.appendChild(collapseButton);
      });
    };

    // 初始添加复制按钮和行号
    addCopyButtonsAndLineNumbers();

    // 监听编辑器内容变化
    const handleUpdate = () => {
      setTimeout(addCopyButtonsAndLineNumbers, 100); // 延迟执行，确保 DOM 已更新
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, contentT, copyCodeBlock, toggleCodeBlockCollapse]);

  // 为图片添加点击事件以打开预览
  useEffect(() => {
    if (!editor) return;

    const addImageClickHandlers = () => {
      // 选择所有的图片元素（包括 figure 中的 img 和直接的 img）
      const images = document.querySelectorAll(".ProseMirror img");

      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;

        // 检查是否已经添加了点击事件
        if (imgElement.dataset.clickHandlerAdded) return;

        // 添加点击事件
        imgElement.style.cursor = "pointer";
        imgElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const src = imgElement.src;
          const alt = imgElement.alt || "Image";

          setPreviewImageUrl(src);
          setPreviewImageAlt(alt);
          setIsPreviewOpen(true);
        });

        // 标记已添加事件
        imgElement.dataset.clickHandlerAdded = "true";
      });
    };

    // 初始添加图片点击事件
    setTimeout(() => {
      addImageClickHandlers();
    }, 100);

    // 监听编辑器内容变化
    const handleUpdate = () => {
      setTimeout(addImageClickHandlers, 100);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  // 为音频元素禁用下载功能
  useEffect(() => {
    if (!editor) return;

    const disableAudioDownload = () => {
      // 选择所有的音频元素（包括 figure 中的 audio 和直接的 audio）
      const audios = document.querySelectorAll(".ProseMirror audio");

      audios.forEach((audio) => {
        const audioElement = audio as HTMLAudioElement;

        // 检查是否已经处理过
        if (audioElement.dataset.downloadDisabled) return;

        // 禁用下载功能
        audioElement.setAttribute("controlsList", "nodownload");

        // 标记已处理
        audioElement.dataset.downloadDisabled = "true";
      });
    };

    // 初始禁用音频下载
    setTimeout(() => {
      disableAudioDownload();
    }, 100);

    // 监听编辑器内容变化
    const handleUpdate = () => {
      setTimeout(disableAudioDownload, 100);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 min-h-[500px] bg-background-50 border border-border-100 rounded-sm">
      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose lg:prose-lg max-w-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-0
          
          /* 标题样式 - H1, H2, H3 */
          [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-foreground-50 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-6
          [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-foreground-50 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5
          [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-foreground-50 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4
          
          /* 段落样式 */
          [&_.ProseMirror_p]:text-foreground-200 [&_.ProseMirror_p]:leading-7 [&_.ProseMirror_p]:mb-4
          
          /* 粗体 */
          [&_.ProseMirror_strong]:text-foreground-50 [&_.ProseMirror_strong]:font-bold
          
          /* 斜体 */
          [&_.ProseMirror_em]:text-foreground-100 [&_.ProseMirror_em]:italic
          
          /* 下划线 */
          [&_.ProseMirror_u]:underline [&_.ProseMirror_u]:decoration-foreground-200
          
          /* 删除线 */
          [&_.ProseMirror_s]:line-through [&_.ProseMirror_s]:text-foreground-300
          
          /* 行内代码 */
          [&_.ProseMirror_code]:text-foreground-50 
          [&_.ProseMirror_code]:bg-background-100 
          [&_.ProseMirror_code]:px-1.5 
          [&_.ProseMirror_code]:py-0.5
          [&_.ProseMirror_code]:rounded
          [&_.ProseMirror_code]:text-sm
          [&_.ProseMirror_code]:font-mono
          [&_.ProseMirror_code]:before:content-['']
          [&_.ProseMirror_code]:after:content-['']
          [&_.ProseMirror_code]:leading-relaxed
          
          /* 链接样式 */
          [&_.ProseMirror_a]:text-primary-500
          [&_.ProseMirror_a]:underline
          [&_.ProseMirror_a]:decoration-primary-500
          [&_.ProseMirror_a]:underline-offset-2
          [&_.ProseMirror_a]:cursor-pointer
          [&_.ProseMirror_a]:transition-colors
          [&_.ProseMirror_a:hover]:text-primary-600
          [&_.ProseMirror_a:hover]:decoration-primary-600
          
          /* 代码块样式 - 使用设计系统颜色 */
          [&_.ProseMirror_pre]:bg-background-200
          [&_.ProseMirror_pre]:border
          [&_.ProseMirror_pre]:border-border-200
          [&_.ProseMirror_pre]:rounded-sm
          [&_.ProseMirror_pre]:p-0
          [&_.ProseMirror_pre]:my-4
          [&_.ProseMirror_pre]:overflow-x-auto
          [&_.ProseMirror_pre]:overflow-y-hidden
          [&_.ProseMirror_pre]:text-left
          [&_.ProseMirror_pre]:whitespace-pre
          [&_.ProseMirror_pre]:font-mono
          [&_.ProseMirror_pre]:text-sm
          [&_.ProseMirror_pre]:leading-6
          [&_.ProseMirror_pre]:text-foreground-50
          [&_.ProseMirror_pre]:relative
          [&_.ProseMirror_pre]:group
          [&_.ProseMirror_pre]:shadow-lg
          [&_.ProseMirror_pre]:transition-shadow
          [&_.ProseMirror_pre]:duration-300
          [&_.ProseMirror_pre]:ease-in-out
          
          /* 代码块滚动条样式 */
          [&_.ProseMirror_pre::-webkit-scrollbar]:h-2
          [&_.ProseMirror_pre::-webkit-scrollbar-track]:bg-background-300
          [&_.ProseMirror_pre::-webkit-scrollbar-track]:rounded-sm
          [&_.ProseMirror_pre::-webkit-scrollbar-thumb]:bg-border-200
          [&_.ProseMirror_pre::-webkit-scrollbar-thumb]:rounded-sm
          [&_.ProseMirror_pre::-webkit-scrollbar-thumb]:hover:bg-border-300
          
          /* 代码块内的 code 标签 */
          [&_.ProseMirror_pre_code]:bg-transparent
          [&_.ProseMirror_pre_code]:p-0
          [&_.ProseMirror_pre_code]:m-0
          [&_.ProseMirror_pre_code]:text-inherit
          [&_.ProseMirror_pre_code]:before:content-['']
          [&_.ProseMirror_pre_code]:after:content-['']
          [&_.ProseMirror_pre_code]:block
          [&_.ProseMirror_pre_code]:leading-6
          [&_.ProseMirror_pre_code]:text-sm
          [&_.ProseMirror_pre_code]:font-mono
          [&_.ProseMirror_pre_code]:whitespace-pre
          
          /* 表格样式 */
          [&_.ProseMirror_table]:w-full
          [&_.ProseMirror_table]:border-collapse
          [&_.ProseMirror_table]:my-4
          [&_.ProseMirror_table]:text-sm
          [&_.ProseMirror_table]:overflow-x-auto
          [&_.ProseMirror_table]:block
          [&_.ProseMirror_table]:max-w-full
          
          [&_.ProseMirror_th]:border
          [&_.ProseMirror_th]:border-border-200
          [&_.ProseMirror_th]:bg-background-100
          [&_.ProseMirror_th]:px-4
          [&_.ProseMirror_th]:py-2
          [&_.ProseMirror_th]:text-left
          [&_.ProseMirror_th]:font-semibold
          [&_.ProseMirror_th]:text-foreground-50
          [&_.ProseMirror_th]:whitespace-nowrap
          
          [&_.ProseMirror_td]:border
          [&_.ProseMirror_td]:border-border-200
          [&_.ProseMirror_td]:px-4
          [&_.ProseMirror_td]:py-2
          [&_.ProseMirror_td]:text-foreground-200
          
          [&_.ProseMirror_tr:nth-child(even)]:bg-background-50
          
          /* 任务列表样式 */
          [&_.ProseMirror_.task-list]:list-none
          [&_.ProseMirror_.task-list]:ml-0
          [&_.ProseMirror_.task-list]:pl-0
          [&_.ProseMirror_.task-list]:my-4
          
          [&_.ProseMirror_.task-item]:flex
          [&_.ProseMirror_.task-item]:items-start
          [&_.ProseMirror_.task-item]:gap-2
          [&_.ProseMirror_.task-item]:my-1
          
          [&_.ProseMirror_.task-item_input]:mt-1.5
          [&_.ProseMirror_.task-item_input]:cursor-pointer
          [&_.ProseMirror_.task-item_input]:accent-primary-500
          
          [&_.ProseMirror_.task-item[data-checked='true']_p]:line-through
          [&_.ProseMirror_.task-item[data-checked='true']_p]:text-foreground-400
          
          /* 水平分割线样式 */
          [&_.ProseMirror_hr]:border-0
          [&_.ProseMirror_hr]:border-t
          [&_.ProseMirror_hr]:border-border-200
          [&_.ProseMirror_hr]:my-6
          
          /* 代码容器样式 */
          [&_.ProseMirror_.code-container]:pl-16
          [&_.ProseMirror_.code-container]:py-4
          [&_.ProseMirror_.code-container]:min-h-0
          [&_.ProseMirror_.code-container]:leading-6
          [&_.ProseMirror_.code-container]:whitespace-pre
          
          /* 行号样式 */
          [&_.ProseMirror_.line-numbers]:select-none
          [&_.ProseMirror_.line-numbers]:pointer-events-none
          [&_.ProseMirror_.line-numbers]:text-foreground-500
          [&_.ProseMirror_.line-numbers]:font-mono
          [&_.ProseMirror_.line-numbers]:text-xs
          [&_.ProseMirror_.line-numbers]:leading-6
          [&_.ProseMirror_.line-numbers]:flex
          [&_.ProseMirror_.line-numbers]:flex-col
          [&_.ProseMirror_.line-numbers]:py-4
          
          /* 行号数字样式 */
          [&_.ProseMirror_.line-number]:leading-6
          [&_.ProseMirror_.line-number]:h-6
          [&_.ProseMirror_.line-number]:min-h-6
          [&_.ProseMirror_.line-number]:flex
          [&_.ProseMirror_.line-number]:items-center
          [&_.ProseMirror_.line-number]:justify-center
          [&_.ProseMirror_.line-number]:text-xs
          [&_.ProseMirror_.line-number]:font-mono
          [&_.ProseMirror_.line-number]:shrink-0
          
          /* 复制按钮样式 */
          [&_.ProseMirror_.copy-button]:z-10
          [&_.ProseMirror_.copy-button]:transition-opacity
          [&_.ProseMirror_.copy-button]:duration-200
          [&_.ProseMirror_.copy-button]:opacity-100
          
          /* 折叠按钮样式 */
          [&_.ProseMirror_.collapse-button]:z-10
          [&_.ProseMirror_.collapse-button]:transition-opacity
          [&_.ProseMirror_.collapse-button]:duration-200
          [&_.ProseMirror_.collapse-button]:opacity-100
          
          /* 语言标签样式 */
          [&_.ProseMirror_.language-label]:z-10
          [&_.ProseMirror_.language-label]:transition-opacity
          [&_.ProseMirror_.language-label]:duration-200
          [&_.ProseMirror_.language-label]:opacity-100
          [&_.ProseMirror_.language-label]:font-medium
          [&_.ProseMirror_.language-label]:text-xs
          [&_.ProseMirror_.language-label]:px-2
          [&_.ProseMirror_.language-label]:py-1
          [&_.ProseMirror_.language-label]:bg-primary-500
          [&_.ProseMirror_.language-label]:text-white
          [&_.ProseMirror_.language-label]:rounded-sm
          [&_.ProseMirror_.language-label]:absolute
          [&_.ProseMirror_.language-label]:top-2
          
          /* 语法高亮 - 使用设计系统颜色 */
          /* 注释 */
          [&_.ProseMirror_.hljs-comment]:text-foreground-500
          [&_.ProseMirror_.hljs-comment]:italic
          
          /* 关键字 - 主色调 */
          [&_.ProseMirror_.hljs-keyword]:text-primary-500
          [&_.ProseMirror_.hljs-keyword]:font-semibold
          
          /* 字符串 - 成功色 */
          [&_.ProseMirror_.hljs-string]:text-success-500
          
          /* 数字 - 警告色 */
          [&_.ProseMirror_.hljs-number]:text-warning-500
          
          /* 函数名 - 信息色 */
          [&_.ProseMirror_.hljs-function]:text-info-500
          [&_.ProseMirror_.hljs-title]:text-info-500
          
          /* 变量 - 前景色 */
          [&_.ProseMirror_.hljs-variable]:text-foreground-200
          
          /* 类名 - 前景色 */
          [&_.ProseMirror_.hljs-class]:text-foreground-100
          
          /* 属性 - 前景色 */
          [&_.ProseMirror_.hljs-attr]:text-foreground-200
          
          /* 标签 - 错误色 */
          [&_.ProseMirror_.hljs-tag]:text-error-500
          
          /* 运算符 - 前景色 */
          [&_.ProseMirror_.hljs-operator]:text-foreground-100
          
          /* 正则表达式 - 主色调 */
          [&_.ProseMirror_.hljs-regexp]:text-primary-400
          
          /* 内置函数和类型 - 前景色 */
          [&_.ProseMirror_.hljs-built_in]:text-foreground-50
          [&_.ProseMirror_.hljs-type]:text-foreground-50
          
          /* 模块名 - 前景色 */
          [&_.ProseMirror_.hljs-name]:text-foreground-50
          
          /* 引用块 */
          [&_.ProseMirror_blockquote]:border-l-4 
          [&_.ProseMirror_blockquote]:border-primary-500 
          [&_.ProseMirror_blockquote]:pl-4 
          [&_.ProseMirror_blockquote]:py-2
          [&_.ProseMirror_blockquote]:italic 
          [&_.ProseMirror_blockquote]:text-foreground-300
          [&_.ProseMirror_blockquote]:bg-background-100
          [&_.ProseMirror_blockquote]:my-4
          
          /* 无序列表 */
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:list-outside
          [&_.ProseMirror_ul]:ml-6
          [&_.ProseMirror_ul]:my-4
          [&_.ProseMirror_ul]:text-foreground-200
          
          /* 有序列表 */
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:list-outside
          [&_.ProseMirror_ol]:ml-6
          [&_.ProseMirror_ol]:my-4
          [&_.ProseMirror_ol]:text-foreground-200
          
          /* 列表项 */
          [&_.ProseMirror_li]:my-1
          [&_.ProseMirror_li]:leading-7
          [&_.ProseMirror_li]:text-foreground-200
          
          /* 嵌套列表 */
          [&_.ProseMirror_li>ul]:my-2
          [&_.ProseMirror_li>ol]:my-2
          
          /* 图片样式 */
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:max-h-96
          [&_.ProseMirror_img]:h-auto
          [&_.ProseMirror_img]:rounded-sm
          [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_img]:shadow-md
          [&_.ProseMirror_img]:block
          [&_.ProseMirror_img]:cursor-pointer
          [&_.ProseMirror_img]:transition-[box-shadow,transform,filter]
          [&_.ProseMirror_img]:duration-300
          [&_.ProseMirror_img]:object-contain
          
          /* 图片 hover 效果 */
          [&_.ProseMirror_img:hover]:shadow-xl
          [&_.ProseMirror_img:hover]:scale-[1.02]
          [&_.ProseMirror_img:hover]:brightness-95
          
          /* 图片对齐 */
          [&_.ProseMirror_img[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_img[style*='text-align:_left']]:ml-0
          [&_.ProseMirror_img[style*='text-align:_center']]:mx-auto
          [&_.ProseMirror_img[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_img[style*='text-align:_right']]:mr-0
          
          /* 图片容器 (figure) */
          [&_.ProseMirror_figure.image-figure]:my-4
          [&_.ProseMirror_figure.image-figure]:block
          [&_.ProseMirror_figure.image-figure]:w-fit
          [&_.ProseMirror_figure.image-figure]:max-w-full
          
          /* 图片容器内的图片 */
          [&_.ProseMirror_figure.image-figure_img]:max-w-full
          [&_.ProseMirror_figure.image-figure_img]:max-h-96
          [&_.ProseMirror_figure.image-figure_img]:h-auto
          [&_.ProseMirror_figure.image-figure_img]:rounded-sm
          [&_.ProseMirror_figure.image-figure_img]:shadow-md
          [&_.ProseMirror_figure.image-figure_img]:block
          [&_.ProseMirror_figure.image-figure_img]:cursor-pointer
          [&_.ProseMirror_figure.image-figure_img]:transition-[box-shadow,transform,filter]
          [&_.ProseMirror_figure.image-figure_img]:duration-300
          [&_.ProseMirror_figure.image-figure_img]:object-contain
          
          /* 图片容器内的图片 hover 效果 */
          [&_.ProseMirror_figure.image-figure_img:hover]:shadow-xl
          [&_.ProseMirror_figure.image-figure_img:hover]:scale-[1.02]
          [&_.ProseMirror_figure.image-figure_img:hover]:brightness-95
          
          /* 图片容器对齐 - 左对齐 */
          [&_.ProseMirror_figure.image-figure[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_figure.image-figure[style*='text-align:_left']]:ml-0
          
          /* 图片容器对齐 - 居中 */
          [&_.ProseMirror_figure.image-figure[style*='text-align:_center']]:mx-auto
          
          /* 图片容器对齐 - 右对齐 */
          [&_.ProseMirror_figure.image-figure[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_figure.image-figure[style*='text-align:_right']]:mr-0
          
          /* 图片说明文字 (figcaption) */
          [&_.ProseMirror_figcaption.image-caption]:text-center
          [&_.ProseMirror_figcaption.image-caption]:text-sm
          [&_.ProseMirror_figcaption.image-caption]:text-foreground-300
          [&_.ProseMirror_figcaption.image-caption]:italic
          [&_.ProseMirror_figcaption.image-caption]:mt-2
          [&_.ProseMirror_figcaption.image-caption]:px-2
          
          /* 视频样式 */
          [&_.ProseMirror_video]:max-w-full
          [&_.ProseMirror_video]:max-h-96
          [&_.ProseMirror_video]:h-auto
          [&_.ProseMirror_video]:rounded-sm
          [&_.ProseMirror_video]:my-4
          [&_.ProseMirror_video]:shadow-md
          [&_.ProseMirror_video]:block
          
          /* 视频对齐 */
          [&_.ProseMirror_video[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_video[style*='text-align:_left']]:ml-0
          [&_.ProseMirror_video[style*='text-align:_center']]:mx-auto
          [&_.ProseMirror_video[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_video[style*='text-align:_right']]:mr-0
          
          /* 视频容器 (figure) */
          [&_.ProseMirror_figure.video-figure]:my-4
          [&_.ProseMirror_figure.video-figure]:block
          [&_.ProseMirror_figure.video-figure]:w-fit
          [&_.ProseMirror_figure.video-figure]:max-w-full
          
          /* 视频容器内的视频 */
          [&_.ProseMirror_figure.video-figure_video]:max-w-full
          [&_.ProseMirror_figure.video-figure_video]:max-h-96
          [&_.ProseMirror_figure.video-figure_video]:h-auto
          [&_.ProseMirror_figure.video-figure_video]:rounded-sm
          [&_.ProseMirror_figure.video-figure_video]:shadow-md
          [&_.ProseMirror_figure.video-figure_video]:block
          
          /* 视频容器对齐 - 左对齐 */
          [&_.ProseMirror_figure.video-figure[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_figure.video-figure[style*='text-align:_left']]:ml-0
          
          /* 视频容器对齐 - 居中 */
          [&_.ProseMirror_figure.video-figure[style*='text-align:_center']]:mx-auto
          
          /* 视频容器对齐 - 右对齐 */
          [&_.ProseMirror_figure.video-figure[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_figure.video-figure[style*='text-align:_right']]:mr-0
          
          /* 视频说明文字 (figcaption) */
          [&_.ProseMirror_figcaption.video-caption]:text-center
          [&_.ProseMirror_figcaption.video-caption]:text-sm
          [&_.ProseMirror_figcaption.video-caption]:text-foreground-300
          [&_.ProseMirror_figcaption.video-caption]:italic
          [&_.ProseMirror_figcaption.video-caption]:mt-2
          [&_.ProseMirror_figcaption.video-caption]:px-2
          
          /* 音频样式 */
          [&_.ProseMirror_audio]:max-w-full
          [&_.ProseMirror_audio]:my-4
          [&_.ProseMirror_audio]:rounded-sm
          [&_.ProseMirror_audio]:block
          
          /* 音频对齐 */
          [&_.ProseMirror_audio[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_audio[style*='text-align:_left']]:ml-0
          [&_.ProseMirror_audio[style*='text-align:_center']]:mx-auto
          [&_.ProseMirror_audio[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_audio[style*='text-align:_right']]:mr-0
          
          /* 音频容器 (figure) */
          [&_.ProseMirror_figure.audio-figure]:my-4
          [&_.ProseMirror_figure.audio-figure]:block
          [&_.ProseMirror_figure.audio-figure]:w-fit
          [&_.ProseMirror_figure.audio-figure]:max-w-full
          
          /* 音频容器内的音频 */
          [&_.ProseMirror_figure.audio-figure_audio]:max-w-full
          [&_.ProseMirror_figure.audio-figure_audio]:my-0
          [&_.ProseMirror_figure.audio-figure_audio]:rounded-sm
          [&_.ProseMirror_figure.audio-figure_audio]:block
          
          /* 音频容器对齐 - 左对齐 */
          [&_.ProseMirror_figure.audio-figure[style*='text-align:_left']]:mr-auto
          [&_.ProseMirror_figure.audio-figure[style*='text-align:_left']]:ml-0
          
          /* 音频容器对齐 - 居中 */
          [&_.ProseMirror_figure.audio-figure[style*='text-align:_center']]:mx-auto
          
          /* 音频容器对齐 - 右对齐 */
          [&_.ProseMirror_figure.audio-figure[style*='text-align:_right']]:ml-auto
          [&_.ProseMirror_figure.audio-figure[style*='text-align:_right']]:mr-0
          
          /* 音频说明文字 (figcaption) */
          [&_.ProseMirror_figcaption.audio-caption]:text-center
          [&_.ProseMirror_figcaption.audio-caption]:text-sm
          [&_.ProseMirror_figcaption.audio-caption]:text-foreground-300
          [&_.ProseMirror_figcaption.audio-caption]:italic
          [&_.ProseMirror_figcaption.audio-caption]:mt-2
          [&_.ProseMirror_figcaption.audio-caption]:px-2"
      />

      {/* 图片预览组件 */}
      <ImagePreview
        isOpen={isPreviewOpen}
        imageUrl={previewImageUrl}
        imageAlt={previewImageAlt}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default TextContent;
