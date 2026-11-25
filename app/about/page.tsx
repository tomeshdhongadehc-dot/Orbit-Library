import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "What Orbit Library is and how to read its labels." };

const STATUS = [
  ["Draft", "Written, not yet fully checked."],
  ["Verified", "Check scripts passed: every runnable snippet was executed, quizzes validated, sources and proofs filled in."],
  ["Audited", "An independent reader re-checked a sample of facts against the original documents. No item has this yet."],
  ["Legacy format", "An earlier page built before the current checks existed. It works but is not machine-checked the same way."],
];

const TAGS = [
  ["V", "Verified in the original text of the source."],
  ["S", "Source read."],
  ["J", "Engineering judgement, written as practice, not as fact."],
  ["D", "Derived by calculation, shown with the working."],
  ["U", "Unverified: hedged or left out."],
];

export default function About() {
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">About</p>
      <h1 className="text-3xl font-extrabold">What this is</h1>
      <p className="o-lead">
        Orbit Library collects interactive study pages. Each page has animated lessons, quizzes, interview practice,
        revision sheets and a sources and proofs tab. Source documents come first: specifications, vendor manuals and papers.
      </p>

      <h2 className="text-2xl font-bold">Statuses</h2>
      <dl className="o-grid">
        {STATUS.map(([k, v]) => (
          <div key={k} className="o-card">
            <dt className="o-card-title">{k}</dt>
            <dd className="o-muted">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="text-2xl font-bold">Evidence tags in the research notes</h2>
      <dl className="o-grid">
        {TAGS.map(([k, v]) => (
          <div key={k} className="o-card">
            <dt className="o-card-title">{k}</dt>
            <dd className="o-muted">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="text-2xl font-bold">Honest limits</h2>
      <ul className="list-disc pl-6 o-muted">
        <li>Server behaviour is taken from the manuals. No database, broker or cloud was run for the research, unless a page says so.</li>
        <li>Code that can run was run. Code that cannot is labelled &quot;illustrative, not run&quot;.</li>
        <li>Every page shows the version it was checked against and a review-by date. After that date it says it may be out of date.</li>
      </ul>
    </div>
  );
}
