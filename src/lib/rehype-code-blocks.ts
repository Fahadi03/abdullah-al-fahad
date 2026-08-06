import { h } from "hastscript";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Runs after Shiki (astro applies syntax highlighting before user rehype
 * plugins run). Wraps every highlighted <pre> in a header that shows a
 * filename label — from a ```lang filename="..." fence, falling back to the
 * language — plus a copy button wired up by the global copy-code script.
 */
export function rehypeCodeBlocks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      // Shiki sets `class` as a plain string (not the `className` array hastscript
      // uses), since it mutates hast nodes directly rather than going through h().
      const classAttr = node.properties.class;
      const classes =
        typeof classAttr === "string"
          ? classAttr.split(" ")
          : Array.isArray(classAttr)
            ? classAttr.map(String)
            : [];
      if (!classes.includes("astro-code")) return;

      const filename = (node.properties.dataFilename as string | undefined) ?? "";
      const language = (node.properties.dataLanguage as string | undefined) ?? "text";
      const label = filename || language;

      const wrapper = h(
        "div",
        { class: "code-block", "data-code-block": "" },
        h("div", { class: "code-block-header" }, [
          h("span", { class: "code-block-filename" }, label),
          h(
            "button",
            {
              type: "button",
              class: "code-block-copy",
              "data-copy-code": "",
              "aria-label": "Copy code",
            },
            "Copy",
          ),
        ]),
        node,
      );

      (parent as Root).children[index] = wrapper as unknown as Element;
    });
  };
}
