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
  background: #eceef0;
  border-radius: 16px;
  height: 40px;
  width: 248px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: text;
}
.search-icon {
  font-size: 14px;
  color: #9ca3af;
  flex-shrink: 0;
}
.search-box input {
  border: 0;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #6b7280;
  outline: none;
  font-family: inherit;
}
@media (max-width: 760px) {
  .search-box {
    display: none;
  }
}
</style>
