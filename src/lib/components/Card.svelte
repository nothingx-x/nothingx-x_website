<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  /** Attributes forwarded to the root element (`aria-*`, `id`, `data-*`, …). */
  type RootAttrs = Record<string, unknown>;

  interface Props {
    title: string;
    href?: string;
    image?: string;
    imageAlt?: string;
    /** Rendered above the title, e.g. a category badge or tag row. */
    badge?: Snippet;
    /** The card body, e.g. an excerpt. */
    children?: Snippet;
    /** Rendered at the bottom, e.g. a date or metadata row. */
    footer?: Snippet;
    padded?: boolean;
    class?: ClassValue | string;
  }

  let {
    title,
    href,
    image,
    imageAlt = "",
    badge,
    children,
    footer,
    padded = true,
    class: className = "",
    ...rest
  }: Props & RootAttrs = $props();
</script>

{#snippet inner()}
  {#if image}
    <div class="card__media">
      <img class="card__image" src={image} alt={imageAlt || title} loading="lazy" />
    </div>
  {/if}

  <div class="card__body" class:card__body--padded={padded}>
    {#if badge}
      <div class="card__badge">{@render badge()}</div>
    {/if}

    <h3 class="card__title">{title}</h3>

    {#if children}
      <div class="card__content">{@render children()}</div>
    {/if}

    {#if footer}
      <div class="card__footer">{@render footer()}</div>
    {/if}
  </div>
{/snippet}

{#if href}
  <a class="card card--link {className}" {href} {...rest}>
    {@render inner()}
  </a>
{:else}
  <article class="card {className}" {...rest}>
    {@render inner()}
  </article>
{/if}

<style lang="scss">
  @import "/src/styles/variables.scss";

  .card {
    direction: rtl;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: $color-bg-2;
    color: $color-text;
    font-family: $font-body;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: transform 200ms, border-color 200ms;

    &--link {
      text-decoration: none;
      color: inherit;

      &:hover,
      &:focus-visible {
        transform: translateY(-4px);
        border-color: $color-theme-1;

        .card__title {
          color: $color-theme-1;
        }
      }
    }

    // ─── Media ───────────────────────────────────────────
    &__media {
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background-color: $color-bg-1;
    }

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    // ─── Body ────────────────────────────────────────────
    &__body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.6rem;

      &--padded {
        padding: 1.2rem;
      }
    }

    &__badge {
      display: flex;
      gap: 0.4rem;
    }

    &__title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1.4;
      color: white;
      transition: color 200ms;
    }

    &__content {
      font-size: 1.3rem;
      line-height: 1.7;

      // keep multi-paragraph excerpts spaced
      :global(p + p) {
        margin-top: 0.6em;
      }
    }

    &__footer {
      margin-top: auto;
      padding-top: 0.4rem;
      font-size: 1.1rem;
      opacity: 0.6;
    }
  }
</style>