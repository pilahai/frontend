import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "history",
  __ssrInlineRender: true,
  setup(__props) {
    const history2 = ref([]);
    const loading = ref(true);
    const error = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-container" }, _attrs))} data-v-f59bc622><div class="top-bar" data-v-f59bc622><button class="icon-button" data-v-f59bc622><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-f59bc622><polyline points="15 18 9 12 15 6" data-v-f59bc622></polyline></svg></button><div class="page-title" data-v-f59bc622><h1 data-v-f59bc622>RIWAYAT KLASIFIKASI</h1></div><div class="icon-button-placeholder" data-v-f59bc622></div></div>`);
      if (loading.value) {
        _push(`<div class="loading-state" data-v-f59bc622><p data-v-f59bc622>Loading history...</p></div>`);
      } else if (error.value) {
        _push(`<div class="error-state" data-v-f59bc622><p data-v-f59bc622>⚠️ ${ssrInterpolate(error.value)}</p></div>`);
      } else {
        _push(`<div class="history-list" data-v-f59bc622><!--[-->`);
        ssrRenderList(history2.value, (item) => {
          _push(`<div class="history-item" data-v-f59bc622><img${ssrRenderAttr("src", item.image_url)} alt="Classified Image" class="history-image" data-v-f59bc622><div class="history-info" data-v-f59bc622><p class="classification" data-v-f59bc622>${ssrInterpolate(item.classification.label)}: ${ssrInterpolate((item.classification.probability * 100).toFixed(0))}% </p>`);
          if (item.feedback === null && !item.feedbackSent) {
            _push(`<div class="feedback-buttons" data-v-f59bc622><button class="feedback-button correct" data-v-f59bc622>👍 Benar</button><button class="feedback-button wrong" data-v-f59bc622>👎 Salah</button></div>`);
          } else {
            _push(`<div class="feedback-status" data-v-f59bc622>`);
            if (item.feedback === "correct") {
              _push(`<p class="correct-text" data-v-f59bc622>Anda menandai ini sebagai Benar</p>`);
            } else {
              _push(`<!---->`);
            }
            if (item.feedback === "wrong") {
              _push(`<p class="wrong-text" data-v-f59bc622>Anda menandai ini sebagai Salah</p>`);
            } else {
              _push(`<!---->`);
            }
            if (item.feedbackSent) {
              _push(`<p data-v-f59bc622>Terima kasih atas masukan Anda!</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/history.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const history = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f59bc622"]]);

export { history as default };
//# sourceMappingURL=history-Cojr1A85.mjs.map
