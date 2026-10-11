<script lang="ts">
  import PostCard from "$lib/components/PostCard.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Blog · nothingx-x</title>
  <meta name="description" content="Posts and notes by NothingX-X" />
</svelte:head>

<section class="blog">
  <header class="blog__header">
    <h1 class="blog__title">Blog</h1>
    <span class="blog__count">
      {data.posts.length}
      {data.posts.length === 1 ? "post" : "posts"}
    </span>
  </header>

  {#if data.posts.length === 0}
    <p class="blog__empty">Nothing published yet.</p>
  {:else}
    <div class="blog__grid">
      {#each data.posts as post (post.slug)}
        <PostCard {post} excerpt={post.excerpt} />
      {/each}
    </div>
  {/if}
</section>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .blog {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    padding-bottom: 3rem;

    &__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
    }

    &__title {
      margin: 0;
      font-size: 2.4rem;
      text-align: left;

      @media (min-width: $breakpoint-sm) {
        font-size: 3.4rem;
      }
    }

    &__count {
      font-family: $font-mono;
      font-size: 1.1rem;
      opacity: 0.6;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40rem, 1fr));
      gap: 1.5rem;
    }

    &__empty {
      font-size: 1.4rem;
      opacity: 0.6;
    }
  }
</style>