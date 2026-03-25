<template>
  <div class="input">
    <label>{{ label }}</label>
    <input
      type="text"
      :placeholder="placeholder"
      :class="{ 'input--error': error }"
      v-model="model"
      @blur="$emit('blur')"
    />
    <span v-if="error" class="input__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
const model = defineModel();
defineProps<{
  label?: string;
  placeholder?: string;
  error?: string | null;
}>();

defineEmits(["blur"]);
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input {
  border-radius: 6px;
  padding-left: 8px;
  width: 100%;
  border: 2px solid transparent;
  height: 32px;
  transition: border-color 0.2s;

  &.input--error {
    border-color: var(--red-500);
  }
}

label {
  padding-left: 4px;
  width: 100%;
}

.input__error {
  padding-left: 4px;
  font-size: 1rem;
  color: var(--red-500);
}
</style>
