import { mergeAttributes, Node } from "@tiptap/core";
import type { HTMLAttributes } from "react";

export interface AudioOptions {
  HTMLAttributes: HTMLAttributes<HTMLElement>;
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
          const el = element as HTMLElement;
          if (!el.querySelector("audio")) return false;

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

    const audioAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      restAttrs,
      { style: "pointer-events: auto;" },
      autoplay ? { autoplay: true } : {},
      loop ? { loop: true } : {},
    );

    const figureAttrs = {
      style: textAlign ? `text-align: ${textAlign}` : undefined,
      class: "audio-figure",
      "data-audio-wrapper": "true",
    };

    const children = caption
      ? [
          ["audio", audioAttrs],
          ["figcaption", { class: "audio-caption" }, caption],
        ]
      : [["audio", audioAttrs]];

    return ["figure", figureAttrs, ...children];
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
