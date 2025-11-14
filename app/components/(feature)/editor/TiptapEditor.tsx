"use client";

import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor, JSONContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Image } from "@/app/lib/extensions/image";
import { Video } from "@/app/lib/extensions/video";
import { Audio } from "@/app/lib/extensions/audio";
import MenuBar from "@/app/components/(feature)/editor/MenuBar";

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: JSONContent | null;
  onChange: (json: JSONContent) => void;
}) {
  const isFirstRender = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: "language-",
          HTMLAttributes: {
            class: "code-block",
            style: "padding: 0; margin: 0;",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image", "video", "audio"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder: "开始编辑你的内容...",
      }),
      Video,
      Audio,
      Image,
    ],
    immediatelyRender: false,
    content: content || undefined,
    onUpdate: ({ editor }) => {
      // 编辑器内部已经使用正确格式，直接输出即可
      onChange(editor.getJSON());
    },
  });

  // 只在外部内容改变时更新编辑器（例如：加载新项目）
  useEffect(() => {
    // 跳过首次渲染，因为 useEditor 已经设置了初始内容
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (editor) {
      const currentContent = editor.getJSON();

      // 只有当内容真正不同时才更新
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        if (content) {
          editor.commands.setContent(content, { emitUpdate: false });
        } else {
          editor.commands.clearContent(false);
        }
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-card-50 border border-border-50 rounded-sm shadow-sm overflow-hidden">
      <MenuBar editor={editor} />
      <div className="p-4 sm:p-6 min-h-[500px] bg-card-50">
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
          [&_.ProseMirror_code]:font-code
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
          
          /* 代码块样式 */
          [&_.ProseMirror_pre]:bg-background-100
          [&_.ProseMirror_pre]:border
          [&_.ProseMirror_pre]:border-border-100
          [&_.ProseMirror_pre]:rounded-sm
          [&_.ProseMirror_pre]:p-0
          [&_.ProseMirror_pre]:my-4
          [&_.ProseMirror_pre]:overflow-x-auto
          [&_.ProseMirror_pre]:text-left
          [&_.ProseMirror_pre]:whitespace-pre
          [&_.ProseMirror_pre]:font-code
          [&_.ProseMirror_pre]:text-sm
          [&_.ProseMirror_pre]:leading-relaxed
          [&_.ProseMirror_pre]:text-foreground-200
          
          /* 代码块内的 code 元素 */
          [&_.ProseMirror_pre_code]:py-0
          [&_.ProseMirror_pre_code]:block
          [&_.ProseMirror_pre_code]:bg-transparent
          [&_.ProseMirror_pre_code]:text-inherit
          [&_.ProseMirror_pre_code]:before:content-['']
          [&_.ProseMirror_pre_code]:after:content-['']
          
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
          [&_.ProseMirror_img]:h-auto
          [&_.ProseMirror_img]:rounded-sm
          [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_img]:shadow-md
          [&_.ProseMirror_img]:block
          
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
          [&_.ProseMirror_figure.image-figure_img]:h-auto
          [&_.ProseMirror_figure.image-figure_img]:rounded-sm
          [&_.ProseMirror_figure.image-figure_img]:shadow-md
          [&_.ProseMirror_figure.image-figure_img]:block
          
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
          [&_.ProseMirror_figure.audio-figure]:cursor-pointer
          [&_.ProseMirror_figure.audio-figure]:transition-all
          
          /* 音频容器选中状态 */
          [&_.ProseMirror_.ProseMirror-selectednode_figure.audio-figure]:outline-2
          [&_.ProseMirror_.ProseMirror-selectednode_figure.audio-figure]:outline-primary-500
          [&_.ProseMirror_.ProseMirror-selectednode_figure.audio-figure]:outline-offset-2
          
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
          [&_.ProseMirror_figcaption.audio-caption]:px-2
          
          /* Placeholder 样式 */
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-foreground-300
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:italic"
        />
      </div>
    </div>
  );
}
