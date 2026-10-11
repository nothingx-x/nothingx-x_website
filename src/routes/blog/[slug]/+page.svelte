<script lang="ts">
  import { ArrowRight, Calendar, Eye, Heart, User } from "@lucide/svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const formattedDate = $derived(
    new Intl.DateTimeFormat("fa", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(data.post.createdAt)),
  );
</script>

<svelte:head>
  <title>{data.post.title} · nothingx-x</title>
  <meta name="description" content={data.post.excerpt} />
</svelte:head>

<article class="post">
  <header class="post__header">
    <a class="post__back" href="/blog">
      <ArrowRight size={16} />
      پست ها
    </a>

    <span class="post__category">{data.post.category.toLowerCase()}</span>

    <h1 class="post__title">{data.post.title}</h1>

    <div class="post__meta">
      <span class="post__meta-item">
        <User size={15} />
        {data.post.authorName}
      </span>
      <span class="post__meta-item">
        <Calendar size={15} />
        <time datetime={new Date(data.post.createdAt).toISOString()}>
          {formattedDate}
        </time>
      </span>
      <span class="post__meta-item"><Eye size={15} /> {data.post.views}</span>
      <span class="post__meta-item"><Heart size={15} /> {data.post.likes}</span>
    </div>
  </header>

  <hr class="post__rule" />

  <!-- markdown rendered and sanitized in markdown.server.ts -->
  <div class="prose">{@html data.post.html}</div>
</article>

<style lang="scss">
  @import "/src/styles/variables.scss";
  @import "/src/styles/prose.scss";

  .post {
    width: 100%;
    max-width: $column-width;
    margin: 0 auto;
    padding: 1rem 0 3rem;
    direction: rtl;

    &__header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
      padding-bottom: 1.4rem;
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

      // the icon points right but we travel left
      :global(svg) {
        transform: rotate(180deg);
      }

      &:hover {
        opacity: 1;
        text-decoration: none;
      }
    }

    &__category {
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: $color-theme-1;
    }

    &__title {
      margin: 0;
      font-size: 2.4rem;
      line-height: 1.3;
      text-align: left;
      text-wrap: balance;

      @media (min-width: $breakpoint-sm) {
        font-size: 3.4rem;
      }
    }

    &__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.6rem 1.2rem;
      font-family: $font-mono;
      font-size: 1.1rem;
      opacity: 0.65;
    }

    &__meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    &__rule {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 0 0 2rem;
    }
  }
</style>