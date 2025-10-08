<template>
  <div class="page-container">
    <div class="p-4 text-center" v-if="showInstallButton || isPwaInstalled">
      <p v-if="isPwaInstalled">Aplikasi Pilahai sudah terinstal.</p>
      <button
        v-if="showInstallButton"
        @click="installPwa"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Install Aplikasi
      </button>
    </div>
    <div class="page-frame">
      <h1 class="">SCAN ITEM</h1>
      <p class="">
        Place item inside the frame. Please keep your device stady.
      </p>
    </div>

    <Webcam
      v-if="!snapshot"
      ref="webcamRef"
      width="100%"
      height="100%"
      @snapshot="handleSnapshot"
      @error="handleError"
      class="webcam-component"
    >
      <button @click="startCamera" :disabled="isStreaming" title="Mulai Kamera">▶️</button>
      <button @click="takePicture" :disabled="!isStreaming" title="Ambil Foto">📸</button>
      <button @click="stopCamera" :disabled="!isStreaming" title="Hentikan Kamera">⏹️</button>
    </Webcam>

    <div v-else-if="snapshot" class="snapshot-gallery">
      <img :src="snapshot" alt="Hasil jepretan webcam" />
      <div class="controls">
        <button @click="startCamera" :disabled="isStreaming" title="Mulai Kamera">▶️</button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      <p>⚠️ {{ errorMessage }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Webcam from '~/components/Webcam.vue'; // Pastikan path benar
import { usePwa } from '~/composables/usePwa';

const { showInstallButton, installPwa, isPwaInstalled } = usePwa();

// Ref untuk mengakses metode yang di-expose oleh komponen Webcam
const webcamRef = ref<InstanceType<typeof Webcam> | null>(null);

// State untuk hasil snapshot
const snapshot = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Mengambil nilai isStreaming dari komponen anak untuk menonaktifkan tombol
const isStreaming = computed(() => webcamRef.value?.isStreaming ?? false);

// --- Handler untuk tombol ---
const startCamera = () => {
  snapshot.value = null;
  errorMessage.value = null;
  webcamRef.value?.startStream();
};

const stopCamera = () => {
  webcamRef.value?.stopStream();
};

const takePicture = async () => {
  var url = webcamRef.value?.takeSnapshot();

  if (url) {
    // send the snapshot to clasify API
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: url,
      }),
    });

    // handle reader stream
    const reader = res.body?.getReader();
    if (reader) {
      for await (const { event, data } of parseSSE(reader)) {
        console.log('event', event);
        console.log('data', data);
      }
    }
  }
};

async function* parseSSE(reader : ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();
    let buffer: string | undefined = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts : string[] | undefined = buffer?.split("\n\n");
      buffer = parts?.pop();

      if (!parts) continue;

      for (const part of parts) {
        const eventLine = part.split("\n").find(l => l.startsWith("event:"));
        const dataLine = part.split("\n").find(l => l.startsWith("data:"));
        if (dataLine) {
          yield {
            event: eventLine ? eventLine.replace("event: ", "").trim() : "message",
            data: JSON.parse(dataLine.replace("data: ", "").trim())
          };
        }
      }
    }
  }

// --- Handler untuk event dari komponen Webcam ---
const handleSnapshot = (dataUrl: string) => {
  console.log('Foto berhasil diambil!');
  stopCamera();
  snapshot.value = dataUrl;
};

const handleError = (error: string) => {
  errorMessage.value = error;
}
</script>

<style scoped>
.page-frame {
  text-align: center;
  margin: 16px;
  position: absolute;
  z-index: 10;
  color: #FFFFFF;
  text-wrap: wrap;
  word-wrap: break-word;
  /* backdrop-filter: blur(8px); */
}
</style>