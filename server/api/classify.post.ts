import { defineEventHandler, H3Event, readBody, type EventHandlerRequest } from 'h3'
import { useApiBase } from '../../app/composables/useApi';

function sendEvent(event: H3Event, eventName: string, data: any) {
  event.node.res.write(`event: ${eventName}\n`);
  event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default defineEventHandler(async (event) => {
//   // Read and consume the request body to prevent connection reset
//   await readBody(event);

//   event.node.res.setHeader('Content-Type', 'text/event-stream');
//   event.node.res.setHeader('Cache-Control', 'no-cache');
//   event.node.res.setHeader('Connection', 'keep-alive');

//   // Simulate receiving file
//   setTimeout(() => {
//     sendEvent(event, 'uploading', { progress: 0, message: "receiving image" });
//   }, 0);

//   // Simulate classifying
//   setTimeout(() => {
//     sendEvent(event, 'classifying', { progress: 25, message: "classifying image with Gemini..." });
//   }, 1000);

//   // Simulate saving
//   setTimeout(() => {
//     sendEvent(event, 'saving', { progress: 75, message: "saving classification to database" });
//   }, 2000);

//   // Simulate done
//   setTimeout(() => {
//     const dummyData = {
//       id: 1,
//       image_url: 'https://placehold.co/600x400.png',
//       classification: { label: 'organic', probability: 0.9 },
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };
//     sendEvent(event, 'done', { progress: 100, message: "classification complete", data: dummyData });
//     event.node.res.end();
//   }, 3000);

  // To simulate an error, you could do something like this:
  // setTimeout(() => {
  //   sendEvent(event, 'error', { message: 'An unexpected error occurred.' });
  //   event.node.res.end();
  // }, 1500);

  // Keep the connection open until all events are sent
//   await new Promise(resolve => event.node.req.on('close', resolve));
    
    const { BASE } = useApiBase();
    const body = await readBody(event);

    try {
      const response = await fetch(`${BASE}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
            

          console.log('Received chunk lines:', lines);

          var _event: string = '';
          var data: any;

          for (const line of lines) {
            if (line.startsWith('event:')) {
              _event = line.replace(/^event:\s*/, '').trim();
            } else if (line.startsWith('data:')) {
              data = line.replace(/^data:\s*/, '').trim();
            }

            if (_event && data) {
              console.log(`Forwarding event: ${_event} with data: ${data}`);
              sendEvent(event, _event, JSON.parse(data));
              _event = '';
              data = null;
            }
          }
        }
      }

      event.node.res.end();
    } catch (error) {
      sendEvent(event, 'error', { message: (error as Error).message });
      event.node.res.end();
    }

    return;
});
