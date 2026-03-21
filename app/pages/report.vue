<template>
  <div class="form">
    <h1>Reality Inc.</h1>
    <h3>Report a bug</h3>
    <div class="camera">
      <video ref="video" autoplay playsinline class="camera"></video>
      <button @click="startCamera">Start Camera</button>
    </div>
    <customInput label="Location" />
    <customInput label="Date" />
    <customSelect label="Category" />
    <customInput label="Description" />
    <customInput label="Operational System" />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";

const video = ref(null);
let stream = null;

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (err) {
    console.error("Error accessing camera:", err);
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style lang="scss">
.form {
  background-color: gray;
  border-radius: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
  border: 2px solid black;
}

.camera {
  overflow: hidden;
  background-color: black;
  border-radius: 12px;
  position: relative;
  display: flex;
  border: 1px solid black;
}

video {
  width: 100%;
}

button {
  position: absolute;
  margin: 8px;
}

h1,
h3 {
  margin: 0;
}
</style>
