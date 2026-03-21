<template>
  <div class="input">
    <label for="">{{ label }}</label>
    <input type="text" :placeholder="placeholder" />
  </div>
</template>

<script setup>
defineProps({
  label: String,
  placeholder: String,
});
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input {
  border-radius: 4px;
  border: unset;
  height: 32px;
}
</style>
