import { defineEventHandler, H3Event, readBody } from 'h3'

function sendEvent(event: H3Event, eventName: string, data: any) {
  event.node.res.write(`event: ${eventName}\n`);
  event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default defineEventHandler(async (event) => {
  // Read and consume the request body to prevent connection reset
  await readBody(event);

  event.node.res.setHeader('Content-Type', 'text/event-stream');
  event.node.res.setHeader('Cache-Control', 'no-cache');
  event.node.res.setHeader('Connection', 'keep-alive');

  // Simulate receiving file
  setTimeout(() => {
    sendEvent(event, 'uploading', { progress: 0, message: "receiving image" });
  }, 0);

  // Simulate classifying
  setTimeout(() => {
    sendEvent(event, 'classifying', { progress: 25, message: "classifying image with Gemini..." });
  }, 1000);

  // Simulate saving
  setTimeout(() => {
    sendEvent(event, 'saving', { progress: 75, message: "saving classification to database" });
  }, 2000);

  // Simulate done
  setTimeout(() => {
    const dummyData = {
      id: 1,
      image_url: 'https://placehold.co/600x400.png',
      classification: { label: 'organic', probability: 0.9 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sendEvent(event, 'done', { progress: 100, message: "classification complete", data: dummyData });
    event.node.res.end();
  }, 3000);

  // To simulate an error, you could do something like this:
  // setTimeout(() => {
  //   sendEvent(event, 'error', { message: 'An unexpected error occurred.' });
  //   event.node.res.end();
  // }, 1500);

  // Keep the connection open until all events are sent
  await new Promise(resolve => event.node.req.on('close', resolve));

  return;
});
