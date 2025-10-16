import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

function sendEvent(event, eventName, data) {
  event.node.res.write(`event: ${eventName}
`);
  event.node.res.write(`data: ${JSON.stringify(data)}

`);
}
const classify_post = defineEventHandler(async (event) => {
  await readBody(event);
  event.node.res.setHeader("Content-Type", "text/event-stream");
  event.node.res.setHeader("Cache-Control", "no-cache");
  event.node.res.setHeader("Connection", "keep-alive");
  setTimeout(() => {
    sendEvent(event, "uploading", { progress: 0, message: "receiving image" });
  }, 0);
  setTimeout(() => {
    sendEvent(event, "classifying", { progress: 25, message: "classifying image with Gemini..." });
  }, 1e3);
  setTimeout(() => {
    sendEvent(event, "saving", { progress: 75, message: "saving classification to database" });
  }, 2e3);
  setTimeout(() => {
    const dummyData = {
      id: 1,
      image_url: "https://placehold.co/600x400.png",
      classification: { label: "organic", probability: 0.9 },
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    sendEvent(event, "done", { progress: 100, message: "classification complete", data: dummyData });
    event.node.res.end();
  }, 3e3);
  await new Promise((resolve) => event.node.req.on("close", resolve));
  return;
});

export { classify_post as default };
//# sourceMappingURL=classify.post.mjs.map
