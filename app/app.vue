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

@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");

* {
  box-sizing: border-box;
  font-family: "Jetbrains Mono";
  margin: 0;
}
.container {
  background-color: var(--Gray100);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--Gray200);
  overflow: hidden;
}

.page-wrapper {
  min-height: 100svh;
  height: 100%;
  max-width: 600px;
  padding: 28px;
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
  overflow-x: hidden;
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

.text-wrap {
  text-wrap: balance;
}
</style>
