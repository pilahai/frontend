import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const _id__post = defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const body = await readBody(event);
  const { feedback } = body;
  console.log(`Feedback received for classification ${id}: ${feedback}`);
  return {
    success: true,
    message: `Feedback '${feedback}' for classification ${id} has been recorded.`
  };
});

export { _id__post as default };
//# sourceMappingURL=_id_.post.mjs.map
