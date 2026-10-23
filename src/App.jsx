import { useMemo, useState } from 'react';
import { demos, GITHUB_USER } from './demos.js';
import Eyes from './components/Eyes.jsx';
import DemoCard from './components/DemoCard.jsx';
import PreviewModal from './components/PreviewModal.jsx';

const ALL = 'all';

export default function App() {
  const [tag, setTag] = useState(ALL);
  const [openIndex, setOpenIndex] = useState(null);

  const tags = useMemo(() => [ALL, ...new Set(demos.flatMap((d) => d.tags ?? []))], []);
  const visible = tag === ALL ? demos : demos.filter((d) => d.tags?.includes(tag));

  return (
    <div className="page">
      <header className="hero">
        <Eyes />
        <h1 className="title">
          look<span className="dash">-</span>at<span className="dash">-</span>this
        </h1>
        <p className="subtitle">
          A small gallery of things I made. Peek first, then dive in.
        </p>
        <a className="gh-link" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
          <GithubIcon /> @{GITHUB_USER}
        </a>
      </header>

      <nav className="filters" aria-label="Filter demos by tag">
        {tags.map((t) => (
          <button key={t} className={`chip ${t === tag ? 'is-active' : ''}`} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </nav>

      <main className="grid">
        {visible.map((demo, i) => (
          <DemoCard key={demo.id} demo={demo} index={i} onPreview={() => setOpenIndex(i)} />
        ))}
      </main>

      <footer className="footer">
        <span>{demos.length} demos</span>
        <span>·</span>
        <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
          github.com/{GITHUB_USER}
        </a>
      </footer>

      {openIndex !== null && (
        <PreviewModal
          demos={visible}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}

export function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
