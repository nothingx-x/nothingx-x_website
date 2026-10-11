<script lang="ts">
    import logo from "$lib/images/profile.png?enhanced";
    import {goto} from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import {LogIn, LogOut, Menu, Moon, PenLine, Sun} from "@lucide/svelte";
    import type {SessionUser} from "$lib/auth.server";

    interface IRoute {
        link: string;
        name: string;
    }

    const routes: IRoute[] = [
        {link: "/", name: "Home"},
        {link: "/blog", name: "Blog (Persian)"},
        {link: "https://github.com/nothingx-x", name: "Github"},
        {link: "https://t.me/dont_be_nothing", name: "Telegram"}
    ];

    interface Props {
        user?: SessionUser | null;
    }

    let {user = null}: Props = $props();
</script>

<header class="header">
    <a href="/">
        <div class="header__logo">
            <enhanced:img class="header__logo-image" src={logo} alt="لوگو"/>
            <p class="header__logo-text">nothingx-x</p>
        </div>
    </a>
    <nav class="header__nav">
        <ul class="header__nav-list">
            {#each routes as route (route)}
                <li class="header__nav-item">
                    <a class="header__nav-link" href={route.link}>{route.name}</a>
                </li>
            {/each}
        </ul>
    </nav>
    <div class="header__btns">
        {#if user}
            {#if user.role === "ADMIN"}
                <a class="header__new" href="/blog/new">
                    <PenLine/>
                    New
                </a>
            {/if}
            <form method="POST" action="/logout">
                <Button size="lg" class="header__btns-btn-auth" variant="secondary">
                    {#snippet icon()}
                        <LogOut/>
                    {/snippet}
                    {user.name}
                </Button>
            </form>
        {:else}
            <Button size="lg" class="header__btns-btn-auth" variant="secondary" onclick={() => goto("/login")}>
                {#snippet icon()}
                    <LogIn/>
                {/snippet}
                Login
            </Button>
        {/if}
        <Button size="lg" class="header__btns-btn-menu">
            {#snippet icon()}
                <Menu/>
            {/snippet}
        </Button>
    </div>

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

    &__new {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      padding: 0.8rem 1.6rem;
      font-family: "Vazirmatn", sans-serif;
      font-size: 1.4rem;
      font-weight: 600;
      color: black;
      background-color: $color-theme-1;
      border: 2px solid black;
      border-radius: 6px;
      text-decoration: none;
      transition: transform 200ms;

      &:hover {
        transform: translateY(-2px);
        text-decoration: none;
      }

      :global(svg) {
        width: 1.3em;
        height: 1.3em;
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
      align-items: center;
      justify-content: space-between;
      gap: 4em;
    }

    &__nav-list :nth-child(3) &__nav-link,
    &__nav-list :nth-child(4) &__nav-link {
      color: darken($color-theme-2, 10%);
      font-size: 1.2rem;
    }

    &__nav-list :nth-child(3) &__nav-link {
      margin-left: 2em;
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
