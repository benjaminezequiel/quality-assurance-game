<template>
  <div class="input">
    <label>{{ label }}</label>
    <select v-model="model" :class="{ 'input--error': error }">
      <option disabled value="">Select an option</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <span v-if="error" class="input__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>();
defineProps<{
  label?: string;
  options?: string[];
  error?: string | null;
}>();
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

select {
  border-radius: 6px;
  padding-left: 8px;
  border: 2px solid transparent;
  height: 32px;
  transition: border-color 0.2s;

  &.input--error {
    border-color: red;
  }
}

label {
  padding-left: 4px;
}

.input__error {
  padding-left: 4px;
  font-size: 0.75rem;
  color: red;
}
</style>
