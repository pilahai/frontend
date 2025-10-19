import { defineEventHandler, readBody } from 'h3';
import { useApiBase } from '../../../app/composables/useApi';

export default defineEventHandler(async (event) => {
  const { BASE } = useApiBase();
  const { id } = event.context.params as { id: string };
  const body = await readBody(event);

  try {
    const response = await fetch(`${BASE}/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Upstream server returned ${response.status}: ${txt}`);
    }

    const respData = await response.json();
    return respData;
  } catch (err: any) {
    event.res.statusCode = 500;
    return { error: err.message || 'Unknown error' };
  }
});
