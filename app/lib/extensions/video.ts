import { mergeAttributes, Node } from "@tiptap/core";
import type { HTMLAttributes } from "react";

export interface VideoOptions {
  HTMLAttributes: HTMLAttributes<HTMLElement>;
}

export interface VideoAttrs {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  width?: number | string;
  height?: number | string;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /**
       * 插入一个视频节点
       */
      setVideo: (options: VideoAttrs) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",

  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      loop: {
        default: false,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
      poster: {
        default: null,
      },
      preload: {
        default: "metadata",
      },
      textAlign: {
        default: "left",
        parseHTML: (element) => {
          const figure = element.closest("figure");
          return figure?.style.textAlign || element.style.textAlign || "left";
        },
        renderHTML: () => {
          return {};
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          const figure = element.closest("figure");
          const figcaption = figure?.querySelector("figcaption");
          return figcaption?.textContent || null;
        },
        renderHTML: () => {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: "video" },
      {
        tag: "figure.video-figure",
        contentElement: "video",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          if (!el.querySelector("video")) return false;

          return {
            textAlign: el.style.textAlign || "left",
            caption: el.querySelector("figcaption")?.textContent || null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { caption, textAlign, autoplay, loop, ...restAttrs } = node.attrs;

    const videoAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      {
        class: [
          "max-w-full h-auto",
          "shadow-lg",
          "border border-border-100",
          "transition-[opacity,transform] duration-300 ease-in-out",
          "focus:outline-none",
          "cursor-pointer",
        ].join(" "),
        style: "max-width: 100%; height: auto;",
        controlsList: "nodownload noremoteplayback",
      },
      restAttrs,
      autoplay ? { autoplay: true } : {},
      loop ? { loop: true } : {},
    );

    const figureAttrs = {
      style: textAlign ? `text-align: ${textAlign}` : undefined,
      class: "video-figure",
    };

    const children = caption
      ? [
          ["video", videoAttrs],
          ["figcaption", { class: "video-caption" }, caption],
        ]
      : [["video", videoAttrs]];

    return ["figure", figureAttrs, ...children];
  },

  addCommands() {
    return {
      setVideo:
        (options: VideoAttrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
