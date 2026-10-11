<script lang="ts">
  import { ImageOff, Loader, Upload, X } from "@lucide/svelte";
  import {
    compressImage,
    formatBytes,
    shouldUseCompressed,
    MAX_UPLOAD_BYTES,
  } from "$lib/image";

  interface Props {
    name?: string;
    /** URL of the already-stored thumbnail, if any. */
    existingUrl?: string;
    /** Shows a "remove" control and reports removal through this callback. */
    onremove?: () => void;
    removed?: boolean;
    label?: string;
    error?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    name = "thumbnail",
    existingUrl,
    onremove,
    removed = $bindable(false),
    label = "Thumbnail",
    error,
    disabled = false,
    class: className = "",
  }: Props = $props();

  let file = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);
  let sizeLabel = $state("");
  let busy = $state(false);
  let localError = $state<string | null>(null);
  let inputEl: HTMLInputElement | undefined = $state();

  // object URLs must be revoked or they pin the blob in memory
  $effect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });

  async function onFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const picked = input.files?.[0];
    localError = null;

    if (!picked) return;

    if (picked.size > MAX_UPLOAD_BYTES) {
      localError = `That image is ${formatBytes(picked.size)}. Please pick one under ${formatBytes(MAX_UPLOAD_BYTES)}.`;
      reset(input);
      return;
    }

    if (!picked.type.startsWith("image/")) {
      localError = "That file is not an image.";
      reset(input);
      return;
    }

    busy = true;
    try {
      const result = await compressImage(picked);
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      // Re-encoding can lose. If it does, keep the source rather than
      // shipping a larger file than the one the user gave us.
      if (shouldUseCompressed(picked.size, result.blob.size)) {
        const compressed = new File(
          [result.blob],
          picked.name.replace(/\.\w+$/, ".webp"),
          { type: result.blob.type },
        );

        // CRITICAL: the browser serialises `input.files` on submit, not our
        // local state. Without this the original file is uploaded and the
        // compression only ever feeds the on-screen preview.
        replaceInputFile(input, compressed);

        file = compressed;
        previewUrl = URL.createObjectURL(result.blob);
        sizeLabel = `${result.width}×${result.height} · ${formatBytes(result.blob.size)} of ${formatBytes(picked.size)}`;
      } else {
        // already compact; leave `input.files` holding the original
        file = picked;
        previewUrl = URL.createObjectURL(picked);
        sizeLabel = `${result.width}×${result.height} · ${formatBytes(picked.size)} (already compact)`;
      }

      removed = false;
    } catch (e) {
      localError = e instanceof Error ? e.message : "Could not process that image.";
      // clear the input too, or the unprocessed original would still submit
      reset(input);
    } finally {
      busy = false;
    }
  }

  function replaceInputFile(input: HTMLInputElement, next: File) {
    const transfer = new DataTransfer();
    transfer.items.add(next);
    input.files = transfer.files;
  }

  function reset(input: HTMLInputElement) {
    input.value = "";
    file = null;
    previewUrl = null;
    sizeLabel = "";
  }

  function clear() {
    // drop it from the input as well, or saving would upload the file the
    // admin just removed
    if (inputEl) inputEl.value = "";
    file = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    sizeLabel = "";
    removed = true;
    onremove?.();
  }

  const shownUrl = $derived(previewUrl ?? existingUrl);
</script>

<div class="picker {className}">
  <span class="picker__label">{label}</span>

  <div class="picker__body">
    <div class="picker__preview" class:picker__preview--empty={!shownUrl || removed}>
      {#if shownUrl && !removed}
        <img src={shownUrl} alt="" />
      {:else}
        <ImageOff size={28} />
      {/if}
    </div>

    <div class="picker__controls">
      <label class="picker__button" class:picker__button--disabled={disabled || busy}>
        {#if busy}
          <Loader class="picker__spin" size={16} />
          Compressing…
        {:else}
          <Upload size={16} />
          {file || existingUrl ? "Replace" : "Choose image"}
        {/if}
        <input
          type="file"
          {name}
          accept="image/png,image/jpeg,image/webp"
          onchange={onFileChange}
          disabled={disabled || busy}
          bind:this={inputEl}
          hidden
        />
      </label>

      {#if sizeLabel}
        <span class="picker__meta">{sizeLabel}</span>
      {:else if existingUrl && !removed}
        <span class="picker__meta">Current thumbnail</span>
      {/if}

      {#if (file || (existingUrl && !removed)) && !disabled}
        <button type="button" class="picker__clear" onclick={clear}>
          <X size={14} />
          Remove
        </button>
      {/if}

      <input type="hidden" name="removeThumbnail" value={removed ? "1" : "0"} />

      {#if localError || error}
        <p class="picker__error">{localError ?? error}</p>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .picker {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    width: 100%;

    &__label {
      font-size: 1.3rem;
      font-weight: 600;
      color: $color-text;
    }

    &__body {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    &__preview {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 12rem;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background-color: $color-bg-1;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: $color-text;
      opacity: 0.5;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__controls {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      min-width: 0;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1rem;
      border: 1px dashed rgba(255, 255, 255, 0.25);
      border-radius: 8px;
      cursor: pointer;
      font-family: $font-body;
      font-size: 1.3rem;
      font-weight: 600;
      color: $color-text;
      transition: border-color 200ms, color 200ms;

      &:hover {
        border-color: $color-theme-1;
        color: $color-theme-1;
      }

      &--disabled {
        opacity: 0.5;
        cursor: progress;
      }
    }

    &__spin {
      animation: picker-spin 900ms linear infinite;
    }

    &__meta {
      font-family: $font-mono;
      font-size: 1.1rem;
      opacity: 0.6;
    }

    &__clear {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0;
      background: none;
      border: none;
      cursor: pointer;
      font-family: $font-mono;
      font-size: 1.1rem;
      color: #ef4444;

      &:hover {
        text-decoration: underline;
      }
    }

    &__error {
      margin: 0;
      font-size: 1.2rem;
      color: #ef4444;
    }
  }

  @keyframes picker-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>