<template>
  <div class="input">
    <label>{{ label }}</label>

    <!-- Input -->
    <input
      v-if="!textarea"
      type="text"
      :placeholder="placeholder"
      :class="{ 'input--error': error }"
      v-model="model"
      @blur="$emit('blur')"
    />

    <!-- Textarea -->
    <textarea
      v-else
      :placeholder="placeholder"
      :class="{ 'input--error': error }"
      v-model="model"
      @blur="$emit('blur')"
    ></textarea>

    <span v-if="error" class="input__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Explicitly type model as string to satisfy v-model
const model = ref<string>("");

defineProps<{
  label?: string;
  placeholder?: string;
  error?: string | null;
  textarea?: boolean; // toggle textarea
}>();

defineEmits(["blur"]);
</script>

<style lang="scss" scoped>
.input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input,
textarea {
  border-radius: 6px;
  padding-left: 8px;
  padding-top: 6px; /* aligns text at top */
  width: 100%;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  font-family: inherit;
  font-size: 1rem;
}

input {
  height: 32px;
}

textarea {
  min-height: 80px;
  resize: none; /* removes the drag handle */
}

.input--error {
  border-color: var(--red-500);
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
