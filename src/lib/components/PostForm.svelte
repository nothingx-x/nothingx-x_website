<script lang="ts">
  import { enhance } from "$app/forms";
  import { untrack } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import ImagePicker from "$lib/components/ImagePicker.svelte";
  import Input from "$lib/components/Input.svelte";
  import Select from "$lib/components/Select.svelte";
  import Textarea from "$lib/components/Textarea.svelte";
  import { Image, Save, Tag, Type } from "@lucide/svelte";
  import { slugify } from "$lib/slug";
  import type { PostErrors } from "$lib/post.server";
  import { Category } from "../../generated/prisma/enums.ts";

  interface PostValues {
    title?: string;
    slug?: string;
    category?: string;
    contentMarkdown?: string;
    published?: boolean;
    thumbnailUrl?: string | null;
  }

  interface Props {
    /** Passed to the form action. */
    action: string;
    submitLabel: string;
    values?: PostValues;
    errors?: PostErrors | null;
    /** Base used for live preview rendering. */
    initialHtml?: string;
  }

  let { action, submitLabel, values = {}, errors = null, initialHtml = "" }: Props =
    $props();

  // `values` is the server's starting state; the form takes ownership after
  // this point, so read it exactly once instead of tracking it.
  const initial = untrack(() => values);
  const initialPreview = untrack(() => initialHtml);

  let title = $state(initial.title ?? "");
  let slug = $state(initial.slug ?? "");
  // once the admin edits the slug by hand we stop deriving it from the title
  let slugTouched = $state(Boolean(initial.slug));
  let contentMarkdown = $state(initial.contentMarkdown ?? "");
  let published = $state(initial.published ?? false);
  let submitting = $state(false);
  let previewHtml = $state(initialPreview);
  let previewPending = $state(false);

  $effect(() => {
    if (!slugTouched) slug = slugify(title);
  });

  // Debounced preview: each change cancels the previous request, so a fast
  // typist doesn't queue a render per keystroke.
  $effect(() => {
    const markdown = contentMarkdown;
    if (!markdown.trim()) {
      previewHtml = "";
      return;
    }

    previewPending = true;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ markdown }),
        });
        if (!response.ok) throw new Error(String(response.status));
        previewHtml = (await response.json()).html;
      } catch {
        // leave the last good render in place; a failed preview shouldn't blank it
      } finally {
        previewPending = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  const categoryOptions = Object.fromEntries(
    Object.values(Category).map((c) => [c, c.toLowerCase()]),
  );
</script>

<form
  class="post-form"
  method="POST"
  {action}
  enctype="multipart/form-data"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      submitting = false;
      await update();
    };
  }}
>
  <div class="post-form__main">
    {#if errors?.form}
      <p class="post-form__alert" role="alert">{errors.form}</p>
    {/if}

    <Input
      label="Title"
      name="title"
      placeholder="Post title"
      value={title}
      error={errors?.title}
      required
    >
      {#snippet icon()}
        <Type />
      {/snippet}
    </Input>

    <Input
      label="Slug"
      name="slug"
      placeholder="post-url"
      bind:value={slug}
      error={errors?.slug}
      hint={errors?.slug ? undefined : "Leave as-is unless you want to change the URL."}
      oninput={() => (slugTouched = true)}
      required
    >
      {#snippet icon()}
        <Tag />
      {/snippet}
    </Input>

    <div class="post-form__row">
      <Select
        label="Category"
        name="category"
        options={categoryOptions}
        value={initial.category ?? "NOTES"}
        error={errors?.category}
      />
    </div>

    <ImagePicker
      existingUrl={initial.thumbnailUrl ?? undefined}
      error={errors?.thumbnail}
    />

    <label class="post-form__publish">
      <input type="checkbox" name="published" value="1" bind:checked={published} />
      <span>
        <strong>Published</strong>
        <em>Unpublished posts are hidden from everyone except admins.</em>
      </span>
    </label>

    <Textarea
      label="Content"
      name="contentMarkdown"
      placeholder="# Hello&#10;&#10;Write markdown…"
      bind:value={contentMarkdown}
      error={errors?.contentMarkdown}
      rows={22}
      maxlength={100000}
    />
  </div>

  <!-- ─── Preview ────────────────────────────────────── -->
  <aside class="post-form__preview">
    <header class="post-form__preview-header">
      <span class="post-form__preview-title">
        <Image size={16} />
        Preview
      </span>
      {#if previewPending}
        <span class="post-form__preview-status">updating…</span>
      {/if}
    </header>

    <div class="post-form__preview-body">
      {#if previewHtml}
        <div class="prose">{@html previewHtml}</div>
      {:else}
        <p class="post-form__preview-empty">Nothing to preview yet.</p>
      {/if}
    </div>
  </aside>

  <div class="post-form__actions">
    <Button size="lg" disabled={submitting}>
      {#snippet icon()}
        <Save />
      {/snippet}
      {submitting ? "Saving…" : submitLabel}
    </Button>
  </div>
</form>

<style lang="scss">
  @import "/src/styles/variables.scss";
  @import "/src/styles/prose.scss";

  .post-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
    width: 100%;
    padding-bottom: 3rem;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: minmax(0, 1fr);
    }

    &__main {
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      min-width: 0;
    }

    &__row {
      display: flex;
      gap: 1rem;

      @media (max-width: $breakpoint-sm) {
        flex-direction: column;
      }
    }

    &__alert {
      margin: 0;
      padding: 0.7rem 1rem;
      font-size: 1.3rem;
      color: #fca5a5;
      background-color: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 8px;
    }

    &__publish {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      padding: 0.9rem 1.1rem;
      background-color: $color-bg-2;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      cursor: pointer;

      input {
        margin-top: 0.3rem;
        accent-color: $color-theme-1;
        width: 1.3rem;
        height: 1.3rem;
        cursor: pointer;
      }

      span {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 1.3rem;
      }

      strong {
        color: white;
      }

      em {
        font-style: normal;
        font-size: 1.15rem;
        opacity: 0.6;
      }
    }

    // ─── Preview pane ─────────────────────────────────
    &__preview {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      position: sticky;
      top: 6rem;
      min-width: 0;

      @media (max-width: $breakpoint-lg) {
        position: static;
      }
    }

    &__preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    &__preview-title {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: $color-text;
      opacity: 0.7;
    }

    &__preview-status {
      font-family: $font-mono;
      font-size: 1.1rem;
      color: $color-theme-1;
    }

    &__preview-body {
      padding: 1.2rem;
      max-height: calc(100vh - 12rem);
      overflow-y: auto;
      scrollbar-width: thin;
      background-color: $color-bg-2;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;

      @media (max-width: $breakpoint-lg) {
        max-height: 50vh;
      }
    }

    &__preview-empty {
      margin: 0;
      font-size: 1.3rem;
      opacity: 0.5;
    }

    &__actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 0.5rem;
    }
  }
</style>