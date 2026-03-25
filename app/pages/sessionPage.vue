<template>
  <div class="page-container">
    <div class="header">
      <h1>SESSION OVERVIEW</h1>
      <img src="/logo-min.png" alt="" class="logo" />
    </div>
    <div v-if="sessionCode" class="session-page flex-column">
      <div class="container">
        <p>
          Share the code <b>{{ sessionCode }}</b> to invite your collegues!
        </p>
      </div>

      <details>
        <summary>Read the introduction!</summary>
        <p>
          Welcome to your first day as a Junior QA Tester at Reality Inc. To
          begin your orientation please familiarise yourself with the company
          ethos and quality assurance tasks you will be performing. Here at
          Reality Inc we are dedicated to producing the most realistic game
          environments ever witnessed.
        </p>
        <p>
          In fact you may not have realised but you are already in the game,
          everything around you is an ultra-high resolution depiction of our
          custom designed virtual world. Don’t worry, first time testers are
          often shocked by the verisimilitude.
        </p>
        <p>
          It can take some time to adjust. Join Quality Assurance as a Junior QA
          Tester who is seeking bugs and glitches in the world around us. Treat
          your local environment as an in production virtual environment that
          requires extensive testing to log and correct numerous errors.
        </p>
      </details>
      <span>GAME MAP</span>
      <Map
        :bugs="bugs"
        :player-name="playerName || ''"
        :session-code="sessionCode || ''"
      />

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

b {
  color: var(--green);
}
button {
  border: unset;
  height: 48px;
  border-radius: 6px;
  color: var(--Gray100);
  background-color: var(--Gray900);
  cursor: pointer;
}

.logo {
  max-width: 120px;
  height: fit-content;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 24px;

  h1 {
    font-size: 24px;
    line-height: 100%;
    font-weight: 450;
  }
}

.session-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-container {
  width: 100%;
  height: 100%;
}
details {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  gap: 16px;
  color: var(--green);
  width: 100%;
  margin-bottom: -16px;
  margin-top: -4px;

  p {
    margin-bottom: 24px;
    color: white;
  }
}
</style>
