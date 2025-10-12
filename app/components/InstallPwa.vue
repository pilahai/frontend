<template>
  <!-- <div> -->
  <div v-if="showInstallButton">
    <transition name="slide-up">
      <div
        v-if="!isDismissed"
        class="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg p-4 z-50"
      >
        <button
          @click="dismiss"
          class="absolute right-2 text-gray-500 hover:text-gray-700 transition-colors text-sm close"
        >
          <i class="mdi mdi-close"></i>
        </button>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center flex-auto">
            <img
              src="/logo-pilahai-square-transparent-192.png"
              alt="Pilah AI Logo"
              class="h-12 w-12 mr-4"
            />
            <div>
              <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                Install Pilah AI
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Dapatkan pengalaman terbaik dengan menginstall aplikasi.
              </p>
            </div>
          </div>
          <div class="flex items-center w-52">
            <button
              @click="install"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors w-full"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isDismissed" class="fixed bottom-4 right-4 z-50">
        <button
          @click="showPopup"
          class="bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePwa } from '~/composables/usePwa';

const { showInstallButton, installPwa } = usePwa();
const isDismissed = ref(false);

const install = () => {
  installPwa();
  dismiss();
};

const dismiss = () => {
  isDismissed.value = true;
};

const showPopup = () => {
  isDismissed.value = false;
};
</script>

<style scoped>
.close {
  top: -3.5rem;
}
</style>