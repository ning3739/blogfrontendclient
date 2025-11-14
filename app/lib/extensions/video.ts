import { Node, mergeAttributes } from "@tiptap/core";

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
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
          const video = (element as HTMLElement).querySelector("video");
          if (!video) return false;

          const figcaption = (element as HTMLElement).querySelector(
            "figcaption"
          );
          const textAlign = (element as HTMLElement).style.textAlign || "left";

          return {
            textAlign,
            caption: figcaption?.textContent || null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { caption, textAlign, autoplay, loop, ...restAttrs } = node.attrs;

    // 构建 video 元素的属性
    const videoAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      {
        class: [
          "max-w-full h-auto",
          "shadow-lg",
          "border border-border-100",
          "transition-all duration-300 ease-in-out",
          "focus:outline-none",
          "cursor-pointer",
        ].join(" "),
        style: "max-width: 100%; height: auto;",
        controlsList: "nodownload noremoteplayback",
      },
      restAttrs,
      // 只在为 true 时添加布尔属性
      autoplay ? { autoplay: true } : {},
      loop ? { loop: true } : {}
    );

    // 始终使用 figure 容器包裹，保证宽度和对齐行为一致
    // 如果有 caption，添加 figcaption
    if (caption) {
      return [
        "figure",
        {
          style: textAlign ? `text-align: ${textAlign}` : undefined,
          class: "video-figure",
        },
        ["video", videoAttrs],
        ["figcaption", { class: "video-caption" }, caption],
      ];
    }

    // 没有 caption 时，也使用 figure 容器
    return [
      "figure",
      {
        style: textAlign ? `text-align: ${textAlign}` : undefined,
        class: "video-figure",
      },
      ["video", videoAttrs],
    ];
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
