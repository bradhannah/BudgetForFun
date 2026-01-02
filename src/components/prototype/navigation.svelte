<script lang="ts">
  let activeNav1 = $state('dashboard');
  let activeNav2 = $state('dashboard');
  let activeNav3 = $state('dashboard');
  let activeNav4 = $state('dashboard');
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bills', label: 'Bills' },
    { id: 'incomes', label: 'Incomes' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'payment-sources', label: 'Payment Sources' },
    { id: 'settings', label: 'Settings' }
  ];
</script>

<section class="variation-section">
  <h2>Navigation Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Top Navigation Bar</h3>
      <div class="demo">
        <nav class="top-nav">
          <div class="logo">BudgetForFun</div>
          <ul>
            {#each navItems as item}
              <li class:active={activeNav1 === item.id}>
                <button on:click={() => activeNav1 = item.id}>{item.label}</button>
              </li>
            {/each}
          </ul>
        </nav>
        <small>Current: {activeNav1}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Sidebar Navigation</h3>
      <div class="demo">
        <nav class="sidebar-nav">
          <div class="logo">BudgetForFun</div>
          <ul>
            {#each navItems as item}
              <li class:active={activeNav2 === item.id}>
                <button on:click={() => activeNav2 = item.id}>
                  {item.label}
                </button>
              </li>
            {/each}
          </ul>
        </nav>
        <small>Current: {activeNav2}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Tab-based Navigation</h3>
      <div class="demo">
        <nav class="tab-nav">
          {#each navItems as item}
            <button 
              class:active={activeNav3 === item.id}
              on:click={() => activeNav3 = item.id}
            >
              {item.label}
            </button>
          {/each}
        </nav>
        <div class="tab-content">
          <p>Content for: {activeNav3}</p>
        </div>
        <small>Current: {activeNav3}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 4: Bottom Navigation (Mobile)</h3>
      <div class="demo">
        <nav class="bottom-nav">
          {#each navItems.slice(0, 5) as item}
            <button class:active={activeNav4 === item.id} on:click={() => activeNav4 = item.id}>
              {item.label}
            </button>
          {/each}
        </nav>
        <small>Current: {activeNav4}</small>
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
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }
  
  .variation {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
    min-height: 400px;
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
  
  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e0e0e0;
    padding: 1rem;
    background: #fff;
  }
  
  .top-nav .logo {
    font-weight: 600;
    font-size: 1.2rem;
    color: #24c8db;
  }
  
  .top-nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
  }
  
  .top-nav button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
  
  .top-nav li.active button {
    background: #24c8db;
    color: white;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    height: 400px;
    background: #2a2a2a;
    padding: 1.5rem;
  }
  
  .sidebar-nav .logo {
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .sidebar-nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sidebar-nav button {
    background: none;
    border: none;
    color: #ccc;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    text-align: left;
    width: 100%;
  }
  
  .sidebar-nav button:hover {
    background: #3a3a3a;
    color: white;
  }
  
  .sidebar-nav li.active button {
    background: #24c8db;
    color: white;
  }
  
  .tab-nav {
    display: flex;
    gap: 0.5rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0;
    overflow-x: auto;
  }
  
  .tab-nav button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.75rem 1.5rem;
    border-radius: 4px 4px 0 0;
    white-space: nowrap;
  }
  
  .tab-nav button:hover {
    background: #f5f5f5;
  }
  
  .tab-nav button.active {
    background: #24c8db;
    color: white;
  }
  
  .tab-content {
    padding: 2rem;
    background: #f9f9f9;
    min-height: 200px;
  }
  
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    border-top: 2px solid #e0e0e0;
    padding: 1rem;
    background: #fff;
  }
  
  .bottom-nav button {
    background: none;
    border: none;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
    flex: 1;
  }
  
  .bottom-nav button.active {
    background: #24c8db;
    color: white;
  }
  
  small {
    color: #999;
    font-size: 0.85rem;
  }
</style>
