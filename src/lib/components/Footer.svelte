<script lang="ts">
  const yearFull = new Date().getFullYear();
</script>

<footer class="footer">
  <section class="footer__info">
    <p class="footer__info-text">NothingX-X &copy; {yearFull}</p>
  </section>
</footer>

<style lang="scss">
  @import "/src/styles/variables.scss";

  .footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &__info {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0.8em 1.2em;
    }

    &__info {
      background-color: $color-theme-1;
      &-text {
        color: $color-bg-0;
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
  }
</style>
