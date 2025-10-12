<template>
  <div class="page-container">
    <InstallPwa />
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
      :autoplay="true"
      @snapshot="handleSnapshot"
      @error="handleError"
      class="webcam-component"
    >
      <button @click="takePicture" :disabled="!isStreaming" title="Ambil Foto">📸</button>
    </Webcam>

    <div v-else-if="snapshot" class="snapshot-gallery">
      <div
        class="snapshot-image"
        :style="{
          backgroundImage: `url(${snapshot})`,
          width: '100%',
          height: '100%',
        }"
      ></div>
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
import Webcam from '~/components/Webcam.vue';
import InstallPwa from '~/components/InstallPwa.vue';

const webcamRef = ref<InstanceType<typeof Webcam> | null>(null);

const snapshot = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const isStreaming = computed(() => webcamRef.value?.isStreaming ?? false);

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
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: url,
      }),
    });

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
}

.snapshot-gallery {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #222;
}

.snapshot-image {
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-color: black;
}
</style>