import TiptapImage from "@tiptap/extension-image";

export const Image = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: "left",
        parseHTML: (element) => {
          const figure = element.closest("figure");
          return figure?.style.textAlign || element.style.textAlign || "left";
        },
        renderHTML: (attributes) => {
          if (!attributes.textAlign) {
            return {};
          }
          return {
            style: `text-align: ${attributes.textAlign}`,
          };
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

  renderHTML({ node }) {
    const { caption, textAlign, ...imgAttrs } = node.attrs;

    const figureAttrs = {
      style: textAlign ? `text-align: ${textAlign}` : undefined,
      class: "image-figure",
    };

    const children = caption
      ? [
          ["img", imgAttrs],
          ["figcaption", { class: "image-caption" }, caption],
        ]
      : [["img", imgAttrs]];

    return ["figure", figureAttrs, ...children];
  },

  parseHTML() {
    return [
      { tag: "img[src]" },
      {
        tag: "figure.image-figure",
        contentElement: "img",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          if (!el.querySelector("img")) return false;

          return {
            textAlign: el.style.textAlign || "left",
            caption: el.querySelector("figcaption")?.textContent || null,
          };
        },
      },
    ];
  },
});
