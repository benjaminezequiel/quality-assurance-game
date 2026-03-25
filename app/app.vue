<template>
  <div class="page-wrapper">
    <!-- <NuxtRouteAnnouncer /> -->
    <!-- <NuxtWelcome /> -->
    <!-- <h3>{{ data }}</h3> -->
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
// const { data } = await useFetch("/api/sessions/create", { method: "POST" });
</script>

<style lang="scss">
@use "./styles/base" as *;

* {
  box-sizing: border-box;
  font-family: monospace;
  margin: 0;
}
.page-wrapper {
  min-height: 100svh;
  height: 100%;
  max-width: 400px;
  padding: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: (--max-width);
}

body,
html {
  margin: 0;
  display: flex;
  background-color: black;
  color: white;
  min-width: 100svw;
  flex: 1;
}

#__nuxt {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
