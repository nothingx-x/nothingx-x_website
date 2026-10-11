<script lang="ts">
  import PostForm from "$lib/components/PostForm.svelte";
  import type { ActionData, PageProps } from "./$types";

  let { form }: PageProps & { form: ActionData } = $props();
</script>

<svelte:head>
  <title>New post · nothingx-x</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="editor">
  <header class="editor__header">
    <h1 class="editor__title">New post</h1>
  </header>

  <PostForm
    action="?/create"
    submitLabel="Create post"
    values={form?.values}
    errors={form?.errors}
  />
</section>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .editor {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    padding-bottom: 3rem;

    &__title {
      margin: 0;
      font-size: 2.4rem;
      text-align: left;

      @media (min-width: $breakpoint-sm) {
        font-size: 3.2rem;
      }
    }
  }
</style>