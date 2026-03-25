<template>
  <div class="page-container">
    <div class="header">
      <h1>SESSION OVERVIEW</h1>
      <img src="/logo-min.png" alt="" class="logo" />
    </div>
    <div v-if="sessionCode" class="session-page flex-column">
      <div class="container">
        <p>
          Share the code <b>{{ sessionCode }}</b> to invite your colleagues!
        </p>
      </div>

      <div class="flex-column instructions">
        <details>
          ]
          <summary>Read the introduction!</summary>
          <p>
            Quality Assurance is an <b>Alternative-Reality-Game (ARG)</b> where
            you play as a Junior QA Tester who is seeking bugs in the world
            around us.
          </p>
          <p>
            Treat your local environment as an in
            <b>production virtual environment</b> that requires extensive
            testing to log and correct numerous errors. Use your phone to upload
            <b>geo-located photos</b> and complete an error report. Evaluate the
            reports submitted by other players.
          </p>
        </details>
        <details>
          <summary>Instructions on how to play</summary>
          <h4>Step 1: Choose an area on the map</h4>
          <p>
            Begin by defining your area of play, click to place each corner
            point. After the fourth point has been placed the system will
            automatically complete a quadrant to de-bug within.
          </p>
          <h4>Step 2: Go on a reporting session!</h4>
          <p>
            Explore the marked locality and look out for any visual, NPC
            behavioural or physics-based bugs that may be the result of human or
            system errors. Strategically organise a route to ensure a
            comprehensive coverage is achieved. If with others you may wish to
            designate sub-sections.
          </p>
          <h4>Step 3: Log your findings!</h4>
          <p>
            Whenever you encounter a bug use the in-app camera system to
            document it. Before submitting you will need to fill out a
            bug-report to help level designers assess and fix it.
          </p>
          <h4>Step 4: Evaluate QA peers!</h4>
          <p>
            Use the map to visit the bug reported by other Quality Assurance
            testers and with the comment + rating system contribute to an
            overall understanding.
          </p>
        </details>
      </div>

      <div class="container session-overview">
        <h4>Performance check</h4>
        <div v-for="player in players" :key="player.id" class="player">
          <span>{{ player.name }}</span>
          <span class="bug-count">
            <button @click="handleKick(player.id)">KICK</button>
            {{ bugCountByPlayer[player.name] ?? 0 }} bugs
          </span>
        </div>
      </div>

      <div class="flex-column">
        <button @click="router.push('report')" class="highlight">
          SUBMIT NEW BUGS
        </button>
        <button @click="router.push('bugEvaluation')">EVALUATE BUGS</button>
        <button @click="router.push('results')" class="subtle">
          Check the results
        </button>
      </div>
      <Map
        :bugs="bugs"
        :player-name="playerName || ''"
        :session-code="sessionCode || ''"
      />
      <div class="flex-column">
        <button @click="handleLeave" class="extra-subtle">LEAVE SESSION</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import type { Bug } from "~/components/map.client.vue";

const bugs = ref<Bug[]>([]);
const store = useSessionStore();
const router = useRouter();
const { sessionCode, playerName, players } = storeToRefs(store);
const { leaveSession, fetchPlayers } = store;

let interval: ReturnType<typeof setInterval> | null = null;

// Derive bug count per player name from the bugs array
const bugCountByPlayer = computed(() =>
  bugs.value.reduce<Record<string, number>>((acc, bug) => {
    acc[bug.reported_by] = (acc[bug.reported_by] ?? 0) + 1;
    return acc;
  }, {}),
);

const handleLeave = () => {
  leaveSession();
  router.push("/");
};

const handleKick = async (playerId: number) => {
  if (!sessionCode.value) return;
  await $fetch(`/api/sessions/${sessionCode.value}/kick`, {
    method: "POST",
    body: { playerId },
  });
  await fetchPlayers();
};

onMounted(async () => {
  if (!sessionCode.value) {
    router.replace("/");
    return;
  }

  await fetchPlayers();
  bugs.value = await $fetch<Bug[]>(`/api/bugs/${sessionCode.value}`);

  // Poll both players and bugs every 5 seconds
  interval = setInterval(async () => {
    await fetchPlayers();
    bugs.value = await $fetch<Bug[]>(`/api/bugs/${sessionCode.value}`);
  }, 5000);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<style lang="scss" scoped>
p {
  text-wrap: balance;
}

b {
  color: var(--green);
}

.logo {
  max-width: 120px;
  height: fit-content;
}

.header {
  width: 100%;
  display: flex;
  height: fit-content;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 24px;

  h1 {
    font-size: 24px;
    line-height: 100%;
    margin: 0;
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

.player {
  display: flex;
  justify-content: space-between;

  .bug-count {
    color: var(--Gray700);

    button {
      height: auto;
      background-color: transparent;
      color: var(--red-500);
      font-size: 14px;
    }
  }
}

.session-overview {
  h4 {
    margin-bottom: 8px;
    color: var(--Gray700);
    text-transform: uppercase;
  }
}
</style>
