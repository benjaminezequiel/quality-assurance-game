import { defineStore } from "pinia";

interface Player {
  id: number;
  session_code: string;
  name: string;
  created_at: string;
}

export const useSessionStore = defineStore("session", {
  state: () => ({
    sessionCode: null as string | null,
    currentPlayer: null as Player | null,
    playerName: null as string | null,
    players: [] as Player[],
  }),

  actions: {
    setPlayerName(name: string) {
      if (!name?.trim()) throw new Error("Invalid player name");
      this.playerName = name.trim();
    },

    async createSession() {
      if (!this.playerName) throw new Error("Player name is required");

      const data = await $fetch<{ code: string }>("/api/sessions/create", {
        method: "POST",
      });
      if (!data?.code) throw new Error("Failed to create session");

      this.sessionCode = data.code;
      await this._joinSessionAs(data.code, this.playerName);
    },

    async joinSession(code: string) {
      if (!code?.trim()) throw new Error("Invalid session code");
      if (!this.playerName) throw new Error("Player name is required");

      const upper = code.trim().toUpperCase();

      try {
        this.sessionCode = upper;
        await this._joinSessionAs(upper, this.playerName);
      } catch (error: any) {
        this.sessionCode = null; // rollback

        if (error?.status === 404) {
          throw new Error("Session not found");
        }

        throw new Error("Failed to join session");
      }
    },

    async _joinSessionAs(code: string, name: string) {
      const player = await $fetch<Player>(`/api/sessions/${code}/join`, {
        method: "POST",
        body: { name },
      });
      if (!player?.id) throw new Error("Failed to join session");
      this.currentPlayer = player;
    },

    async fetchPlayers() {
      if (!this.sessionCode) return;
      this.players = await $fetch<Player[]>(
        `/api/sessions/${this.sessionCode}/players`,
      );
    },

    leaveSession() {
      this.sessionCode = null;
      this.currentPlayer = null;
      this.players = [];
    },
  },

  persist: true,
});
