import { Node, mergeAttributes } from "@tiptap/core";

export interface AudioOptions {
  HTMLAttributes: Record<string, any>;
}

export interface AudioAttrs {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      /**
       * 插入一个音频节点
       */
      setAudio: (options: AudioAttrs) => ReturnType;
    };
  }
}

export const Audio = Node.create<AudioOptions>({
  name: "audio",

  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  inline: false,

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
      { tag: "audio" },
      {
        tag: "figure.audio-figure",
        contentElement: "audio",
        getAttrs: (element) => {
          const audio = (element as HTMLElement).querySelector("audio");
          if (!audio) return false;

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

    // 构建 audio 元素的属性，只在值为 true 时添加布尔属性
    const audioAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      restAttrs,
      {
        // 添加 pointer-events 确保音频控件可以交互
        style: "pointer-events: auto;",
      },
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
          class: "audio-figure",
          "data-audio-wrapper": "true",
        },
        ["audio", audioAttrs],
        ["figcaption", { class: "audio-caption" }, caption],
      ];
    }

    // 没有 caption 时，也使用 figure 容器
    return [
      "figure",
      {
        style: textAlign ? `text-align: ${textAlign}` : undefined,
        class: "audio-figure",
        "data-audio-wrapper": "true",
      },
      ["audio", audioAttrs],
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options: AudioAttrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
