<template>
  <div class="page-container">
    <span class="nav-button">
      <NuxtLink to="sessionPage"><- BACK TO SESSION OVERVIEW</NuxtLink>
    </span>
    <div v-if="allReviewed" class="all-reviewed">
      <h1>All bugs reviewed!</h1>
    </div>
    <div v-if="bugs.length && currentBug && !allReviewed" class="bug container">
      <div class="bug-header">
        <h3>Bug #{{ currentBugIndex + 1 }}</h3>
        <span>{{ currentBugIndex + 1 }} / {{ bugs.length }}</span>
      </div>
      <img :src="currentBug.image_url" alt="Bug photo" />
      <div class="bug-info">
        <div>{{ currentBug.description }}</div>
        <div><span>CATEGORY:</span> {{ currentBug.category }}</div>
        <div v-if="currentBug.latitude && currentBug.longitude">
          <span>REPORTED LOCATION:</span> {{ currentBug.latitude.toFixed(5) }},
          {{ currentBug.longitude.toFixed(5) }}
        </div>
        <div>
          <span>REPORTED DATE:</span>
          {{ new Date(currentBug.reported_at).toLocaleDateString() }}
        </div>
        <div>
          Reported by <b>{{ currentBug.reported_by }}</b>
        </div>
      </div>

      <div class="button-container">
        <button
          v-for="(label, index) in severityLabels"
          :key="index"
          :class="[
            'severity-' + (index + 1),
            { active: currentVote === index + 1 },
          ]"
          :disabled="submitting"
          @click="handleVote(index + 1)"
        >
          {{ label }}
          <span v-if="currentVote === index + 1">✓</span>
        </button>
      </div>
    </div>

    <div v-else-if="!bugs.length" class="bug">
      <p>No bugs to evaluate in this session yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";

const allReviewed = computed(
  () =>
    bugs.value.length > 0 &&
    bugs.value.every((b) => votesMap.value[b.id] != null),
);

const severityLabels = [
  "NOT A BUG / DUPLICATE",
  "NOT GAMEPLAY RELEVANT",
  "NEEDS FIXING",
  "IMPORTANT BUG",
  "GAME-BREAKING",
];

interface Bug {
  id: number;
  session_code: string;
  image_url: string;
  description: string;
  category: string;
  operating_system: string | null;
  reported_by: string;
  reported_at: string;
  latitude: number | null;
  longitude: number | null;
}

const router = useRouter();
const store = useSessionStore();

if (!store.sessionCode || !store.playerName) {
  router.replace("/");
}

const bugs = ref<Bug[]>([]);
const currentBugIndex = ref(0);
const currentBug = computed(() => bugs.value[currentBugIndex.value]);

const votesMap = ref<Record<number, number>>({});
const duplicatesMap = ref<Record<number, boolean>>({});

const currentVote = computed(() => {
  if (!currentBug.value) return null;
  return votesMap.value[currentBug.value.id] ?? null;
});

const currentIsDuplicate = computed(() => {
  if (!currentBug.value) return false;
  return duplicatesMap.value[currentBug.value.id] ?? false;
});

const submitting = ref(false);

onMounted(async () => {
  if (!store.sessionCode || !store.playerName) return;

  const [fetchedBugs, fetchedVotes] = await Promise.all([
    $fetch<Bug[]>(`/api/bugs/${store.sessionCode}`),
    $fetch<{ bug_id: number; severity: number; is_duplicate: boolean }[]>(
      `/api/votes/${store.sessionCode}`,
      { query: { playerName: store.playerName } },
    ),
  ]);

  // Exclude own bugs and sort chronologically
  bugs.value = fetchedBugs
    .filter((b) => b.reported_by !== store.playerName)
    .sort(
      (a, b) =>
        new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime(),
    );

  fetchedVotes.forEach((v) => {
    if (v.is_duplicate) {
      duplicatesMap.value[v.bug_id] = true;
    } else {
      votesMap.value[v.bug_id] = v.severity;
    }
  });
});

const submitVote = async (
  bugId: number,
  severity: number | null,
  isDuplicate: boolean,
) => {
  submitting.value = true;
  try {
    await $fetch("/api/votes/submit", {
      method: "POST",
      body: { bugId, playerName: store.playerName, severity, isDuplicate },
    });
  } catch (e: unknown) {
    if (e instanceof FetchError) {
      console.error("Failed to submit vote:", e.message);
    }
  } finally {
    submitting.value = false;
  }
};

const handleVote = async (severity: number) => {
  if (!currentBug.value) return;

  votesMap.value[currentBug.value.id] = severity;
  duplicatesMap.value[currentBug.value.id] = false;

  await submitVote(currentBug.value.id, severity, false);

  if (currentBugIndex.value < bugs.value.length - 1) {
    currentBugIndex.value++;
  }
};
</script>

<style lang="scss" scoped>
h3 {
  color: var(--green);
}

.bug {
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bug-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;

  span {
    color: var(--Gray600);
  }
}

img {
  background-color: lightgray;
  border-radius: 8px;
  min-height: 200px;
  margin: 0 -1px;
  width: 100%;
  object-fit: cover;
}

button {
  &.active {
    outline: 2px solid white;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &.severity-1 {
    background-color: var(--Gray600);
  }
  &.severity-2 {
    background-color: var(--blue);
  }
  &.severity-3 {
    background-color: var(--yellow);
  }
  &.severity-4 {
    background-color: var(--orange);
  }
  &.severity-5 {
    background-color: var(--red);
    color: white;
  }
  &.duplicate {
    background-color: var(--Gray600);
    color: white;
  }
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav {
  background-color: var(--green);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  border-radius: 8px;
}

.page-container {
  width: 100%;
}

b {
  color: var(--green);
}

.bug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  span {
    font-size: 13px;
    color: var(--Gray600);
  }
}

.nav-button {
  display: flex;
  padding-bottom: 12px;
}
</style>
