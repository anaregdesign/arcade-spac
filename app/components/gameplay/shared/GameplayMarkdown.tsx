import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { joinClassNames } from "../../../lib/client/ui/gameplay-layout";
import styles from "./GameplayMarkdown.module.css";

type GameplayMarkdownProps = {
  className?: string;
  content: string;
};

export function GameplayMarkdown({ className, content }: GameplayMarkdownProps) {
  return (
    <div className={joinClassNames(styles["markdown"], className)}>
      <ReactMarkdown
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
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}