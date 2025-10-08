<template>
  <div class="webcam-container">
    <video
      ref="videoRef"
      :width="width"
      :height="height"
      :style="videoStyle"
      autoplay
      playsinline
      muted
    ></video>
    <canvas ref="canvasRef" :width="width" :height="height" style="display: none;"></canvas>

    <div class="controls">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// --- PROPS ---
// Properti yang bisa di-pass dari komponen induk
const props = defineProps({
  width: {
    type: [Number, String],
    default: 640,
  },
  height: {
    type: [Number, String],
    default: 480,
  },
  // Prop untuk menerima filter CSS
  filter: {
    type: String,
    default: 'none', // contoh: 'grayscale(100%)', 'sepia(100%)', 'blur(5px)'
  },
  autoplay: {
    type: Boolean,
    default: false,
  }
});

// --- EMITS ---
// Event yang dikirim ke komponen induk
const emit = defineEmits(['snapshot', 'stream-started', 'stream-stopped', 'error']);

// --- REFS ---
// Referensi ke elemen DOM
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// State internal komponen
const stream = ref<MediaStream | null>(null);
const isStreaming = ref<boolean>(false);

// --- COMPUTED PROPERTIES ---
// Mengaplikasikan filter secara reaktif
const videoStyle = computed(() => ({
  filter: props.filter,
  transform: 'scaleX(-1)', // Efek cermin/mirror
}));

const widthToNumber = computed(() : number => {
    var videoRefWidth = videoRef.value?.clientWidth;
    if (typeof props.width === 'string' && props.width.endsWith('%') && videoRefWidth) {
        return (parseInt(props.width, 10) / 100) * videoRefWidth;
    }

    return parseInt(props.width as string, 10);
});

const heightToNumber = computed(() : number => {
    var videoRefHeight = videoRef.value?.clientHeight;
    if (typeof props.height === 'string' && props.height.endsWith('%') && videoRefHeight) {
        return (parseInt(props.height, 10) / 100) * videoRefHeight;
    }

    return parseInt(props.height as string, 10);
});

// --- METHODS ---
/**
 * Memulai stream dari webcam.
 */
const startStream = async () => {
  if (isStreaming.value || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    emit('error', 'Browser tidak mendukung atau stream sudah berjalan.');
    return;
  }

  try {
    console.log('widthToNumber.value', widthToNumber.value);
    console.log('heightToNumber.value', heightToNumber.value);
    // Meminta akses ke webcam
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: widthToNumber.value,
        height: heightToNumber.value,
      },
      audio: false, // Matikan audio agar tidak meminta izin mikrofon
    });

    stream.value = mediaStream;

    // Menghubungkan stream ke elemen <video>
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

/**
 * Menghentikan stream webcam.
 */
const stopStream = () => {
  if (!stream.value) return;

  // Menghentikan setiap track video
  stream.value.getTracks().forEach(track => track.stop());

  // Membersihkan state
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
  stream.value = null;
  isStreaming.value = false;
  emit('stream-stopped');
};

/**
 * Mengambil snapshot dari video dan mengirimkannya sebagai data URL.
 * @returns {string | null} Data URL gambar dalam format PNG.
 */
const takeSnapshot = (): string | null => {
  if (!isStreaming.value || !videoRef.value || !canvasRef.value) {
    console.warn('Stream tidak aktif, tidak bisa mengambil snapshot.');
    return null;
  }

  const canvas = canvasRef.value;
  const video = videoRef.value;
  const context = canvas.getContext('2d');

  if (context) {
    // Menggambar frame saat ini dari video ke canvas
    // Diberi efek cermin agar sesuai dengan tampilan video

    canvas.width = widthToNumber.value;
    canvas.height = heightToNumber.value;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, widthToNumber.value, heightToNumber.value);
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

    // Mengkonversi canvas ke format data URL (base64)
    const dataUrl = canvas.toDataURL('image/png');
    
    // Mengirim data URL ke komponen induk
    emit('snapshot', dataUrl);
    return dataUrl;
  }
  return null;
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  if (props.autoplay) {
    startStream();
  }
});

// Sangat penting untuk mematikan kamera saat komponen dihancurkan
onBeforeUnmount(() => {
  stopStream();
});

// --- EXPOSE ---
// Mengekspos fungsi agar bisa dipanggil dari komponen induk melalui ref
defineExpose({
  startStream,
  stopStream,
  takeSnapshot,
  isStreaming,
});
</script>

<style scoped>
.webcam-container {
  position: relative;
  display: inline-block;
  /* border-radius: 8px; */
  overflow: hidden;
  background-color: #222;
}
.webcam-container video {
  display: block;
}
</style>