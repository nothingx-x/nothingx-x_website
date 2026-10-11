<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    label?: string;
    hideLabel?: boolean;
    name: string;
    value?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    /** Live character count against this value. Omit to hide. */
    maxlength?: number;
    class?: ClassValue | string;
  }

  const uid = $props.id();

  let {
    label,
    hideLabel = false,
    name,
    value = $bindable(""),
    placeholder,
    error,
    hint,
    rows = 10,
    required = false,
    disabled = false,
    id = uid,
    maxlength,
    class: className = "",
  }: Props = $props();

  const describedBy = $derived(
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined,
  );
</script>

<div class="textarea {className}" class:textarea--invalid={!!error} class:textarea--disabled={disabled}>
  {#if label}
    <label class="textarea__label" class:textarea__label--hidden={hideLabel} for={id}>
      {label}
    </label>
  {/if}

  <textarea
    class="textarea__control"
    {id}
    {name}
    {rows}
    {placeholder}
    {required}
    {disabled}
    aria-invalid={error ? "true" : undefined}
    aria-describedby={describedBy}
    bind:value
  ></textarea>

  {#if maxlength}
    <div class="textarea__footer">
      {#if error}
        <p class="textarea__error" id="{id}-error">{error}</p>
      {:else if hint}
        <p class="textarea__hint" id="{id}-hint">{hint}</p>
      {/if}
      <span class="textarea__count" class:textarea__count--over={value.length > maxlength}>
        {value.length} / {maxlength}
      </span>
    </div>
  {:else if error}
    <p class="textarea__error" id="{id}-error">{error}</p>
  {:else if hint}
    <p class="textarea__hint" id="{id}-hint">{hint}</p>
  {/if}
</div>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .textarea {
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

    &__control {
      width: 100%;
      padding: 0.8rem 0.9rem;
      background-color: $color-bg-1;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      outline: none;
      color: white;
      font-family: $font-mono;
      font-size: 1.3rem;
      line-height: 1.7;
      resize: vertical;
      transition: border-color 200ms, box-shadow 200ms;

      &::placeholder {
        color: $color-text;
        opacity: 0.4;
      }

      .textarea:focus-within & {
        border-color: $color-theme-1;
        box-shadow: 0 0 0 3px rgba($color-theme-1, 0.18);
      }

      .textarea--invalid & {
        border-color: #ef4444;

        &:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
        }
      }

      .textarea--disabled & {
        opacity: 0.55;
      }
    }

    &__footer {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
    }

    &__count {
      margin-left: auto;
      font-family: $font-mono;
      font-size: 1.1rem;
      opacity: 0.5;
      white-space: nowrap;

      &--over {
        color: #ef4444;
        opacity: 1;
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