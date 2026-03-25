<template>
  <div class="container">
    <div v-if="bugs.length && currentBug" class="bug">
      <img :src="currentBug.image_url" alt="Bug photo" />
      <div class="bug-info">
        <h3>Bug #{{ currentBugIndex + 1 }}</h3>
        <div>{{ currentBug.description }}</div>
        <div>{{ currentBug.category }}</div>
        <div v-if="currentBug.latitude && currentBug.longitude">
          📍 {{ currentBug.latitude.toFixed(5) }},
          {{ currentBug.longitude.toFixed(5) }}
        </div>
        <div>
          🕐 {{ new Date(currentBug.reported_at).toLocaleDateString() }}
        </div>
        <div>👤 {{ currentBug.reported_by }}</div>
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

    <div v-else class="bug">
      <p>No bugs reported in this session yet.</p>
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

<script setup lang="ts">
import { FetchError } from "ofetch";

// Easily changeable client-side labels
const severityLabels = [
  "NOT A BUG",
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

// Track votes as a map of bugId -> severity for instant UI feedback
const votesMap = ref<Record<number, number>>({});

const currentVote = computed(() => {
  if (!currentBug.value) return null;
  return votesMap.value[currentBug.value.id] ?? null;
});
const submitting = ref(false);

onMounted(async () => {
  if (!store.sessionCode || !store.playerName) return;

  const [fetchedBugs, fetchedVotes] = await Promise.all([
    $fetch<Bug[]>(`/api/bugs/${store.sessionCode}`),
    $fetch<{ bug_id: number; severity: number }[]>(
      `/api/votes/${store.sessionCode}`,
      { query: { playerName: store.playerName } },
    ),
  ]);

  bugs.value = fetchedBugs;

  // Populate the votes map from existing votes
  fetchedVotes.forEach((v) => {
    votesMap.value[v.bug_id] = v.severity;
  });
});

const handleVote = async (severity: number) => {
  if (!store.playerName || !currentBug.value) return;

  submitting.value = true;

  try {
    await $fetch("/api/votes/submit", {
      method: "POST",
      body: {
        bugId: currentBug.value.id,
        playerName: store.playerName,
        severity,
      },
    });

    // Update local map immediately for snappy UI
    votesMap.value[currentBug.value.id] = severity;

    // Move to next bug automatically if not on the last one
    if (currentBugIndex.value < bugs.value.length - 1) {
      currentBugIndex.value++;
    }
  } catch (e: unknown) {
    if (e instanceof FetchError) {
      console.error("Failed to submit vote:", e.message);
    }
  } finally {
    submitting.value = false;
  }
};
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

.bug-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
}

img {
  background-color: lightgray;
  border-radius: 8px;
  min-height: 200px;
  width: 100%;
  object-fit: cover;
}

button {
  height: 32px;
  border: unset;
  border-radius: 4px;
  cursor: pointer;
  opacity: 1;
  transition:
    opacity 0.2s,
    outline 0.1s;

  &.active {
    outline: 2px solid white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

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
