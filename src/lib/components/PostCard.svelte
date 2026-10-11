<script lang="ts">
  import { Eye, Heart } from "@lucide/svelte";
  import Card from "$lib/components/Card.svelte";
  import type { Category } from "../../generated/prisma/enums.ts";

  interface Post {
    slug: string;
    title: string;
    category: Category;
    thumbnailImageRaw?: Uint8Array | null;
    views: number;
    likes: number;
    createdAt: Date;
  }

  interface Props {
    post: Post;
    /** Plain-text excerpt, usually derived from `post.contentMarkdown`. */
    excerpt?: string;
    class?: string;
  }

  let { post, excerpt: excerptText, class: className = "" }: Props = $props();

  const formattedDate = $derived(
    new Intl.DateTimeFormat("fa", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(post.createdAt)),
  );

  const excerpt = $derived(excerptText ?? "");

  const thumbnail = $derived(
    post.thumbnailImageRaw
      ? URL.createObjectURL(new Blob([post.thumbnailImageRaw as BlobPart]))
      : undefined,
  );
</script>

<Card
  class="post-card {className}"
  href="/blog/{post.slug}"
  title={post.title}
  image={thumbnail}
  imageAlt={post.title}
>
  {#snippet badge()}
    <span class="post-card__category">{post.category.toLowerCase()}</span>
  {/snippet}

  <p>{excerpt}</p>

  {#snippet footer()}
    <div class="post-card__meta">
      <span class="post-card__date">{formattedDate}</span>
      <span class="post-card__stats">
        <span class="post-card__stat">
          <Eye size={14} />
          {post.views}
        </span>
        <span class="post-card__stat">
          <Heart size={14} />
          {post.likes}
        </span>
      </span>
    </div>
  {/snippet}
</Card>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .post-card {
    &__category {
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: $color-theme-1;
    }

    &__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      width: 100%;
    }

    &__date {
      font-family: $font-mono;
    }

    &__stats {
      display: flex;
      gap: 0.8rem;
    }

    &__stat {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-family: $font-mono;
    }
  }
</style>