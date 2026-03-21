<template>
  <div class="container">
    <div v-if="bugs.length" class="bug">
      <h3>{{ bugs[currentBugIndex].title }}</h3>
      <div>{{ bugs[currentBugIndex].description }}</div>
      <div>{{ bugs[currentBugIndex].location }}</div>
      <div>{{ bugs[currentBugIndex].date }}</div>
      <div>{{ bugs[currentBugIndex].reportedBy }}</div>
      <img :src="'bugs/' + bugs[currentBugIndex].imgPath + '.png'" alt="" />
      <div class="button-container">
        <button class="severity-1" v-on:click="handleClick">NOT A BUG</button>
        <button class="severity-2" v-on:click="handleClick">
          NOT GAMEPLAY RELEVANT
        </button>
        <button class="severity-3" v-on:click="handleClick">
          NEEDS FIXING
        </button>
        <button class="severity-4" v-on:click="handleClick">
          IMPORTANT BUG
        </button>
        <button class="severity-5" v-on:click="handleClick">
          GAME-BREAKING
        </button>
      </div>
    </div>
    <div class="nav">
      <button :disabled="currentBugIndex === 0" @click="currentBugIndex--">
        Back
      </button>
      <span>{{ currentBugIndex + 1 }} / {{ bugs.length }}</span>
      <button
        :disabled="currentBugIndex === bugs.length - 1"
        @click="currentBugIndex++"
      >
        Forward
      </button>
    </div>
  </div>
</template>

<script setup>
const bugs = ref([]);
const currentBugIndex = ref(0);

const handleClick = () => {
  currentBugIndex.value++;
};

onMounted(() => {
  bugs.value = [
    {
      title: "Random bug",
      description: "This is a description...",
      location: "London, UK",
      date: "2026-03-21",
      reportedBy: "Benjamin E.",
      imgPath: "bug-1",
    },
    {
      title: "Random bug",
      description: "This is a description...",
      location: "London, UK",
      date: "2026-03-21",
      reportedBy: "Benjamin E.",
      imgPath: "bug-2",
    },
    {
      title: "Random bug",
      description: "This is a description...",
      location: "London, UK",
      date: "2026-03-21",
      reportedBy: "Benjamin E.",
      imgPath: "bug-3",
    },
  ];
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h3 {
  margin: 0;
  padding-bottom: 8px;
  color: greenyellow;
}

.bug {
  border-radius: 12px;
  outline: 2px solid green;
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

img {
  background-color: lightgray;
  border-radius: 4px;
  outline: 2px solid green;
  min-height: 200px;
  width: 100%;
  border-radius: 8px;
}

button {
  height: 32px;
  border: unset;
  border-radius: 4px;

  &.severity-1 {
    background-color: gray;
  }
  &.severity-2 {
    background-color: skyblue;
  }
  &.severity-3 {
    background-color: yellow;
  }
  &.severity-4 {
    background-color: orange;
  }
  &.severity-5 {
    background-color: red;
    color: white;
  }
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav {
  background-color: green;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  border-radius: 8px;
}
</style>
