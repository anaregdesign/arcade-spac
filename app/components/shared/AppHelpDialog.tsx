type AppHelpSection = {
  eyebrow: string;
  title: string;
  body: string;
};

type AppHelpDialogProps = {
  intro: string;
  isOpen: boolean;
  onClose: () => void;
  sections: AppHelpSection[];
  title: string;
  titleEyebrow?: string;
  footer?: React.ReactNode;
};

export function AppHelpDialog({
  intro,
  isOpen,
  onClose,
  sections,
  title,
  titleEyebrow = "Help",
  footer,
}: AppHelpDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <section className="help-overlay" aria-label="Help">
      <div className="help-dialog feature-card" role="dialog" aria-modal="true" aria-labelledby="app-help-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{titleEyebrow}</p>
            <h2 className="section-title" id="app-help-title">{title}</h2>
          </div>
          <button className="action-link action-link-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="compact-copy">{intro}</p>
        <div className="help-grid">
          {sections.map((section) => (
            <article className="help-panel" key={`${section.eyebrow}-${section.title}`}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h3 className="card-title">{section.title}</h3>
              <p className="compact-copy">{section.body}</p>
            </article>
          ))}
        </div>
        {footer ? <div className="hero-actions">{footer}</div> : null}
      </div>
    </section>
  );
}
