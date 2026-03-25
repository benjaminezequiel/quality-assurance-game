<template>
  <div class="results-page">
    <div v-if="pending">Loading results...</div>

    <div v-else-if="results" class="results-container">
      <span class="nav-button">
        <NuxtLink to="sessionPage"><- BACK TO SESSION OVERVIEW</NuxtLink>
      </span>
      <div class="leaderboard container">
        <h2>Leaderboard</h2>
        <div
          v-for="(player, index) in results.leaderboard"
          :key="player.player_name"
          class="player-row"
          :class="index == 0 ? 'first' : ''"
        >
          <span class="position">#{{ index + 1 }}</span>
          <span>{{ player.player_name }}</span>
          <span class="submitted">{{ player.bugs_submitted }} bugs</span>
          <span>{{ player.total_score }} pts</span>
        </div>
      </div>

      <div class="top-bug container flex-column">
        <h3>BUG OF THE DAY</h3>
        <div v-if="results.topBug" class="bug-details">
          <img :src="results.topBug.image_url" alt="Top bug" />
          <div class="text-wrap description">
            {{ results.topBug.description }}
          </div>
          <div>
            <span class="category"> CATEGORY: </span>
            {{ results.topBug.category }}
          </div>
          <div class="report-by">
            <span>
              Reported by <b>{{ results.topBug.reported_by }}</b>
            </span>
            <span class="bug-score">{{ results.topBug.bug_score }} pts</span>
          </div>
        </div>
      </div>

      <hr />
      <h3>ALL THE BUGS REPORTED TODAY</h3>
      <div v-for="bug in results.bugs" :key="bug.id" class="bug container">
        <img :src="bug.image_url" alt="Bug" />
        <div class="text-wrap description">
          {{ bug.description }}
        </div>
        <div>
          <span class="category"> CATEGORY: </span>
          {{ bug.category }}
        </div>
        <div class="report-by">
          <span>
            Reported by <b>{{ bug.reported_by }}</b>
          </span>
          <span class="bug-score">{{ bug.bug_score }} pts</span>
        </div>
      </div>
    </div>
  </div>
  <h1>Thank you for playing!</h1>
</template>

<script setup lang="ts">
const store = useSessionStore();
const router = useRouter();

if (!store.sessionCode) router.replace("/");

interface PlayerScore {
  player_name: string;
  bugs_submitted: number;
  total_score: number;
}

interface BugResult {
  id: number;
  image_url: string;
  description: string;
  category: string;
  reported_by: string;
  reported_at: string;
  vote_count: number;
  avg_severity: number;
  duplicate_count: number;
  bug_score: number;
}

interface Results {
  leaderboard: PlayerScore[];
  bugs: BugResult[];
  topBug: BugResult | null;
}

const { data: results, pending } = await useFetch<Results>(
  `/api/sessions/${store.sessionCode}/results`,
);
</script>

<style lang="scss" scoped>
h2 {
  color: var(--green);
  margin-bottom: 8px;
}

.player-row {
  display: grid;
  display: grid;
  grid-template-columns: auto auto 1fr auto; /* columns 1, 2, 3, 4 */
  grid-auto-rows: auto; /* rows adjust automatically based on content */
  gap: 10px; /* optional spacing between grid items */
  align-items: center;

  &.first {
    height: 32px;
    background-color: var(--Gray200);
    padding: 4px 6px;
    margin: -4px -6px;
    border-radius: 6px;
  }
}

.submitted {
  text-align: right;
  color: var(--Gray600);
}

img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid var(--Gray200);
}
.position {
  color: var(--green);
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results-page {
  margin-top: 24px;
  width: 100%;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

b {
  color: var(--green);
}

.bug-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

hr {
  border-color: color-mix(in oklch, var(--Gray200), transparent 80%);
  margin: 24px 4px;
}

.bug-score {
  color: black;
  font-weight: 800;
  width: fit-content;
  padding: 2px 10px;
  border-radius: 99px;
  background-color: var(--yellow);
}

.description {
  margin-bottom: 6px;
}
.category {
  color: var(--Gray600);
}

.report-by {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

h1 {
  margin: 64px 0;
}
</style>
