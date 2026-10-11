<script lang="ts">
  import { PenLine, Plus } from "@lucide/svelte";
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
    <div>
      <h1 class="blog__title">Blog</h1>
      <span class="blog__count">
        {data.posts.length}
        {data.posts.length === 1 ? "post" : "posts"}
      </span>
    </div>

    {#if data.isAdmin}
      <div class="blog__admin">
        <a class="blog__new" href="/blog/new">
          <Plus size={18} />
          New post
        </a>
      </div>
    {/if}
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
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    &__new {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 1.2rem;
      font-family: $font-body;
      font-size: 1.4rem;
      font-weight: 600;
      color: black;
      background-color: $color-theme-1;
      border-radius: 8px;
      text-decoration: none;
      transition: filter 200ms;

      &:hover {
        filter: brightness(1.1);
        text-decoration: none;
      }
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