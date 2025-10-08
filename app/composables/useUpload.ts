// composables/useUpload.ts
import { ref } from "vue";
import { useApiBase } from "./useApi";

type SSEEvent = { event: string; data: string };

export function useUpload() {
  const { BASE } = useApiBase();
  const progress = ref(0);
  const status = ref("");
  const doneData = ref<any>(null);
  const error = ref<string | null>(null);

  // parse chunked SSE text into events
  function parseSSEChunk(chunk: string, buffer: { left: string }) : SSEEvent[] {
    // accumulate
    buffer.left += chunk;
    const events: SSEEvent[] = [];

    // split by double newline (SSE events separator)
    let parts = buffer.left.split(/\r?\n\r?\n/);
    // last part may be incomplete — keep it in buffer.left
    buffer.left = parts.pop() || "";

    for (const part of parts) {
      const lines = part.split(/\r?\n/);
      let ev = "";
      let dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) ev = line.replace(/^event:\s*/, "").trim();
        else if (line.startsWith("data:")) dataLines.push(line.replace(/^data:\s*/, ""));
        // ignore other lines
      }
      events.push({ event: ev || "message", data: dataLines.join("\n") });
    }
    return events;
  }

  async function uploadFile(file: File) {
    progress.value = 0;
    status.value = "starting";
    error.value = null;
    doneData.value = null;

    const url = `${BASE}/classify`;
    const form = new FormData();
    form.append("file", file);

    try {
      const resp = await fetch(url, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server returned ${resp.status}: ${txt}`);
      }

      if (!resp.body) {
        throw new Error("No response body from server");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const buffer = { left: "" };
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = !!result.done;
        const chunk = decoder.decode(result.value || new Uint8Array(), { stream: !done });

        const events = parseSSEChunk(chunk, buffer);
        for (const e of events) {
          // handle events: progress, uploading, classifying, saving, done, error
          if (e.event === "progress") {
            // expect JSON like {"percent":45}
            try {
              const d = JSON.parse(e.data);
              if (typeof d.percent === "number") {
                progress.value = d.percent;
              }
            } catch (_) {}
          } else if (e.event === "uploading") {
            status.value = "uploading: " + e.data;
          } else if (e.event === "classifying") {
            status.value = "classifying";
          } else if (e.event === "saving") {
            status.value = "saving";
          } else if (e.event === "done") {
            status.value = "done";
            // data might be JSON string
            try {
              doneData.value = JSON.parse(e.data);
            } catch {
              doneData.value = e.data;
            }
          } else if (e.event === "error") {
            status.value = "error";
            error.value = e.data;
          } else {
            // generic message
            try {
              const j = JSON.parse(e.data);
              if (j.percent) progress.value = j.percent;
            } catch {}
          }
        }
      }

      // after stream end, try to parse leftover buffer if any
      if (buffer.left.trim()) {
        const evs = parseSSEChunk("\n\n", buffer);
        for (const e of evs) {
          if (e.event === "done") {
            try { doneData.value = JSON.parse(e.data); } catch { doneData.value = e.data; }
          }
        }
      }

      return { progress, status, doneData, error };
    } catch (err: any) {
      error.value = err.message || String(err);
      status.value = "failed";
      return { progress, status, doneData, error };
    }
  }

  return { uploadFile, progress, status, doneData, error };
}
