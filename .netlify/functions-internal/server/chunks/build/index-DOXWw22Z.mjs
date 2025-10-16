import { _ as __nuxt_component_0 } from './nuxt-link-B3d3RGJz.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createBlock, openBlock, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue-router';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Webcam",
  __ssrInlineRender: true,
  props: {
    width: {
      type: [Number, String],
      default: 640
    },
    height: {
      type: [Number, String],
      default: 480
    },
    filter: {
      type: String,
      default: "none"
    },
    autoplay: {
      type: Boolean,
      default: false
    }
  },
  emits: ["snapshot", "stream-started", "stream-stopped", "error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const videoRef = ref(null);
    const canvasRef = ref(null);
    const stream = ref(null);
    const isStreaming = ref(false);
    const isPortrait = ref(false);
    const facingMode = ref("environment");
    const videoStyle = computed(() => ({
      filter: props.filter,
      transform: facingMode.value === "user" ? "scaleX(-1)" : "none",
      width: props.width,
      height: props.height
    }));
    const widthToNumber = computed(() => {
      var videoRefWidth = videoRef.value?.clientWidth;
      return videoRefWidth ?? 0;
    });
    const heightToNumber = computed(() => {
      var videoRefHeight = videoRef.value?.clientHeight;
      return videoRefHeight ?? 0;
    });
    const switchCamera = () => {
      facingMode.value = facingMode.value === "user" ? "environment" : "user";
      startStream();
    };
    const startStream = async () => {
      if (isStreaming.value) {
        stopStream();
      }
      if (!(void 0).mediaDevices || !(void 0).mediaDevices.getUserMedia) {
        emit("error", "Browser tidak mendukung atau stream sudah berjalan.");
        return;
      }
      try {
        isPortrait.value = (void 0).innerHeight > (void 0).innerWidth;
        const videoConstraints = {
          facingMode: facingMode.value
        };
        if (isPortrait.value) {
          videoConstraints.width = { ideal: heightToNumber.value };
          videoConstraints.height = { ideal: widthToNumber.value };
        } else {
          videoConstraints.width = { ideal: widthToNumber.value };
          videoConstraints.height = { ideal: heightToNumber.value };
        }
        const mediaStream = await (void 0).mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
        stream.value = mediaStream;
        if (videoRef.value) {
          videoRef.value.srcObject = mediaStream;
        }
        isStreaming.value = true;
        emit("stream-started", mediaStream);
      } catch (error) {
        console.error("Error saat mengakses webcam:", error);
        emit("error", `Tidak bisa mengakses kamera: ${error}`);
      }
    };
    const stopStream = () => {
      if (!stream.value) return;
      stream.value.getTracks().forEach((track) => track.stop());
      if (videoRef.value) {
        videoRef.value.srcObject = null;
      }
      stream.value = null;
      isStreaming.value = false;
      emit("stream-stopped");
    };
    const takeSnapshot = () => {
      if (!isStreaming.value || !videoRef.value || !canvasRef.value) {
        console.warn("Stream tidak aktif, tidak bisa mengambil snapshot.");
        return null;
      }
      const canvas = canvasRef.value;
      const video = videoRef.value;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (facingMode.value === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        emit("snapshot", dataUrl);
        return dataUrl;
      }
      return null;
    };
    __expose({
      startStream,
      stopStream,
      takeSnapshot,
      isStreaming,
      switchCamera
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "webcam-container" }, _attrs))} data-v-1b294935><video style="${ssrRenderStyle(videoStyle.value)}" autoplay playsinline muted data-v-1b294935></video><canvas${ssrRenderAttr("width", widthToNumber.value)}${ssrRenderAttr("height", heightToNumber.value)} style="${ssrRenderStyle({ "display": "none", "object-fit": "cover" })}" data-v-1b294935></canvas><div class="controls" data-v-1b294935>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Webcam.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const Webcam = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-1b294935"]]), { __name: "Webcam" });
const _imports_0 = publicAssetsURL("/logo-pilahai-square-transparent-192.png");
function usePwa() {
  const deferredPrompt = ref(null);
  const isPwaInstalled = ref(false);
  const showInstallButton = ref(false);
  const installPwa = async () => {
    if (!deferredPrompt.value) {
      return;
    }
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt.value = null;
    showInstallButton.value = false;
  };
  return {
    showInstallButton,
    installPwa,
    isPwaInstalled
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InstallPwa",
  __ssrInlineRender: true,
  setup(__props) {
    const { showInstallButton } = usePwa();
    const isDismissed = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(showInstallButton)) {
        _push(`<div${ssrRenderAttrs(_attrs)} data-v-5a3cf532>`);
        if (!isDismissed.value) {
          _push(`<div class="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg p-4 z-50" data-v-5a3cf532><button class="absolute right-2 text-gray-500 hover:text-gray-700 transition-colors text-sm close" data-v-5a3cf532><i class="mdi mdi-close" data-v-5a3cf532></i></button><div class="flex items-center justify-between gap-4" data-v-5a3cf532><div class="flex items-center flex-auto" data-v-5a3cf532><img${ssrRenderAttr("src", _imports_0)} alt="Pilah AI Logo" class="h-12 w-12 mr-4" data-v-5a3cf532><div data-v-5a3cf532><h3 class="font-bold text-lg text-gray-900 dark:text-white" data-v-5a3cf532> Install Pilah AI </h3><p class="text-sm text-gray-600 dark:text-gray-300" data-v-5a3cf532> Dapatkan pengalaman terbaik dengan menginstall aplikasi. </p></div></div><div class="flex items-center w-52" data-v-5a3cf532><button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors w-full" data-v-5a3cf532> Install </button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isDismissed.value) {
          _push(`<div class="fixed bottom-4 right-4 z-50" data-v-5a3cf532><button class="bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-v-5a3cf532><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5a3cf532><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-5a3cf532></path></svg></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InstallPwa.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const InstallPwa = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-5a3cf532"]]), { __name: "InstallPwa" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const webcamRef = ref(null);
    ref(null);
    const snapshot = ref(null);
    const errorMessage = ref(null);
    const classificationInProgress = ref(false);
    const classificationProgress = ref(0);
    const classificationMessage = ref("");
    const classificationResult = ref(null);
    const classificationError = ref(null);
    const feedbackSent = ref(false);
    const isStreaming = computed(() => webcamRef.value?.isStreaming ?? false);
    const stopCamera = () => {
      webcamRef.value?.stopStream();
    };
    const handleSnapshot = (dataUrl) => {
      console.log("Foto berhasil diambil!");
      stopCamera();
      snapshot.value = dataUrl;
    };
    const handleError = (error) => {
      errorMessage.value = error;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-container" }, _attrs))} data-v-0929da37>`);
      _push(ssrRenderComponent(InstallPwa, null, null, _parent));
      _push(`<div class="camera-ui" data-v-0929da37><div class="top-bar" data-v-0929da37><button class="icon-button" data-v-0929da37><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37><polyline points="15 18 9 12 15 6" data-v-0929da37></polyline></svg></button><div class="page-title" data-v-0929da37><h1 data-v-0929da37>SCAN ITEM</h1><p data-v-0929da37>Place item inside the frame. Please keep your device steady.</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/history",
        class: "icon-button",
        title: "Riwayat"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37${_scopeId}><path d="M12 6v6l4 2" data-v-0929da37${_scopeId}></path><circle cx="12" cy="12" r="10" data-v-0929da37${_scopeId}></circle></svg>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                width: "24",
                height: "24",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, [
                createVNode("path", { d: "M12 6v6l4 2" }),
                createVNode("circle", {
                  cx: "12",
                  cy: "12",
                  r: "10"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="camera-frame" data-v-0929da37></div><div class="bottom-controls" data-v-0929da37><button class="control-button" data-v-0929da37><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37><rect x="3" y="3" width="18" height="18" rx="2" ry="2" data-v-0929da37></rect><circle cx="8.5" cy="8.5" r="1.5" data-v-0929da37></circle><polyline points="21 15 16 10 5 21" data-v-0929da37></polyline></svg></button><button${ssrIncludeBooleanAttr(!isStreaming.value) ? " disabled" : ""} class="control-button capture-button" title="Ambil Foto" data-v-0929da37><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37><circle cx="12" cy="12" r="10" data-v-0929da37></circle></svg></button><button class="control-button" data-v-0929da37><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37><path d="M17 3h-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" data-v-0929da37></path><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" data-v-0929da37></path><path d="m18 9 1-1" data-v-0929da37></path><path d="m21 6-1-1" data-v-0929da37></path></svg></button></div></div>`);
      if (!snapshot.value) {
        _push(ssrRenderComponent(Webcam, {
          ref_key: "webcamRef",
          ref: webcamRef,
          width: "100%",
          height: "100%",
          autoplay: true,
          onSnapshot: handleSnapshot,
          onError: handleError,
          class: "webcam-component"
        }, null, _parent));
      } else if (snapshot.value) {
        _push(`<div class="snapshot-gallery" data-v-0929da37><div class="snapshot-image" style="${ssrRenderStyle({
          backgroundImage: `url(${snapshot.value})`,
          width: "100%",
          height: "100%"
        })}" data-v-0929da37></div><div class="controls" data-v-0929da37><button${ssrIncludeBooleanAttr(isStreaming.value || classificationInProgress.value) ? " disabled" : ""} title="Ambil Ulang" data-v-0929da37><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0929da37><polyline points="1 4 1 10 7 10" data-v-0929da37></polyline><polyline points="23 20 23 14 17 14" data-v-0929da37></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" data-v-0929da37></path></svg></button></div>`);
        if (classificationInProgress.value) {
          _push(`<div class="classification-status" data-v-0929da37><p data-v-0929da37>${ssrInterpolate(classificationMessage.value)}</p><progress${ssrRenderAttr("value", classificationProgress.value)} max="100" data-v-0929da37></progress></div>`);
        } else {
          _push(`<!---->`);
        }
        if (classificationResult.value) {
          _push(`<div class="classification-result" data-v-0929da37><h3 data-v-0929da37>Hasil Klasifikasi</h3><ul data-v-0929da37><li data-v-0929da37>${ssrInterpolate(classificationResult.value.classification.label)}: ${ssrInterpolate((classificationResult.value.classification.probability * 100).toFixed(0))}% </li></ul>`);
          if (!feedbackSent.value) {
            _push(`<div class="feedback-buttons" data-v-0929da37><button class="feedback-button correct" data-v-0929da37>👍 Benar</button><button class="feedback-button wrong" data-v-0929da37>👎 Salah</button></div>`);
          } else {
            _push(`<div class="feedback-thanks" data-v-0929da37><p data-v-0929da37>Terima kasih atas masukan Anda!</p></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (classificationError.value) {
          _push(`<div class="error-message" data-v-0929da37><p data-v-0929da37>⚠️ ${ssrInterpolate(classificationError.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (errorMessage.value && !snapshot.value) {
        _push(`<div class="error-message" data-v-0929da37><p data-v-0929da37>⚠️ ${ssrInterpolate(errorMessage.value)}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-0929da37></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0929da37"]]);

export { index as default };
//# sourceMappingURL=index-DOXWw22Z.mjs.map
