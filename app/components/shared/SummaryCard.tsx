type SummaryCardProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "warm" | "cool" | "neutral";
  className?: string;
};

const toneClassName: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  warm: "warm-card",
  cool: "cool-card",
  neutral: "neutral-card",
};

export function SummaryCard({ eyebrow, title, description, tone, className }: SummaryCardProps) {
  const classes = ["summary-card", tone ? toneClassName[tone] : null, className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {description ? <p>{description}</p> : null}
    </article>
  );
}