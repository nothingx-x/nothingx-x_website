<script lang="ts">
  import { ArrowLeft, ExternalLink } from "@lucide/svelte";
  import PostForm from "$lib/components/PostForm.svelte";
  import type { ActionData, PageProps } from "./$types";

  let { data, form }: PageProps & { form: ActionData } = $props();

  // prefer whatever the user just typed over the stored copy
  const values = $derived(
    form?.values
      ? {
          ...form.values,
          thumbnailUrl: data.post.thumbnailUrl,
        }
      : {
          ...data.post,
          category: data.post.category,
        },
  );
</script>

<svelte:head>
  <title>Edit {data.post.title} · nothingx-x</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="editor">
  <header class="editor__header">
    <a class="editor__back" href="/blog">
      <ArrowLeft size={16} />
      All posts
    </a>

    <div class="editor__heading">
      <h1 class="editor__title">Edit post</h1>
      {#if !data.post.published}
        <span class="editor__badge">Draft</span>
      {/if}
    </div>

    <p class="editor__meta">Last updated {data.post.updatedLabel}</p>

    <a class="editor__view" href="/blog/{data.post.slug}">
      <ExternalLink size={16} />
      View post
    </a>
  </header>

  <PostForm action="?/save" submitLabel="Save changes" {values} errors={form?.errors} />
</section>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .editor {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    padding-bottom: 3rem;

    &__header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
    }

    &__back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: $font-mono;
      font-size: 1.1rem;
      color: $color-text;
      opacity: 0.65;
      text-decoration: none;
      transition: opacity 200ms;

      &:hover {
        opacity: 1;
        text-decoration: none;
      }
    }

    &__heading {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      flex-wrap: wrap;
    }

    &__title {
      margin: 0;
      font-size: 2.4rem;
      text-align: left;

      @media (min-width: $breakpoint-sm) {
        font-size: 3.2rem;
      }
    }

    &__badge {
      padding: 0.25rem 0.8rem;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: $color-theme-1;
      background-color: rgba($color-theme-1, 0.12);
      border: 1px solid rgba($color-theme-1, 0.3);
      border-radius: 999px;
    }

    &__meta {
      margin: 0;
      font-family: $font-mono;
      font-size: 1.1rem;
      opacity: 0.55;
    }

    &__view {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.9rem;
      font-size: 1.4rem;
      font-weight: 600;
      color: $color-text;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      text-decoration: none;
      transition: border-color 200ms, color 200ms;

      &:hover {
        border-color: $color-theme-1;
        color: $color-theme-1;
        text-decoration: none;
      }
    }
  }
</style>