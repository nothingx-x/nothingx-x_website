<script lang="ts">
  import "./layout.scss";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Button from "$lib/components/Button.svelte";
  import { X } from "@lucide/svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<div class="app">
  <Header user={data.user} />

  <main>
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1em 4em;
    width: 100%;
    max-width: 70rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
