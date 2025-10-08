import { ref, onMounted } from 'vue'

export function usePwa() {
  const deferredPrompt = ref<Event | null>(null)
  const isPwaInstalled = ref(false)
  const showInstallButton = ref(false)

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      deferredPrompt.value = e
      // Update UI to notify the user they can install the PWA
      showInstallButton.value = true
    })

    window.addEventListener('appinstalled', () => {
      // Hide the app-provided install promotion
      showInstallButton.value = false
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt.value = null
      // Optionally, send analytics event to indicate successful install
      console.log('PWA was installed')
      isPwaInstalled.value = true
    })

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isPwaInstalled.value = true
    }
  })

  const installPwa = async () => {
    if (!deferredPrompt.value) {
      return
    }
    // Show the install prompt
    ;(deferredPrompt.value as any).prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await (deferredPrompt.value as any).userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt.value = null
    showInstallButton.value = false
  }

  return {
    showInstallButton,
    installPwa,
    isPwaInstalled,
  }
}
