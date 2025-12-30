<script lang="ts">
  let showModal1 = $state(false);
  let showModal2 = $state(false);
  let showModal3 = $state(false);
  let showModal4 = $state(false);
</script>

<section class="variation-section">
  <h2>Modal Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Centered Modal with Backdrop</h3>
      <div class="demo">
        <button on:click={() => showModal1 = true}>Open Modal</button>
        
        {#if showModal1}
          <div class="modal-backdrop" on:click={() => showModal1 = false}>
            <div class="modal-centered" on:click|stopPropagation>
              <h3>Edit Bill</h3>
              <p>Edit the bill details below.</p>
              <div class="modal-actions">
                <button class="secondary" on:click={() => showModal1 = false}>Cancel</button>
                <button class="primary">Save</button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Right-side Drawer/Modal</h3>
      <div class="demo">
        <button on:click={() => showModal2 = true}>Open Drawer</button>
        
        {#if showModal2}
          <div class="drawer-backdrop" on:click={() => showModal2 = false}>
            <div class="drawer-right" on:click|stopPropagation>
              <h3>Edit Bill</h3>
              <p>Edit the bill details below.</p>
              <div class="drawer-actions">
                <button class="secondary" on:click={() => showModal2 = false}>Cancel</button>
                <button class="primary">Save</button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Inline Editing (No Modal)</h3>
      <div class="demo">
        <button on:click={() => showModal3 = true}>Edit Inline</button>
        
        {#if showModal3}
          <div class="inline-edit">
            <h3>Edit Bill</h3>
            <p>Edit the bill details below.</p>
            <div class="inline-actions">
              <button class="secondary" on:click={() => showModal3 = false}>Cancel</button>
              <button class="primary">Save</button>
            </div>
          </div>
        {:else}
          <div class="inline-view">
            <h3>Rent</h3>
            <p>$1,500.00 - Monthly</p>
            <button on:click={() => showModal3 = true}>Edit</button>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 4: Full-screen Modal</h3>
      <div class="demo">
        <button on:click={() => showModal4 = true}>Open Full Screen</button>
        
        {#if showModal4}
          <div class="fullscreen-modal">
            <div class="fullscreen-content">
              <h3>Edit Bill</h3>
              <p>Edit the bill details below.</p>
              <div class="fullscreen-actions">
                <button class="secondary" on:click={() => showModal4 = false}>Cancel</button>
                <button class="primary">Save</button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .variation-section {
    padding: 1rem;
  }
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: #1a1a1a;
  }
  
  .variations {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  .variation {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
    min-height: 300px;
  }
  
  .variation h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .demo button {
    padding: 0.75rem 1.5rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .demo button:hover {
    background: #1fb5c7;
  }
  
  .modal-backdrop, .drawer-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-centered {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-centered h3 {
    margin: 0 0 0.5rem 0;
  }
  
  .modal-centered p {
    margin: 0 0 1.5rem 0;
    color: #666;
  }
  
  .modal-actions, .drawer-actions, .fullscreen-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  
  .modal-actions button, .drawer-actions button, .fullscreen-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .primary {
    background: #24c8db;
    color: white;
  }
  
  .secondary {
    background: #f5f5f5;
    color: #333;
  }
  
  .drawer-right {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background: white;
    padding: 2rem;
    box-shadow: -4px 0 6px rgba(0, 0, 0, 0.1);
  }
  
  .drawer-right h3 {
    margin: 0 0 0.5rem 0;
  }
  
  .drawer-right p {
    margin: 0 0 1.5rem 0;
    color: #666;
  }
  
  .inline-edit, .inline-view {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    background: #f9f9f9;
  }
  
  .inline-edit h3, .inline-view h3 {
    margin: 0 0 0.5rem 0;
  }
  
  .inline-edit p, .inline-view p {
    margin: 0 0 1rem 0;
    color: #666;
  }
  
  .inline-view button {
    padding: 0.5rem 1rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .inline-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .inline-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1000;
  }
  
  .fullscreen-content {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .fullscreen-content h3 {
    margin: 0 0 0.5rem 0;
  }
  
  .fullscreen-content p {
    margin: 0 0 1.5rem 0;
    color: #666;
  }
</style>
