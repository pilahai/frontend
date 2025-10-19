<template>
  <div class="page-container">
    <div class="top-bar">
      <button @click="goBack" class="icon-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="page-title">
        <h1>RIWAYAT KLASIFIKASI</h1>
      </div>
      <div class="icon-button-placeholder"></div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading history...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
    </div>

    <div v-else class="history-list">
      <div v-for="item in history" :key="item.id" class="history-item">
        <img :src="item.image_url" alt="Classified Image" class="history-image" />
        <div class="history-info">
          <p class="classification">
            {{ item.classification.label }}: {{ (item.classification.probability * 100).toFixed(0) }}%
          </p>
          <div v-if="item.feedback === null && !item.feedbackSent" class="feedback-buttons">
            <button @click="sendFeedback(item, 'correct')" class="feedback-button correct">👍 Benar</button>
            <button @click="sendFeedback(item, 'wrong')" class="feedback-button wrong">👎 Salah</button>
          </div>
          <div v-else class="feedback-status">
            <p v-if="item.feedback === 'correct'" class="correct-text">Anda menandai ini sebagai Benar</p>
            <p v-if="item.feedback === 'wrong'" class="wrong-text">Anda menandai ini sebagai Salah</p>
            <p v-if="item.feedbackSent">Terima kasih atas masukan Anda!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Classification {
  label: string;
  probability: number;
}

interface HistoryItem {
  id: number;
  image_url: string;
  classification: Classification;
  feedback: 'correct' | 'wrong' | null;
  created_at: string;
  updated_at: string;
  feedbackSent?: boolean;
}

const history = ref<HistoryItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    history.value = await response.json();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  window.history.length > 1 ? window.history.back() : window.location.href = '/';
}

async function sendFeedback(item: HistoryItem, feedback: 'correct' | 'wrong') {
  try {
    await fetch(`/api/feedback/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });
    item.feedback = feedback;
    item.feedbackSent = true;
  } catch (error) {
    console.error('Failed to send feedback:', error);
    // Optionally, show an error message to the user
  }
}
</script>

<style scoped>
.page-container {
  width: 100vw;
  min-height: 100vh;
  background-color: #2c2c2c;
  color: white;
  padding: 24px;
  box-sizing: border-box;
}

.top-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  text-align: center;
  flex-grow: 1;
}

.page-title h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.icon-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
}

.icon-button-placeholder {
  width: 40px; /* Same as icon-button width */
}

.loading-state, .error-state {
  text-align: center;
  margin-top: 50px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background-color: #424242;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-image {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.history-info {
  padding: 12px;
}

.classification {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.feedback-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.feedback-button {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  flex-grow: 1;
}

.feedback-button.correct {
  border-color: #4caf50;
  color: #4caf50;
}

.feedback-button.wrong {
  border-color: #f44336;
  color: #f44336;
}

.feedback-status {
  margin-top: 12px;
  text-align: center;
}

.correct-text {
  color: #4caf50;
  font-weight: bold;
}

.wrong-text {
  color: #f44336;
  font-weight: bold;
}
</style>