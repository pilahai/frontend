import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const history_get = defineEventHandler(async (event) => {
  const history = [
    {
      id: 1,
      image_url: "https://placehold.co/600x400.png",
      classification: { label: "organic", probability: 0.9 },
      feedback: "correct",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
      // 1 day ago
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 2,
      image_url: "https://placehold.co/600x400.png",
      classification: { label: "inorganic", probability: 0.8 },
      feedback: "wrong",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      // 2 days ago
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: 3,
      image_url: "https://placehold.co/600x400.png",
      classification: { label: "plastic", probability: 0.95 },
      feedback: null,
      // No feedback yet
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
      // 3 days ago
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString()
    }
  ];
  return history;
});

export { history_get as default };
//# sourceMappingURL=history.get.mjs.map
