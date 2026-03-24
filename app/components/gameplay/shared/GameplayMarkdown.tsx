import { useEffect, useRef } from "react";

import rehypeMathjaxBrowser from "rehype-mathjax/browser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { joinClassNames } from "../../../lib/client/ui/gameplay-layout";
import styles from "./GameplayMarkdown.module.css";

type GameplayMarkdownProps = {
  className?: string;
  content: string;
};

type MathJaxWindow = Window & {
  MathJax?: {
    startup?: {
      promise?: Promise<unknown>;
    };
    typesetClear?: (elements?: HTMLElement[]) => void;
    typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
  };
};

export function GameplayMarkdown({ className, content }: GameplayMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const typeset = async () => {
      const mathJax = (window as MathJaxWindow).MathJax;

      if (!mathJax?.typesetPromise) {
        return;
      }

      await mathJax.startup?.promise;
      mathJax.typesetClear?.([container]);
      await mathJax.typesetPromise([container]);
    };

    const handleReady = () => {
      void typeset();
    };

    void typeset();
    document.addEventListener("mathjax-ready", handleReady);

    return () => {
      document.removeEventListener("mathjax-ready", handleReady);
    };
  }, [content]);

  return (
    <div className={joinClassNames(styles["markdown"], className)} ref={containerRef}>
      <ReactMarkdown
        rehypePlugins={[rehypeMathjaxBrowser]}
        components={{
          img({ alt, className: imageClassName, ...props }) {
            return (
              <img
                {...props}
                alt={alt ?? ""}
                className={joinClassNames(styles["markdown-image"], imageClassName)}
                loading="lazy"
              />
            );
          },
          table({ className: tableClassName, ...props }) {
            return (
              <div className={styles["markdown-table-shell"]}>
                <table {...props} className={tableClassName} />
              </div>
            );
          },
        }}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}