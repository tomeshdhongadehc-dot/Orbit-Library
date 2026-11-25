// One-time generator for catalog/*.json. After the first run, edit the JSON files by hand.
// Dates for the earlier pages are the "updated" dates of their published artifacts (read from the artifact list on 2026-11-25).
// Versions and counts are only given where they are known; nothing is guessed.
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("catalog", { recursive: true });

const addMonths = (iso, m) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + m);
  return d.toISOString().slice(0, 10);
};

const base = { visibility: "public", access: "public", prerequisites: [] };

const items = [
  {
    id: "api-design", title: "API Design Orbit", type: "orbit", shelf: "Development", track: "Backend",
    description: "REST and API design from first principles: resources, status codes, pagination, versioning, idempotency, security and hard interview questions.",
    tags: ["api", "rest", "http", "design"], version: "1.3", date: "2026-11-24", status: "verified",
    source: "dist/api-design.html", sources: "Inside the page: Revise, Sources and proofs", months: 12,
  },
  {
    id: "data-modelling-indexing", title: "Data Modelling and Indexing Orbit", type: "orbit", shelf: "Development", track: "Data",
    description: "Data modelling, normalisation, indexes, query plans and trade-offs, with interview practice and revision sheets.",
    tags: ["sql", "indexes", "modelling", "database"], version: "1.1", date: "2026-11-24", status: "verified",
    source: "dist/data-modelling-indexing.html", sources: "Inside the page: Revise, Sources and proofs", months: 12,
  },
  {
    id: "caching", title: "Cache Orbit", type: "orbit", shelf: "Development", track: "Backend",
    description: "Caching from browser to database: strategies, invalidation, Redis and Memcached, consistent hashing, locks and failure modes.",
    tags: ["cache", "redis", "memcached", "cdn"], version: "1.0", date: "2026-11-24", status: "verified",
    source: "dist/caching.html", sources: "Inside the page: Revise, Sources and proofs", months: 12,
  },
  {
    id: "queues-async-jobs", title: "Queue Orbit", type: "orbit", shelf: "Development", track: "Backend",
    description: "Queues and asynchronous jobs: delivery guarantees, retries, dead-letter queues, ordering, Kafka, RabbitMQ, SQS and workflows.",
    tags: ["queues", "kafka", "rabbitmq", "sqs", "jobs"], version: "1.0", date: "2026-11-24", status: "verified",
    source: "dist/queues-async-jobs.html", sources: "Inside the page: Revise, Sources and proofs", months: 12,
    counts: { Lessons: 29, "Quiz questions": 609, "Interview concepts": 190 },
  },
  {
    id: "mongodb", title: "Mongo Orbit", type: "orbit", shelf: "Development", track: "Data",
    description: "MongoDB from documents to sharding: schema design, indexes, aggregation, replication, transactions, security and production failure modes. Checked against MongoDB 9.0 documentation.",
    tags: ["mongodb", "nosql", "sharding", "aggregation", "replication"], version: "1.0", date: "2026-11-25", status: "verified",
    source: "dist/mongodb.html", sources: "Inside the page: Revise, Sources and proofs", months: 6,
    counts: { Lessons: 32, "Quiz questions": 672, "Interview concepts": 190 },
  },
  {
    id: "js-orbit", title: "JS Orbit", type: "orbit", shelf: "Development", track: "Languages",
    description: "JavaScript from the first line to advanced topics, as animated step-by-step lessons.",
    tags: ["javascript", "language"], version: "legacy", date: "2026-11-19", status: "legacy",
    source: "OFFLINE/earlier-pages/js-orbit.html", sources: null, months: 6,
  },
  {
    id: "js-in-motion", title: "JS in Motion", type: "orbit", shelf: "Development", track: "Languages",
    description: "An early prototype that shows JavaScript ideas as motion.",
    tags: ["javascript", "prototype"], version: "legacy", date: "2026-11-19", status: "legacy",
    source: "OFFLINE/earlier-pages/js-in-motion.html", sources: null, months: 6,
  },
  {
    id: "js-react", title: "React Orbit", type: "orbit", shelf: "Development", track: "Frontend",
    description: "React concepts as animated lessons, from components and state to rendering and performance.",
    tags: ["react", "frontend"], version: "legacy", date: "2026-11-19", status: "legacy",
    source: "OFFLINE/earlier-pages/js-react.html", sources: null, months: 6,
  },
  {
    id: "js-node", title: "Node Orbit", type: "orbit", shelf: "Development", track: "Backend",
    description: "Node.js internals and practice as animated lessons: the event loop, streams, modules and production concerns.",
    tags: ["node", "backend", "event-loop"], version: "legacy", date: "2026-11-21", status: "legacy",
    source: "OFFLINE/earlier-pages/js-node.html", sources: null, months: 6,
  },
  {
    id: "js-aws", title: "AWS Orbit", type: "orbit", shelf: "Deployment", track: "Cloud",
    description: "Amazon Web Services concepts as animated lessons.",
    tags: ["aws", "cloud"], version: "legacy", date: "2026-11-20", status: "legacy",
    source: "OFFLINE/earlier-pages/js-aws.html", sources: null, months: 6,
  },
  {
    id: "js-in-motion-3d", title: "JS in Motion 3D", type: "three-d", shelf: "Experiments", track: "3D worlds",
    description: "A 3D prototype that explores JavaScript ideas as a scene.",
    tags: ["3d", "javascript", "prototype"], version: "legacy", date: "2026-11-19", status: "legacy",
    source: "OFFLINE/earlier-pages/js-in-motion-3d.html", sources: null, months: 6,
  },
  {
    id: "tomeverse-world", title: "Tomeverse World", type: "three-d", shelf: "Experiments", track: "3D worlds",
    description: "Early draft of the Tomeverse 3D world.",
    tags: ["3d", "tomeverse"], version: "legacy", date: "2026-11-23", status: "legacy",
    source: "OFFLINE/earlier-pages/tomeverse-world.html", sources: null, months: 6,
  },
  {
    id: "tomeverse-land", title: "Tomeverse Land", type: "three-d", shelf: "Experiments", track: "3D worlds",
    description: "Draft of the Tomeverse land scene.",
    tags: ["3d", "tomeverse"], version: "legacy", date: "2026-11-23", status: "legacy",
    source: "OFFLINE/earlier-pages/tomeverse-land.html", sources: null, months: 6,
  },
  {
    id: "tomeverse-archipelago", title: "Tomeverse Archipelago", type: "three-d", shelf: "Experiments", track: "3D worlds",
    description: "Draft of the Tomeverse archipelago scene.",
    tags: ["3d", "tomeverse"], version: "legacy", date: "2026-11-23", status: "legacy",
    source: "OFFLINE/earlier-pages/tomeverse-archipelago.html", sources: null, months: 6,
  },
  {
    id: "tomeverse-globe", title: "Tomeverse Globe", type: "three-d", shelf: "Experiments", track: "3D worlds",
    description: "Draft of the Tomeverse globe scene.",
    tags: ["3d", "tomeverse"], version: "legacy", date: "2026-11-23", status: "legacy",
    source: "OFFLINE/earlier-pages/tomeverse-globe.html", sources: null, months: 6,
  },
];

for (const it of items) {
  const { months, ...rest } = it;
  const out = {
    ...base,
    ...rest,
    reviewBy: addMonths(it.date, months),
    entry: `/a/${it.id}/`,
    flag: `FLAG_ITEM_${it.id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
  };
  writeFileSync(`catalog/${it.id}.json`, JSON.stringify(out, null, 2) + "\n");
}
console.log("wrote", items.length, "catalog files");
