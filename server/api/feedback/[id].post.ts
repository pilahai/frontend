import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const body = await readBody(event);
  const { feedback } = body;

  console.log(`Feedback received for classification ${id}: ${feedback}`);

  // Here you can add your logic to store the feedback in a database.
  // For now, we'll just return a success message.

  return {
    success: true,
    message: `Feedback '${feedback}' for classification ${id} has been recorded.`,
  };
});
