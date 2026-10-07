<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "lg";
    icon?: Snippet;
    children?: Snippet;
    onclick?: () => void;
    disabled?: boolean;
    class?: ClassValue | string;
  }

  let {
    variant = "primary",
    size = "sm",
    icon,
    children,
    onclick,
    disabled,
    class: className = "",
    ...restProps
  }: Props = $props();
</script>

<button class="btn btn--{variant} btn--{size} {className}" {onclick} {disabled}>
  {#if icon}
    <span class="btn__icon">
      {@render icon()}
    </span>
  {/if}
  {#if children}
    <span class="btn__text">{@render children()}</span>
  {/if}
</button>

<style lang="scss">
  @import "/src/styles/variables";

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-family: "Vazirmatn", sans-serif;
    transition: all 200ms;
    font-weight: 600;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    // ─── Sizes ─────────────────────────────────────────
    &--sm {
      padding: 0.4rem 0.8rem;
      font-size: 1.2rem;
    }

    &--md {
      padding: 0.6rem 1.2rem;
      font-size: 1.4rem;
    }

    &--lg {
      padding: 0.8rem 1.6rem;
      font-size: 1.6rem;
    }

    // ─── Variants ──────────────────────────────────────
    &--primary {
      background-color: $color-theme-1;
      color: black;

      &:hover:not(:disabled) {
        background-color: darken($color-theme-1, 10%);
      }
    }

    &--secondary {
      background-color: $color-theme-2;
      color: black;

      &:hover:not(:disabled) {
        background-color: darken($color-theme-2, 10%);
      }
    }

    &--outline {
      background-color: transparent;
      color: $color-theme-1;
      border: 2px solid $color-theme-1;

      &:hover:not(:disabled) {
        background-color: $color-theme-1;
        color: black;
      }
    }

    // ─── Icon ──────────────────────────────────────────
    &__icon {
      display: flex;
      width: 1.2em;
      height: 1.2em;
    }
  }
</style>
