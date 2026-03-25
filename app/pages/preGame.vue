<template>
  <div>
    <CustomInput label="Join an existing game" />
    <button>Let's go</button>
    <hr />

    <section v-if="hasSession"></section>
    <section else></section>
  </div>
</template>

<script lang="ts" setup>
const hasSession = ref(false);
</script>
