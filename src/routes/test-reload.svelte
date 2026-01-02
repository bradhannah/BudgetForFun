<!-- Hot reload test endpoint for Bun backend hot reload -->

<script lang="ts">
  let hotReloadCount = $state(0);

  function increment() {
    hotReloadCount++;
  }
</script>

<div>
  <h1>Bun Backend Hot Reload Test</h1>
  <p>Reload count: {hotReloadCount}</p>
  <button on:click={() => increment()}>Test Hot Reload</button>
  <p>Edit <code>api/src/test-endpoint.ts</code> and save to test hot reload</p>
</div>

<style>
  div {
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }
  h1 {
    color: #646cff;
  }
  button {
    padding: 0.5rem 1rem;
    background: #646cff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  button:hover {
    background: #5a5ae2;
    color: white;
  }
  code {
    background: #f0f0f0f0;
    padding: 1rem;
    margin-top: 1rem;
    font-family: monospace;
    font-size: 0.875rem;
    background: #1a1a1a1;
    border-radius: 4px;
    white-space: pre-wrap;
  }
</style>
