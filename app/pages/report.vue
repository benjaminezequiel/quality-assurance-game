<template>
  <div class="report-form">
    <span class="nav-button">
      <NuxtLink to="sessionPage"><- BACK TO SESSION OVERVIEW</NuxtLink>
    </span>
    <div class="camera">
      <video ref="video" autoplay playsinline muted></video>
      <canvas ref="canvas" style="display: none" />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden-file-input"
        @change="handleFileUpload"
      />

      <img v-if="capturedImage" :src="capturedImage" class="preview" />

      <div class="camera-controls">
        <template v-if="!capturedImage">
          <button v-if="!cameraActive" @click="startCamera">
            Start Camera
          </button>
          <button
            v-if="cameraActive"
            class="capture"
            @click="capturePhoto"
          ></button>
        </template>
        <button v-if="capturedImage" @click="handleTryAgain">TRY AGAIN</button>
      </div>

      <div
        v-if="cameraActive && !capturedImage && zoomSupported"
        class="zoom-controls"
      >
        <button class="zoom-btn" @click="adjustZoom(-0.5)">−</button>
        <span class="zoom-label">{{ zoom.toFixed(1) }}x</span>
        <button class="zoom-btn" @click="adjustZoom(0.5)">+</button>
      </div>

      <span v-if="errors.image" class="error">{{ errors.image }}</span>
    </div>

    <button
      :disabled="capturedImage !== null"
      @click="fileInput?.click()"
      class="subtle"
    >
      Upload image instead
    </button>

    <CustomInput
      label="Description"
      class="description"
      :textarea="true"
      v-model="form.description"
      :error="errors.description"
    />
    <CustomSelect
      label="Category"
      v-model="form.category"
      :options="categories"
      :error="errors.category"
    />
    <NuxtLink to="typesofBugs"
      >Learn more about the <b>types of bugs</b>!</NuxtLink
    >

    <div class="double-input">
      <CustomInput label="Operating System" v-model="form.operatingSystem" />
      <CustomInput label="Location" :model-value="locationLabel" disabled />
    </div>
    <pre
      v-if="debugError"
      style="
        background: red;
        color: white;
        padding: 8px;
        font-size: 11px;
        white-space: pre-wrap;
        word-break: break-all;
      "
    >
  {{ debugError }}
</pre
    >
    <button @click="handleSubmit" :disabled="submitting" class="highlight">
      {{ submitting ? "Submitting..." : "Submit Bug" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";
import imageCompression from "browser-image-compression";
const debugError = ref<string | null>(null);
const router = useRouter();
const store = useSessionStore();

if (!store.sessionCode) {
  router.replace("/");
}

// Camera
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const cameraActive = ref(false);
const capturedImage = ref<string | null>(null);
const capturedBlob = ref<Blob | null>(null);
let stream: MediaStream | null = null;

// Zoom
const zoom = ref(1);
const zoomMin = ref(1);
const zoomMax = ref(1);
const zoomSupported = ref(false);

const applyZoom = async (value: number) => {
  if (!stream) return;
  const track = stream.getVideoTracks()[0];
  try {
    if (!track) {
      return;
    }
    await track.applyConstraints({ advanced: [{ zoom: value } as any] });
    zoom.value = value;
  } catch {
    zoomSupported.value = false;
  }
};

const adjustZoom = (delta: number) => {
  const next = Math.min(
    zoomMax.value,
    Math.max(zoomMin.value, zoom.value + delta),
  );
  applyZoom(next);
};

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    if (video.value) {
      video.value.srcObject = stream;
      cameraActive.value = true;

      // Check zoom support after stream starts
      const track = stream.getVideoTracks()[0];
      if (!track) {
        return;
      }
      const capabilities = track.getCapabilities() as any;
      if ("zoom" in capabilities) {
        zoomSupported.value = true;
        zoomMin.value = capabilities.zoom.min;
        zoomMax.value = capabilities.zoom.max;
        zoom.value = capabilities.zoom.min;
      }
    }
  } catch (err) {
    console.error("Error accessing camera:", err);
    errors.image = "Could not access camera";
  }
};
const capturePhoto = async () => {
  if (!video.value || !canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  // Set canvas size to video size
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  ctx.drawImage(video.value, 0, 0);

  // Await blob conversion to ensure it's ready
  const blob: Blob | null = await new Promise((resolve) => {
    canvas.value!.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) {
    errors.image = "Failed to capture image";
    return;
  }

  capturedBlob.value = blob;
  capturedImage.value = URL.createObjectURL(blob);
};
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    errors.image = "Please select a valid image file";
    return;
  }

  // Transcode to JPEG via canvas to handle HEIC/HEIF and other mobile formats
  try {
    const bitmap = await createImageBitmap(file);
    const cvs = document.createElement("canvas");
    cvs.width = bitmap.width;
    cvs.height = bitmap.height;
    const ctx = cvs.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      cvs.toBlob(resolve, "image/jpeg", 0.9),
    );

    if (!blob) {
      errors.image = "Failed to process image";
      return;
    }

    capturedBlob.value = blob;
    capturedImage.value = URL.createObjectURL(blob);
  } catch {
    // createImageBitmap may not support HEIC on some browsers — fall back to raw file
    capturedBlob.value = new Blob([file], { type: file.type || "image/jpeg" });
    capturedImage.value = URL.createObjectURL(file);
  }

  stopCamera();
};

