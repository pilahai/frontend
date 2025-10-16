<template>
  <div class="page-container">
    <InstallPwa />

    <div class="camera-ui">
      <!-- Top Bar -->
      <div class="top-bar">
        <button @click="goBack" class="icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="page-title">
          <h1>SCAN ITEM</h1>
          <p>Place item inside the frame. Please keep your device steady.</p>
        </div>
        <button :disabled="!isStreaming" class="icon-button" title="Riwayat">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
        </button>
      </div>

      <!-- Camera Frame -->
      <div class="camera-frame"></div>

      <!-- Bottom Controls -->
      <div class="bottom-controls">
        <button @click="openGallery" class="control-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>
        <button @click="takePicture" :disabled="!isStreaming" class="control-button capture-button" title="Ambil Foto">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
        </button>
        <button @click="switchCamera" class="control-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3h-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="m18 9 1-1"/><path d="m21 6-1-1"/></svg>
        </button>
      </div>
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
    />

    <div v-else-if="snapshot" class="snapshot-gallery">
      <div
        class="snapshot-image"
        :style="{
          backgroundImage: `url(${snapshot})`,
          width: '100%',
          height: '100%'
        }"
      ></div>
      <div class="controls">
        <button @click="startCamera" :disabled="isStreaming" title="Mulai Kamera">▶️</button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      <p>⚠️ {{ errorMessage }}</p>
    </div>

    <input type="file" ref="galleryInput" @change="handleFileUpload" accept="image/*" style="display: none" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Webcam from '~/components/Webcam.vue';
import InstallPwa from '~/components/InstallPwa.vue';

const webcamRef = ref<InstanceType<typeof Webcam> | null>(null);
const galleryInput = ref<HTMLInputElement | null>(null);

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

const switchCamera = () => {
  webcamRef.value?.switchCamera();
};

const takePicture = async () => {
  var url = webcamRef.value?.takeSnapshot();
  if (url) {
    await processImage(url);
  }
};

const openGallery = () => {
  galleryInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleSnapshot(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }
};

const goBack = () => {
  // a simple back navigation
  window.history.length > 1 ? window.history.back() : window.location.href = '/';
}

async function processImage(url: string) {
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
}

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

.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #2c2c2c;
  overflow: hidden;
  color: white;
}

.webcam-component {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.camera-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.top-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  text-align: center;
}

.page-title h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.page-title p {
  font-size: 0.875rem;
  margin: 4px 0 0;
  opacity: 0.9;
}

.icon-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
}

.camera-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 70%;
  border: 2px solid white;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.bottom-controls {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  /* padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px; */
}

.control-button {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capture-button {
  width: 72px;
  height: 72px;
  border: 4px solid white;
  background-color: transparent;
}

.capture-button svg {
  fill: white;
}

.snapshot-gallery {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #222;
  z-index: 20;
}

.snapshot-image {
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-color: black;
  background-size: cover;
}

.controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.error-message {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4444;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  z-index: 30;
}
</style>