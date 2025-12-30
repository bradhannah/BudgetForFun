<script lang="ts">
  import Navigation from '../components/Navigation.svelte';
</script>

<div class="app-layout">
  <Navigation />
  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  :global(:root) {
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    font-weight: 400;

    color: #e4e4e7;
    background-color: #0f0f1a;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-left: 220px;
    padding: 0;
    min-height: 100vh;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
  }
</style>
