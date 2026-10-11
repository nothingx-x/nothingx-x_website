<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import { Book, Code, Send, User } from "@lucide/svelte";
  import character from "$lib/images/character.png?enhanced"

  interface IProject {
    name: string;
    description: string;
    startedAt: Date;
    endedAt?: Date;
    type?: "public" | "private";
  }

  const skills = [
    "C++",
    "Java",
    "TypeScript",
    "Go",
    "Zig",
    "Git",
    "Linux",
    "Docker",
  ];

  const projects: IProject[] = [
    {
      name: "BrawlProAd",
      description:
        "A Telegram bot that let users trade their Brawl Stars accounts, with account listings, buyer-seller messaging, and a complete end-to-end purchase flow.",
      startedAt: new Date(2026, 5, 1),
      endedAt: new Date(2026, 6, 1),
      type: "private",
    },
    {
      name: "Angels Vs Demons",
      description:
        "A hero-collector, base-building game made with Godot, combining hero progression with stronghold construction.",
      startedAt: new Date(2026, 7, 1),
      type: "private",
    },
    {
      name: "MongoLauncher",
      description:
        "A Minecraft launcher built for Iranian players, focused on a simple and reliable setup experience.",
      startedAt: new Date(2026, 7, 30),
      type: "public",
    },
    {
      name: "MongoCraft",
      description:
        "A large-scale MMORPG server built on Minecraft, with custom gameplay systems and long-term progression.",
      startedAt: new Date(2025, 10, 4),
      type: "private",
    },
  ];
</script>

<svelte:head>
  <title>nothingx-x</title>
  <meta name="description" content="" />
</svelte:head>

<section class="hero">
  <enhanced:img class="hero__image" src={character} alt="Nothingx-x"/>
  <h1 class="hero__title">
    Hello, its <span>Nothingx-x</span>
  </h1>
  <h2>Who Am I?</h2>
  <p>
    I'm Sajjad (known as nothingx-x) — a curious developer with +4 years of
    experience in programming. I don't claim to be an expert; I just enjoy the
    process of learning and building things out.
  </p>
  <div class="hero__cta">
    <Button size="lg" onclick={() => goto("#projects")}>
      {#snippet icon()}
        <User />
      {/snippet}
      My Projects
    </Button>
    <Button variant="outline" size="lg" onclick={() => goto("#contact")}>
      {#snippet icon()}
        <Book />
      {/snippet}
      Call me
    </Button>
  </div>
</section>

<section>
  <h2>What I build?</h2>
  <p>
    Mostly game-related stuff, but I'll jump into a new field if it sounds
    interesting. I work across backend and frontend, and I'm not afraid to pick
    up a new stack when a project calls for it.
  </p>
</section>

<section class="skills">
  <h2>Skills</h2>
  <div class="skills__list">
    {#each skills as skill (skill)}
      <Button class="badge" variant="outline">{skill}</Button>
    {/each}
  </div>
</section>

<section id="projects" class="projects">
  <h2>My Projects</h2>
  <p>
    Most of my work lives in private repositories, so there isn't much I can
    show off publicly yet. That said, here's a look at what I've been building:
  </p>
  {#each projects as project (project)}
    <div class="projects__card">
      <span
        class="projects__badge"
        class:projects__badge--private={project.type !== "public"}
      >
        {project.type === "public" ? "Public" : "Private"}
      </span>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <span class="projects__date"
        >Started: {project.startedAt.toLocaleDateString()} - {project.endedAt
          ? project.endedAt.toLocaleDateString()
          : "Present"}</span
      >
    </div>
  {/each}
</section>

<section id="contact" class="contact">
  <h2>Call me</h2>
  <p>
    Got a project in mind, a question, or just want to talk shop? My DMs are
    always open — reach out and let's build something.
  </p>
  <div class="contact__links">
    <a
      class="contact__link"
      href="https://t.me/dont_be_nothing"
      target="_blank"
      rel="noreferrer"
    >
      <Send />
      Telegram
    </a>
    <a
      class="contact__link"
      href="https://github.com/nothingx-x"
      target="_blank"
      rel="noreferrer"
    >
      <Code />
      GitHub
    </a>
  </div>
</section>

<style lang="scss">
  @import "/src/styles/variables";
  section {
    margin-bottom: 6em;
  }
  .hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
    position: relative;

    &__image {
      aspect-ratio: 16 / 9;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 12px;
      overflow: hidden;
    }
    &__title span {
      color: $color-theme-1;
    }

    &__cta {
      display: flex;
      gap: 1em;
    }
  }

  .skills {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1em;
    margin-bottom: 6em;

    &__list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
      justify-content: center;
      gap: 1em;
    }

    &__list :global(.badge) {
      background-color: #000;
      border-radius: 999px;
      font-weight: bold;
    }
  }

  .projects {
    display: grid;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1em;

    &__card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.9em;
      align-items: center;
      justify-content: center;
      padding: 2.4em 1.8em 1.4em;
      background: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0)
        ),
        $color-bg-2;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1.2em;
      transition:
        transform 200ms ease,
        border-color 200ms ease,
        box-shadow 200ms ease;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba($color-theme-1, 0.55);
        box-shadow:
          0 14px 34px rgba(0, 0, 0, 0.45),
          0 0 0 1px rgba($color-theme-1, 0.2);
      }

      h3 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
        color: #fff;
      }

      p {
        margin: 0;
        font-size: 1.3rem;
        line-height: 1.5;
        color: $color-text;
        text-wrap-style: balance;
      }
    }

    &__badge {
      position: absolute;
      top: 0.9em;
      right: 0.9em;
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      padding: 0.25em 0.8em;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #4ade80;
      background-color: rgba(74, 222, 128, 0.12);
      border: 1px solid rgba(74, 222, 128, 0.4);
      border-radius: 999px;

      &::before {
        content: "";
        width: 0.5em;
        height: 0.5em;
        border-radius: 50%;
        background-color: currentColor;
      }

      &--private {
        color: rgba(255, 16, 16, 0.6);
        background-color: rgba(12, 1, 1, 0.08);
        border-color: rgba(85, 4, 4, 0.2);
      }
    }

    &__date {
      padding: 0.3em 0.9em;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: $color-theme-1;
      background-color: rgba($color-theme-1, 0.12);
      border: 1px solid rgba($color-theme-1, 0.3);
      border-radius: 999px;
    }
  }

  .contact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;

    &__links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1em;
      margin-top: 0.5em;
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.6em;
      padding: 0.8em 1.4em;
      font-size: 1.5rem;
      font-weight: 600;
      color: $color-theme-1;
      text-decoration: none;
      background: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0)
        ),
        $color-bg-2;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1.2em;
      transition:
        transform 200ms ease,
        border-color 200ms ease,
        box-shadow 200ms ease;

      :global(svg) {
        width: 1.2em;
        height: 1.2em;
        flex-shrink: 0;
      }

      &:hover {
        text-decoration: none;
        transform: translateY(-4px);
        border-color: rgba($color-theme-1, 0.55);
        box-shadow:
          0 14px 34px rgba(0, 0, 0, 0.45),
          0 0 0 1px rgba($color-theme-1, 0.2);
      }
    }
  }

  p {
    font-size: 1.6rem;
    text-wrap: pretty;
    text-align: center;
  }
</style>
