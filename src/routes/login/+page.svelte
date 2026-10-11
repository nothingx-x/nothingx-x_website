<script lang="ts">
  import { enhance } from "$app/forms";
  import { Lock, Mail } from "@lucide/svelte";
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import type { ActionData, PageProps } from "./$types";

  let { data, form }: PageProps & { form: ActionData } = $props();

  let submitting = $state(false);

  const next = $derived(
    new URLSearchParams(typeof window === "undefined" ? "" : location.search).get(
      "next",
    ),
  );
</script>

<svelte:head>
  <title>Login · nothingx-x</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="login">
  <header class="login__header">
    <h1 class="login__title">Welcome back</h1>
    <p class="login__subtitle">Sign in to continue.</p>
  </header>

  <form
    class="login__form"
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        submitting = false;
        await update();
      };
    }}
  >
    {#if form?.error}
      <p class="login__alert" role="alert">{form.error}</p>
    {/if}

    <input type="hidden" name="next" value={next ?? "/"} />

    <Input
      label="Email"
      name="email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
      value={form?.values.email ?? ""}
      required
    >
      {#snippet icon()}
        <Mail />
      {/snippet}
    </Input>

    <Input
      label="Password"
      name="password"
      type="password"
      autocomplete="current-password"
      placeholder="••••••••"
      required
    >
      {#snippet icon()}
        <Lock />
      {/snippet}
    </Input>

    <Button size="lg" class="login__submit" disabled={submitting}>
      {submitting ? "Signing in…" : "Sign in"}
    </Button>
  </form>
</section>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .login {
    // class is passed through to Button, which owns its own scoped styles
    :global(.login__submit) {
      margin-top: 0.4rem;
      width: 100%;
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 26rem;
    margin: 0 auto;
    padding: 3rem 0;

    @media (min-width: $breakpoint-lg) {
      max-width: 80rem;
      padding: 23rem 0;
    }

    &__header {
      text-align: center;
      margin-bottom: 2rem;
    }

    &__title {
      margin: 0 0 0.4rem;
      font-size: 2.6rem;
    }

    &__subtitle {
      margin: 0;
      font-size: 1.4rem;
      opacity: 0.6;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      width: 100%;
      justify-content: center;
      padding: 1.6em;
      background-color: $color-bg-2;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.2rem;
    }

    &__alert {
      margin: 0;
      padding: 0.7rem 1rem;
      font-size: 1.3rem;
      color: #fca5a5;
      background-color: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 8px;
    }
  }
</style>