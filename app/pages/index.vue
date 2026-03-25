<template>
  <div class="intro-page">
    <h3>Quality Assurance</h3>
    <p>
      Quality Assurance: The Game is an Alternative-Reality-Game (ARG) where you
      play as a Junior QA Tester who is seeking bugs in the world around us.
      Treat your local environment as an in production virtual environment that
      requires extensive testing to log and correct numerous errors. Use your
      phone to upload geo-located photos and complete an error report. Evaluate
      the reports submitted by other players.
    </p>
    <p>
      Currently only a free-roam mode is available, competitive team play modes
      coming soon!
    </p>

    <div class="session-management container">
      <div v-if="sessionCode" class="existing-game flex-column">
        <h3>Welcome, {{ playerName }}.</h3>
        <p>
          You are participating on session <b>{{ sessionCode }}</b
          >.
        </p>
        <button @click="handleContinue">CONTINUE GAME</button>
        <button @click="handleLeave">LEAVE SESSION</button>
      </div>
      <div v-else class="new-game">
        <CustomInput
          label="Nickname"
          v-model="playerNickname"
          :error="nicknameError"
          @blur="validateNickname"
        />
        <hr class="divider" />
        <button @click="handleCreate">Create New Session</button>
        <hr class="divider" />
        <div class="flex-column">
          <CustomInput
            label="Session Code"
            placeholder="XXXXXX"
            v-model="joinSessionCode"
            :error="sessionCodeError"
          />
          <button @click="handleJoin">Join Session</button>
        </div>
      </div>
    </div>
    <p>
      *When submitting photographs to Quality Assurance: The Game you consent to
      share location data that will be publicly available to other users. Please
      be considerate of personal privacy and seek permission from anyone who is
      identifiable in your photographs.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { FetchError } from "ofetch";
import { storeToRefs } from "pinia";

const store = useSessionStore();

const { sessionCode, playerName } = storeToRefs(store);
const { createSession, joinSession, leaveSession, setPlayerName } = store;

// const {
//   sessionCode,
//   createSession,
//   joinSession,
//   leaveSession,
//   playerName,
//   setPlayerName,
// } = useSessionStore();

const router = useRouter();
const playerNickname = ref<string>("");
const joinSessionCode = ref<string>("");
const nicknameError = ref<string | null>(null);
const sessionCodeError = ref<string | null>(null);

onMounted(() => {
  playerNickname.value = playerName.value ?? "";
});

const validateNickname = (): boolean => {
  if (!playerNickname.value.trim()) {
    nicknameError.value = "A nickname is required to play";
    return false;
  }
  nicknameError.value = null;
  return true;
};

const validateSessionCode = (): boolean => {
  if (!joinSessionCode.value.trim()) {
    sessionCodeError.value = "Please enter a session code";
    return false;
  }
  if (joinSessionCode.value.trim().length !== 6) {
    sessionCodeError.value = "Session code must be 6 characters";
    return false;
  }
  sessionCodeError.value = null;
  return true;
};

const handleContinue = () => {
  router.push("sessionPage");
};
const handleLeave = () => {
  leaveSession();
};

const handleCreate = async () => {
  if (!validateNickname()) return;

  setPlayerName(playerNickname.value);
  await createSession();
  router.push("/sessionPage");
};

const handleJoin = async () => {
  if (!validateNickname()) return;
  if (!validateSessionCode()) return;

  try {
    setPlayerName(playerNickname.value);
    await joinSession(joinSessionCode.value);
  } catch (e: unknown) {
    if (e instanceof FetchError && e.status === 404) {
      sessionCodeError.value =
        "Session not found, check the code and try again!";
    } else {
      sessionCodeError.value = "Something went wrong, please try again";
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  background-color: var(--Gray100);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--Gray200);
  overflow: hidden;
}

.new-game {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

button {
  border: unset;
  height: 48px;
  border-radius: 6px;
  color: var(--Gray100);
  background-color: var(--Gray900);
  cursor: pointer;
}

.intro-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.new-game-join {
  width: 100%;
  text-align: center;
  text-transform: uppercase;
}

.divider {
  border: unset;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: "";
    position: absolute;
    height: 1px;
    background-color: var(--Gray200);

    width: 200%;
  }
}

.session-management {
  margin: 16px 0;
}
</style>
