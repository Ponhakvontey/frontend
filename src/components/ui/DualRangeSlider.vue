<template>
  <div class="slider-root">
    <div class="slider-track-wrap">
      <!-- Track background -->
      <div class="slider-track">
        <div class="slider-range" :style="rangeStyle" />
      </div>

      <!-- Tooltip min -->
      <div
        v-if="showTooltip && draggingMin"
        class="thumb-tooltip"
        :style="{ left: `calc(${minPct}% + ${thumbOffset(minPct)}px)` }"
      >
        {{ tooltipContent ? tooltipContent(localMin) : localMin }}
      </div>

      <!-- Tooltip max -->
      <div
        v-if="showTooltip && draggingMax"
        class="thumb-tooltip"
        :style="{ left: `calc(${maxPct}% + ${thumbOffset(maxPct)}px)` }"
      >
        {{ tooltipContent ? tooltipContent(localMax) : localMax }}
      </div>

      <!-- Min thumb -->
      <input
        type="range"
        class="thumb"
        :min="min" :max="max" :step="step"
        :value="localMin"
        @input="onMinInput"
        @pointerdown="draggingMin = true"
      />

      <!-- Max thumb -->
      <input
        type="range"
        class="thumb"
        :min="min" :max="max" :step="step"
        :value="localMax"
        @input="onMaxInput"
        @pointerdown="draggingMax = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: [number, number]
  min: number
  max: number
  step?: number
  showTooltip?: boolean
  tooltipContent?: (value: number) => string
}>(), {
  step: 1,
  showTooltip: false,
})

const emit = defineEmits<{
  'update:modelValue': [[number, number]]
}>()

const localMin   = ref(props.modelValue[0])
const localMax   = ref(props.modelValue[1])
const draggingMin = ref(false)
const draggingMax = ref(false)

watch(() => props.modelValue, ([min, max]) => {
  localMin.value = min
  localMax.value = max
})

const minPct = computed(() => ((localMin.value - props.min) / (props.max - props.min)) * 100)
const maxPct = computed(() => ((localMax.value - props.min) / (props.max - props.min)) * 100)

const rangeStyle = computed(() => ({
  left:  minPct.value + '%',
  width: (maxPct.value - minPct.value) + '%',
}))

// Nudges tooltip inward so it doesn't overflow at the edges
function thumbOffset(pct: number) {
  return -10 + (pct / 100) * 0
}

function onMinInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  localMin.value = Math.min(val, localMax.value - props.step)
  emit('update:modelValue', [localMin.value, localMax.value])
}

function onMaxInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  localMax.value = Math.max(val, localMin.value + props.step)
  emit('update:modelValue', [localMin.value, localMax.value])
}

function onPointerUp() {
  draggingMin.value = false
  draggingMax.value = false
}

onMounted(()  => document.addEventListener('pointerup', onPointerUp))
onUnmounted(() => document.removeEventListener('pointerup', onPointerUp))
</script>

<style scoped>
.slider-root { width: 100%; padding: 4px 0 8px; }

.slider-track-wrap {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

/* ── Track ── */
.slider-track {
  position: absolute;
  left: 0; right: 0;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  pointer-events: none;
}

.slider-range {
  position: absolute;
  height: 100%;
  background: #1e3a5f;
  border-radius: 999px;
}

/* ── Thumbs (two overlapping range inputs) ── */
.thumb {
  position: absolute;
  width: 100%;
  height: 6px;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  outline: none;
  margin: 0;
}

.thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: all;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #1e3a5f;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.thumb::-webkit-slider-thumb:hover,
.thumb:active::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.15);
}

.thumb:focus-visible::-webkit-slider-thumb {
  outline: 3px solid rgba(30, 58, 95, 0.4);
  outline-offset: 2px;
}

.thumb::-moz-range-thumb {
  pointer-events: all;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #1e3a5f;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

/* ── Tooltip ── */
.thumb-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  background: #1e3a5f;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  font-family: Helvetica, Arial, sans-serif;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.thumb-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1e3a5f;
}
</style>