const handleTryAgain = () => {
  capturedImage.value = null;
  capturedBlob.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const stopCamera = () => {
  stream?.getTracks().forEach((track) => track.stop());
  cameraActive.value = false;
  zoomSupported.value = false;
  zoom.value = 1;
};

onBeforeUnmount(stopCamera);

// Location
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const locationLabel = ref("Fetching location...");

onMounted(() => {
  if (!navigator.geolocation) {
    locationLabel.value = "Geolocation not supported";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitude.value = pos.coords.latitude;
      longitude.value = pos.coords.longitude;
      locationLabel.value = `${latitude.value.toFixed(5)}, ${longitude.value.toFixed(5)}`;
    },
    () => {
      locationLabel.value = "Location unavailable";
    },
    { enableHighAccuracy: true },
  );
});

// Form
const categories = [
  "Asset Misplacement",
  "Texture Error",
  "NPC Behaviour",
  "NPC Dialogue",
  "Gameplay System Error",
  "Other",
];

const form = reactive({
  description: "",
  category: "",
  operatingSystem: "",
});

const errors = reactive({
  description: null as string | null,
  category: null as string | null,
  image: null as string | null,
});

const submitting = ref(false);

const validate = (): boolean => {
  let valid = true;

  if (!capturedBlob.value) {
    errors.image = "Please capture or upload a photo";
    valid = false;
  } else {
    errors.image = null;
  }

  if (!form.description.trim()) {
    errors.description = "Please describe the bug";
    valid = false;
  } else {
    errors.description = null;
  }

  if (!form.category) {
    errors.category = "Please select a category";
    valid = false;
  } else {
    errors.category = null;
  }

  return valid;
};

const handleSubmit = async () => {
  if (!validate()) return;
  if (!store.sessionCode || !store.playerName) return;

  submitting.value = true;

  try {
    // Ensure blob is properly typed for iOS compatibility
    const blob = capturedBlob.value!;
    const typeHint = blob.type || "image/jpeg";

    const compressed = await imageCompression(
      new File([capturedBlob.value!], "bug.jpg", { type: "image/jpeg" }),
      { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true },
    );

    const formData = new FormData();
    // iOS requires explicit filename as third parameter in FormData.append
    formData.append("image", compressed, "bug.jpg");
    formData.append("sessionCode", store.sessionCode);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("operatingSystem", form.operatingSystem);
    formData.append("reportedBy", store.playerName);
    if (latitude.value) formData.append("latitude", String(latitude.value));
    if (longitude.value) formData.append("longitude", String(longitude.value));

    await $fetch("/api/bugs/upload", { method: "POST", body: formData });
    router.push("/sessionPage");
  } catch (e: unknown) {
    if (e instanceof FetchError) {
      debugError.value = JSON.stringify(
        { status: e.status, data: e.data },
        null,
        2,
      );
      errors.image = e.data?.message ?? "Upload failed, please try again";
    } else {
      debugError.value = String(e);
      errors.image = "Something went wrong, please try again";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.report-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  max-height: 1200px;
  height: 100%;
}

.camera {
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  overflow: hidden;
  background-color: var(--Gray100);
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  aspect-ratio: 1 / 1;
  aspect-ratio: 1 / 1;
  min-height: 280px;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  position: absolute;
  bottom: 16px;
  z-index: 1;
}

.zoom-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  padding: 4px 10px;
}

.zoom-btn {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  min-height: unset;
}

.zoom-label {
  color: white;
  font-size: 0.85rem;
  min-width: 32px;
  text-align: center;
}

.preview {
  position: absolute;
  height: 100%;
  border-radius: 12px;
}

.error {
  position: absolute;
  bottom: 60px;
  color: red;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

button {
  min-height: 32px;
  border: unset;
  border-radius: 6px;
  cursor: pointer;
  background-color: var(--Gray900);
  color: var(--Gray100);
  text-transform: uppercase;

  &:disabled {
    opacity: 0.33;
  }
}

.capture {
  height: 64px;
  width: 64px;
  border-radius: 100%;
  outline: 2px white solid;
  outline-offset: 3px;
}

.double-input {
  display: flex;
  gap: 6px;
  width: 100%;
}

.subtle {
  height: 24px;
  margin-top: -8px;
  background-color: transparent !important;
  text-decoration: underline;
  text-underline-offset: 4px;
  color: var(--Gray600) !important;
}
</style>

<style lang="scss">
.description {
  input {
    width: 32px;
    align-items: flex-start;
    display: flex;
  }
}

.hidden-file-input {
  position: absolute;
  top: -9999px;
  left: -9999px;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
