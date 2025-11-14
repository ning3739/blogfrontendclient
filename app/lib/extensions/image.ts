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

  renderHTML({ HTMLAttributes, node }) {
    const { caption, textAlign, ...restAttrs } = node.attrs;

    // 构建 img 元素的属性
    const imgAttrs = {
      ...restAttrs,
      src: restAttrs.src,
      alt: restAttrs.alt,
      title: restAttrs.title,
    };

    // 始终使用 figure 容器包裹，保证宽度和对齐行为一致
    // 如果有 caption，添加 figcaption
    if (caption) {
      return [
        "figure",
        {
          style: textAlign ? `text-align: ${textAlign}` : undefined,
          class: "image-figure",
        },
        ["img", imgAttrs],
        ["figcaption", { class: "image-caption" }, caption],
      ];
    }

    // 没有 caption 时，也使用 figure 容器
    return [
      "figure",
      {
        style: textAlign ? `text-align: ${textAlign}` : undefined,
        class: "image-figure",
      },
      ["img", imgAttrs],
    ];
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
      {
        tag: "figure.image-figure",
        contentElement: "img",
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img");
          if (!img) return false;

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
});
