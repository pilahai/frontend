<template>
  <div class="webcam-container">
    <video
      ref="videoRef"
      :style="videoStyle"
      autoplay
      playsinline
      muted
    ></video>
    <canvas ref="canvasRef" :width="widthToNumber" :height="heightToNumber" style="display: none; object-fit: cover;"></canvas>

    <div class="controls">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  width: {
    type: [Number, String],
    default: 640,
  },
  height: {
    type: [Number, String],
    default: 480,
  },
  filter: {
    type: String,
    default: 'none',
  },
  autoplay: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['snapshot', 'stream-started', 'stream-stopped', 'error']);

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const stream = ref<MediaStream | null>(null);
const isStreaming = ref<boolean>(false);
const isPortrait = ref(false);
const facingMode = ref<'user' | 'environment'>('user');

const videoStyle = computed(() => ({
  filter: props.filter,
  transform: facingMode.value === 'user' ? 'scaleX(-1)' : 'none',
  width: props.width,
  height: props.height,
}));

const widthToNumber = computed(() : number => {
    var videoRefWidth = videoRef.value?.clientWidth;
    return videoRefWidth ?? 0;
});

const heightToNumber = computed(() : number => {
    var videoRefHeight = videoRef.value?.clientHeight;

    return videoRefHeight ?? 0;
});

const switchCamera = () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  startStream();
};

const startStream = async () => {
  if (isStreaming.value) {
    stopStream();
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    emit('error', 'Browser tidak mendukung atau stream sudah berjalan.');
    return;
  }

  try {
    isPortrait.value = window.innerHeight > window.innerWidth;

    const videoConstraints: MediaTrackConstraints = {
      facingMode: facingMode.value,
    };

    // if (isPortrait.value) {
    //   videoConstraints.width = { ideal: widthToNumber.value };
    //   videoConstraints.height = { ideal: heightToNumber.value };
    // } else {
    //   videoConstraints.width = { ideal: heightToNumber.value };
    //   videoConstraints.height = { ideal: widthToNumber.value };
    // }

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });

    stream.value = mediaStream;

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }
    
    isStreaming.value = true;
    emit('stream-started', mediaStream);

  } catch (error) {
    console.error("Error saat mengakses webcam:", error);
    emit('error', `Tidak bisa mengakses kamera: ${error}`);
  }
};

const stopStream = () => {
  if (!stream.value) return;

  stream.value.getTracks().forEach(track => track.stop());

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
  stream.value = null;
  isStreaming.value = false;
  emit('stream-stopped');
};

const takeSnapshot = (): string | null => {
  if (!isStreaming.value || !videoRef.value || !canvasRef.value) {
    console.warn('Stream tidak aktif, tidak bisa mengambil snapshot.');
    return null;
  }

  const canvas = canvasRef.value;
  const video = videoRef.value;
  const context = canvas.getContext('2d');

  if (context) {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (facingMode.value === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    context.drawImage(videoRef.value, 0, 0, video.videoWidth, video.videoHeight);
    context.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    
    emit('snapshot', dataUrl);
    return dataUrl;
  }
  return null;
};

const handleResize = () => {
  isPortrait.value = window.innerHeight > window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
  if (props.autoplay) {
    startStream();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  stopStream();
});

defineExpose({
  startStream,
  stopStream,
  takeSnapshot,
  isStreaming,
  switchCamera,
});
</script>

<style scoped>
.webcam-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background-color: #222;
}
.webcam-container video {
  display: block;
  object-fit: cover;
}
</style>