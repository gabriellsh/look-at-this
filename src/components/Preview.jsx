import Cover from './Cover.jsx';

// Renders the best available preview for a demo: live iframe > screenshot > generative cover.
export default function Preview({ demo, live = false }) {
  if (live && demo.embed && demo.url) {
    return (
      <iframe
        className="preview-frame"
        src={demo.url}
        title={`${demo.title} preview`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
  if (demo.image) {
    return <img className="cover" src={demo.image} alt={demo.title} loading="lazy" />;
  }
  return <Cover seed={demo.id} title={demo.title} />;
}
