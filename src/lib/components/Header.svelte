<script lang="ts">
  import logo from "$lib/images/mongocraft-logo.png?enhanced";
  import Button from "$lib/components/Button.svelte";
  import { Menu, Moon, Sun } from "@lucide/svelte";

  interface IRoute {
    link: string;
    name: string;
  }

  const routes: IRoute[] = [{ link: "/", name: "Home" }];
</script>

<header class="header">
  <div class="header__logo">
    <enhanced:img class="header__logo-image" src={logo} alt="لوگو" />
    <p class="header__logo-text">nothingx-x</p>
  </div>
  <div class="header__btns">
    <Button size="lg" class="header__btns-btn-menu">
      {#snippet icon()}
        <Menu />
      {/snippet}
    </Button>
  </div>
  <nav class="header__nav">
    <ul class="header__nav-list">
      {#each routes as route (route)}
        <li class="header__nav-item">
          <a class="header__nav-link" href={route.link}>{route.name}</a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<style lang="scss">
  @import "/src/styles/variables";

  // More specific selector to override Button's scoped .btn styles
  .header .header__btns {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
  }

  .header :global(.header__btns-btn-menu) {
    display: flex;

    @media (min-width: $breakpoint-md) {
      display: none;
    }
  }

  .header {
    display: flex;
    padding: 0.8em 3.2em;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: $color-theme-1;
    top: 0;
    z-index: 40;
    position: sticky;
    border-radius: 0 0 4px 4px;
    backdrop-filter: blur(4px);
    box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.4);

    &__logo {
      display: flex;
      gap: 1em;
      align-items: center;
      justify-content: center;
    }

    &__logo-image {
      width: 4em;
      height: 4em;
      object-fit: cover;
      border-radius: 4px;
      box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.4);
    }

    &__logo-text {
      color: black;
      font-family: "Delbar", sans-serif;
      font-size: 1.6rem;
      @media (min-width: $breakpoint-sm) {
        font-size: 1.8rem;
      }
    }

    &__nav {
      display: none;
      @media (min-width: $breakpoint-md) {
        display: block;
      }
    }

    &__nav-list {
      list-style: none;
      display: flex;
      gap: 2em;
    }

    &__nav-link {
      color: black;
      text-decoration: none;
      transition: color 200ms;
      cursor: pointer;
      font-size: 1.6rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
