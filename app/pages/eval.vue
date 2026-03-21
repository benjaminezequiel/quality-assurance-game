<template>
  <div class="container">
    <h3>Bug Evaluation</h3>
    <div v-if="bugs.length" class="bug">
      <h3>{{ bugs[currentBugIndex].title }}</h3>
      <div>{{ bugs[currentBugIndex].description }}</div>
      <div>{{ bugs[currentBugIndex].location }}</div>
      <div>{{ bugs[currentBugIndex].date }}</div>
      <div>{{ bugs[currentBugIndex].reportedBy }}</div>
      <img :src="'bugs/' + bugs[currentBugIndex].imgPath + '.png'" alt="" />
      <button v-on:click="handleClick">NOT A BUG</button>
      <button v-on:click="handleClick">NOT GAMEPLAY RELEVANT</button>
      <button v-on:click="handleClick">NEEDS FIXING</button>
      <button v-on:click="handleClick">IMPORTANT BUG</button>
      <button v-on:click="handleClick">GAME-BREAKING</button>
    </div>

    <div>
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
.bug {
  background-color: gray;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 4px;
}

img {
  background-color: lightgray;
  border-radius: 4px;
  min-height: 200px;
  width: 100%;
  border-radius: 8px;
}
</style>
