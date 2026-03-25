<template>
  <div class="page-wrapper">
    <!-- <NuxtRouteAnnouncer /> -->
    <!-- <NuxtWelcome /> -->
    <!-- <h3>{{ data }}</h3> -->
    <NuxtPage />
    <div class="footer flex-column">
      <hr />
      <p>Reality Inc. 30 Tweedy Rd, Bromley B31 3FE</p>
      <p>Quality Assurance by Reality Inc.</p>
      <p>2026. All rights reserved.</p>
    </div>
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
  overflow-x: hidden;
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

button {
  text-transform: uppercase;
  border: unset;
  height: 48px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--Gray100);
  background-color: var(--Gray900);
  cursor: pointer;

  &.highlight {
    background-color: var(--brand-color);
  }
  &.subtle {
    background-color: var(--Gray200);
    color: var(--Gray800);
  }
  &.extra-subtle {
    background-color: transparent;
    border: 1px solid var(--red);
    color: var(--red);
  }
}

.footer {
  align-items: center;
  color: var(--Gray600);
  width: 100%;
  gap: 0px;
  font-size: 13px;

  hr {
    border-color: var(--Gray100);
    width: 100%;
    margin: 12px 0;
  }
}

details {
  user-select: none;
  display: flex;
  cursor: pointer;
  flex-direction: column;
  gap: 16px;
  color: var(--green);
  width: 100%;
  margin-bottom: -16px;

  p {
    margin-bottom: 24px;
    color: white;
  }
  p:last-child {
    border-bottom: 1px solid var(--Gray200);
    padding-bottom: 16px;
  }
}

a {
  cursor: pointer;
  color: var(--green);
  text-decoration: none;
}
</style>
