<template>
  <label class="search-box">
    <i class="fa-solid fa-magnifying-glass search-icon"></i>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      @input="onInput"
      @keydown.enter="onEnter"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    placeholder?: string
    modelValue?: string
  }>(),
  {
    placeholder: 'Search objects...',
    modelValue: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'enter'): void
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onEnter() {
  emit('enter')
}
</script>

<style scoped>
.search-box {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 38px;
  width: 240px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: text;
  transition: border-color 0.18s, background 0.18s;
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

.search-icon {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.search-box input {
  border: 0;
  background: transparent;
  width: 100%;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  font-family: inherit;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}
@media (max-width: 760px) {
  .search-box {
    display: none;
  }
}
</style>
