<template>
  <label :for="label">{{ label }}</label>

  <select :name="label" id="cars">
    <option value="volvo">Option N</option>
    <option value="saab">Option N</option>
    <option value="mercedes">Option N</option>
    <option value="audi">Option N</option>
  </select>
</template>

<script setup>
defineProps({
  label: String,
});
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

select {
  border-radius: 4px;
  border: unset;
}
</style>
