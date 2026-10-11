<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Option {
    value: string;
    label?: string;
  }

  interface Props {
    label?: string;
    hideLabel?: boolean;
    name: string;
    /** Options as a plain object; values map to their keys. */
    options?: Record<string, string>;
    /** Or supply options explicitly. */
    items?: Option[];
    value?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    class?: ClassValue | string;
  }

  const uid = $props.id();

  let {
    label,
    hideLabel = false,
    name,
    options,
    items,
    value = $bindable(""),
    error,
    hint,
    required = false,
    disabled = false,
    id = uid,
    class: className = "",
  }: Props = $props();

  const list = $derived(
    items ??
      Object.entries(options ?? {}).map(([v, l]) => ({ value: v, label: l })),
  );
</script>

<div class="select {className}" class:select--invalid={!!error} class:select--disabled={disabled}>
  {#if label}
    <label class="select__label" class:select__label--hidden={hideLabel} for={id}>
      {label}
    </label>
  {/if}

  <div class="select__field">
    <select
      class="select__control"
      {id}
      {name}
      {required}
      {disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      bind:value
    >
      {#each list as option (option.value)}
        <option value={option.value}>{option.label ?? option.value}</option>
      {/each}
    </select>
    <svg class="select__caret" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </div>

  {#if error}
    <p class="select__error" id="{id}-error">{error}</p>
  {:else if hint}
    <p class="select__hint" id="{id}-hint">{hint}</p>
  {/if}
</div>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .select {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    width: 100%;

    &__label {
      font-size: 1.3rem;
      font-weight: 600;
      color: $color-text;

      &--hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    }

    &__field {
      position: relative;
      display: flex;
      align-items: center;

      .select:focus-within & {
        border-color: $color-theme-1;
        box-shadow: 0 0 0 3px rgba($color-theme-1, 0.18);
      }

      .select--invalid & {
        border-color: #ef4444;
      }

      .select--disabled & {
        opacity: 0.55;
      }
    }

    &__control {
      width: 100%;
      padding: 0.75rem 2.4rem 0.75rem 0.9rem;
      appearance: none;
      background-color: $color-bg-1;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      outline: none;
      color: white;
      font-family: $font-body;
      font-size: 1.4rem;
      cursor: pointer;
      transition: border-color 200ms, box-shadow 200ms;

      option {
        background-color: $color-bg-2;
        color: white;
      }
    }

    &__caret {
      position: absolute;
      right: 0.8rem;
      width: 1.2rem;
      height: 1.2rem;
      pointer-events: none;
      color: $color-text;
      opacity: 0.6;
    }

    &__error {
      margin: 0;
      font-size: 1.2rem;
      color: #ef4444;
    }

    &__hint {
      margin: 0;
      font-size: 1.2rem;
      opacity: 0.55;
    }
  }
</style>