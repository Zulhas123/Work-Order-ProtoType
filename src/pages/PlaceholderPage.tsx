export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <div className="pageTitle">{title}</div>
      <div className="panel">
        <div className="muted">Prototype placeholder.</div>
      </div>
    </div>
  );
}

