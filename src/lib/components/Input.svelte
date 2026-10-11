<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue, HTMLInputAttributes } from "svelte/elements";

  type InputType = "text" | "email" | "password" | "search" | "url" | "tel" | "number";
  type Autocomplete = HTMLInputAttributes["autocomplete"];

  interface Props {
    /** Label text. Omit for a visually-hidden label. */
    label?: string;
    hideLabel?: boolean;
    name: string;
    type?: InputType;
    value?: string;
    placeholder?: string;
    /** Validation message. Sets `aria-invalid` and renders in red. */
    error?: string;
    /** Helper text shown under the field. */
    hint?: string;
    icon?: Snippet;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: Autocomplete;
    id?: string;
    class?: ClassValue | string;
  }

  const uid = $props.id();

  let {
    label,
    hideLabel = false,
    name,
    type = "text",
    value = $bindable(""),
    placeholder,
    error,
    hint,
    icon,
    required = false,
    disabled = false,
    autocomplete,
    id = uid,
    class: className = "",
    ...rest
  }: Props & Record<string, unknown> = $props();

  let revealed = $state(false);

  const describedBy = $derived(
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined,
  );
</script>

<div class="input {className}" class:input--invalid={!!error} class:input--disabled={disabled}>
  {#if label}
    <label class="input__label" class:input__label--hidden={hideLabel} for={id}>
      {label}
    </label>
  {/if}

  <div class="input__field">
    {#if icon}
      <span class="input__icon">{@render icon()}</span>
    {/if}

    <input
      {...rest}
      class="input__control"
      {id}
      {name}
      type={revealed ? "text" : type}
      {placeholder}
      {required}
      {disabled}
      {autocomplete}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={describedBy}
      bind:value
    />

    <!-- type toggles the browser's reveal control; this mirrors it for our custom look -->
    {#if type === "password"}
      <button
        class="input__toggle"
        type="button"
        tabindex="-1"
        aria-label={revealed ? "Hide password" : "Show password"}
        onclick={() => (revealed = !revealed)}
      >
        {revealed ? "Hide" : "Show"}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="input__error" id="{id}-error">{error}</p>
  {:else if hint}
    <p class="input__hint" id="{id}-hint">{hint}</p>
  {/if}
</div>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .input {
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.9rem;
      background-color: $color-bg-1;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      transition: border-color 200ms, box-shadow 200ms;

      .input:focus-within & {
        border-color: $color-theme-1;
        box-shadow: 0 0 0 3px rgba($color-theme-1, 0.18);
      }

      .input--invalid & {
        border-color: #ef4444;

        &:focus-within {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
        }
      }

      .input--disabled & {
        opacity: 0.55;
      }
    }

    &__icon {
      display: flex;
      flex-shrink: 0;
      color: $color-text;
      opacity: 0.5;

      :global(svg) {
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    &__control {
      flex: 1;
      min-width: 0;
      padding: 0.75rem 0;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-family: $font-body;
      font-size: 1.4rem;

      &::placeholder {
        color: $color-text;
        opacity: 0.4;
      }

      // hide the native number spinners, we don't style them
      &[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    &__toggle {
      flex-shrink: 0;
      padding: 0.3rem 0.5rem;
      background: none;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: $color-theme-1;
      font-family: $font-mono;
      font-size: 1.1rem;

      &:hover {
        background: rgba($color-theme-1, 0.12);
      }
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