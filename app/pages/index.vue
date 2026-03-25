<template>
  <div class="intro-page">
    <img src="/green-logo.png" alt="" class="logo-img" />
    <p>
      Welcome to your first day as a <b>Junior QA Tester</b> at Reality Inc. To
      begin your orientation please familiarise yourself with the quality
      assurance tasks you will be performing.
    </p>
    <p>
      Here at Reality Inc we are dedicated to producing the
      <b>most realistic game environments</b> ever witnessed. In fact you may
      not have realised but you are already in the game, everything around you
      is an <b>ultra-high resolution depiction</b> of our custom designed
      virtual world.
    </p>
    <p>
      Start by choosing a nickname and either creating a session or joining an
      existing one.
    </p>

    <div class="session-management container">
      <div v-if="sessionCode" class="existing-game flex-column">
        <h3>Welcome, {{ playerName }}.</h3>
        <p class="text-wrap">
          You are participating on session <b>{{ sessionCode }}</b
          >.
        </p>
        <button @click="handleContinue" class="highlight">CONTINUE GAME</button>
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
        <button @click="handleCreate" class="highlight">
          Create New Session
        </button>
        <hr class="divider" />
        <div class="flex-column">
          <CustomInput
            label="Session Code"
            placeholder="XXXXXX"
            v-model="joinSessionCode"
            :error="sessionCodeError"
          />
          <button @click="handleJoin">Join Existing Session</button>
        </div>
      </div>
    </div>
    <p class="footnote">
      * When submitting photographs to Quality Assurance you consent to share
      location data that will be publicly available to other users. Please be
      considerate of personal privacy and seek permission from anyone who is
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
    router.push("/sessionPage");
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
.new-game {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.intro-page {
  display: flex;
  flex-direction: column;
  gap: 16px;

  b {
    color: var(--brand-color);
  }
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

.logo-img {
  max-width: 100%;
  margin-bottom: 24px;
  margin-top: 16px;
}

.footnote {
  color: var(--Gray600);
  width: 100%;
  gap: 0px;
  font-size: 13px;
}
</style>
