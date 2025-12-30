<script lang="ts">
  import InputVariations from '../../components/prototype/inputs.svelte';
  import DatePickerVariations from '../../components/prototype/date-pickers.svelte';
  import DropdownVariations from '../../components/prototype/dropdowns.svelte';
  import ModalVariations from '../../components/prototype/modals.svelte';
  import ListVariations from '../../components/prototype/lists.svelte';
  import NavigationVariations from '../../components/prototype/navigation.svelte';
  import ColorVariations from '../../components/prototype/colors.svelte';
  import FormLayoutVariations from '../../components/prototype/forms.svelte';

  let activeTab = $state('inputs');
  
  const tabs = [
    { id: 'inputs', label: 'Inputs' },
    { id: 'date-pickers', label: 'Date Pickers' },
    { id: 'dropdowns', label: 'Dropdowns' },
    { id: 'modals', label: 'Modals' },
    { id: 'lists', label: 'Lists & Tables' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'colors', label: 'Colors' },
    { id: 'forms', label: 'Form Layouts' }
  ];
</script>

<main class="container">
  <header>
    <h1>UI Component Prototyping</h1>
    <p>Test different widget variations and select best approaches</p>
  </header>
  
  <nav class="tabs">
    {#each tabs as tab}
      <button
        class:active={activeTab === tab.id}
        on:click={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </nav>
  
  <div class="content">
    {#if activeTab === 'inputs'}
      <svelte:component this={InputVariations} />
    {:else if activeTab === 'date-pickers'}
      <svelte:component this={DatePickerVariations} />
    {:else if activeTab === 'dropdowns'}
      <svelte:component this={DropdownVariations} />
    {:else if activeTab === 'modals'}
      <svelte:component this={ModalVariations} />
    {:else if activeTab === 'lists'}
      <svelte:component this={ListVariations} />
    {:else if activeTab === 'navigation'}
      <svelte:component this={NavigationVariations} />
    {:else if activeTab === 'colors'}
      <svelte:component this={ColorVariations} />
    {:else if activeTab === 'forms'}
      <svelte:component this={FormLayoutVariations} />
    {/if}
  </div>
</main>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
  
  header {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }
  
  p {
    color: #666;
    margin: 0;
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0.5rem;
    overflow-x: auto;
  }
  
  .tabs button {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    white-space: nowrap;
  }
  
  .tabs button:hover {
    background: #f5f5f5;
    color: #333;
  }
  
  .tabs button.active {
    color: #24c8db;
    background: rgba(36, 200, 219, 0.1);
    border-bottom: 2px solid #24c8db;
    margin-bottom: -2.5rem;
    padding-bottom: 1rem;
  }
  
  .content {
    min-height: 600px;
  }
</style>
