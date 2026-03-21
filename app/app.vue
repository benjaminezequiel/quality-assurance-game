<template>
  <div class="page-wrapper">
    <!-- <NuxtRouteAnnouncer /> -->
    <!-- <NuxtWelcome /> -->
    <NuxtPage />
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
  font-family: sans-serif;
}
.page-wrapper {
  min-height: 100svh;
  padding: 16px;
  width: 100%;
  display: flex;
}

body,
html {
  margin: 0;
  display: flex;
  min-width: 100svw;
  flex: 1;
}

#__nuxt {
  width: 100%;
}
</style>
