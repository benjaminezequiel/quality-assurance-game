<template>
  <div v-if="sessionCode" class="session-page flex-column">
    <Map
      :bugs="bugs"
      :player-name="playerName || ''"
      :session-code="sessionCode || ''"
    />
    <p>Share the code session to invite your collegues!</p>
    <p>
      Session Code: <b>{{ sessionCode }}</b>
    </p>

    <p>{{ numberofBugs }} bugs submitted.</p>
    <div class="container">
      <h3>{{ players.length }} player{{ players.length > 0 ? "" : "s" }}</h3>
      <div v-for="player in players" :key="player.id" class="player">
        {{ player.name }}
      </div>
    </div>

    <h4>Game phases:</h4>

    <button @click="router.push('report')">SUBMIT NEW BUGS</button>
    <button @click="router.push('bugEvaluation')">EVALUATE BUGS</button>
    <button @click="handleLeave">LEAVE SESSION</button>
  </div>
</template>

<script lang="ts" setup>
import { FetchError } from "ofetch";
import { storeToRefs } from "pinia";
import type { Bug } from "~/components/map.client.vue";

const bugs = ref<Bug[]>([]);
const store = useSessionStore();
const router = useRouter();
const numberofBugs = ref(0);
const { sessionCode, playerName, players } = storeToRefs(store);
const { leaveSession, setPlayerName, fetchPlayers } = store;

let interval: ReturnType<typeof setInterval> | null = null;

const handleLeave = () => {
  leaveSession();
  router.push("/");
};

onMounted(async () => {
  if (!sessionCode.value) return;
  await fetchPlayers();
  interval = setInterval(fetchPlayers, 3000);
  bugs.value = await $fetch(`/api/bugs/${store.sessionCode}`);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

onMounted(() => {
  if (!sessionCode.value) {
    console.log("no current session");
  } else {
    console.log(sessionCode.value);
  }
});
</script>

<style lang="scss" scoped>
p {
  text-wrap: balance;
}

.container {
  background-color: var(--Gray100);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--Gray200);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  border: unset;
  height: 48px;
  border-radius: 6px;
  color: var(--Gray100);
  background-color: var(--Gray900);
  cursor: pointer;
}
</style>
