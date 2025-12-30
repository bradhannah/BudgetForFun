<script lang="ts">
  let selectedDropdown1 = $state('');
  let selectedDropdown2 = $state('');
  let selectedDropdown3 = $state('');
  let searchQuery = $state('');
  
  const billingPeriods = [
    'Monthly',
    'Bi-weekly',
    'Weekly',
    'Semi-annually'
  ];
  
  const categories = [
    'Housing',
    'Utilities',
    'Food & Groceries',
    'Transportation',
    'Insurance',
    'Entertainment',
    'Healthcare',
    'Other'
  ];
  
  const paymentSources = [
    { id: '1', name: 'Scotia Checking', type: 'Bank Account' },
    { id: '2', name: 'Visa', type: 'Credit Card' },
    { id: '3', name: 'Cash', type: 'Cash' }
  ];
  
  const filteredSources = $derived(
    paymentSources.filter(ps => 
      ps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<section class="variation-section">
  <h2>Dropdown Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Native Select</h3>
      <div class="demo">
        <label>Billing Period</label>
        <select bind:value={selectedDropdown1}>
          <option value="">Select...</option>
          {#each billingPeriods as period}
            <option>{period}</option>
          {/each}
        </select>
        <small>Selected: {selectedDropdown1 || 'None'}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Custom Dropdown with Search</h3>
      <div class="demo">
        <label>Payment Source</label>
        <div class="custom-dropdown">
          <input 
            type="text" 
            placeholder="Search..." 
            bind:value={searchQuery} 
          />
          <div class="dropdown-list">
            {#if filteredSources.length === 0}
              <div class="no-results">No results</div>
            {:else}
              {#each filteredSources as source}
                <div class="dropdown-item">
                  <span class="name">{source.name}</span>
                  <span class="type">{source.type}</span>
                </div>
              {/each}
            {/if}
          </div>
        </div>
        <small>Search query: {searchQuery || 'None'}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Custom Dropdown with Categories</h3>
      <div class="demo">
        <label>Category</label>
        <div class="categorized-dropdown">
          <div class="category-group">
            <div class="category-header">Essential</div>
            {#each ['Housing', 'Utilities', 'Food & Groceries', 'Transportation', 'Insurance'] as cat}
              <div class="category-item">{cat}</div>
            {/each}
          </div>
          <div class="category-group">
            <div class="category-header">Discretionary</div>
            {#each ['Entertainment', 'Healthcare', 'Other'] as cat}
              <div class="category-item">{cat}</div>
            {/each}
          </div>
        </div>
        <small>Click item to select</small>
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
  }
  
  .variation h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  select, input {
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  select:focus, input:focus {
    outline: none;
    border-color: #24c8db;
    box-shadow: 0 0 0 2px rgba(36, 200, 219, 0.2);
  }
  
  .custom-dropdown {
    position: relative;
  }
  
  .custom-dropdown input {
    width: 100%;
  }
  
  .dropdown-list {
    border: 1px solid #ccc;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 0.25rem;
  }
  
  .dropdown-item {
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .dropdown-item:hover {
    background: #f5f5f5;
  }
  
  .dropdown-item .name {
    font-weight: 500;
  }
  
  .dropdown-item .type {
    font-size: 0.85rem;
    color: #999;
  }
  
  .no-results {
    padding: 1rem;
    color: #999;
    text-align: center;
  }
  
  .categorized-dropdown {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .category-group {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .category-header {
    background: #f9f9f9;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .category-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .category-item:hover {
    background: #f5f5f5;
    cursor: pointer;
  }
  
  .category-item:last-child {
    border-bottom: none;
  }
  
  small {
    color: #999;
    font-size: 0.85rem;
  }
</style>
