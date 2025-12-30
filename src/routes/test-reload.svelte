<script lang="ts">
  let count = $state(0);
</script>

<div>
  <h1>Hot Reload Test Page</h1>
  <p>Count: {count}</p>
  <button on:click={() => count++}>Increment</button>
  <p>Edit this file and save to test hot reload</p>
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
  }
</style>
