<script lang="ts">
  import { page } from '$app/stores';
  
  $: currentPath = $page.url.pathname;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/setup', label: 'Setup', icon: 'settings' }
  ];
</script>

<nav class="sidebar">
  <div class="sidebar-header">
    <h2>BudgetForFun</h2>
  </div>
  
  <ul class="nav-list">
    {#each navItems as item}
      <li>
        <a 
          href={item.path} 
          class="nav-item"
          class:active={currentPath === item.path}
        >
          {#if item.icon === 'dashboard'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          {:else if item.icon === 'settings'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
            </svg>
          {/if}
          <span>{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .sidebar {
    width: 220px;
    height: 100vh;
    background: #1a1a2e;
    border-right: 1px solid #333355;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
  }
  
  .sidebar-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid #333355;
  }
  
  .sidebar-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #24c8db;
    margin: 0;
  }
  
  .nav-list {
    list-style: none;
    padding: 12px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: #888;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .nav-item:hover {
    background: rgba(36, 200, 219, 0.1);
    color: #e4e4e7;
  }
  
  .nav-item.active {
    background: #24c8db;
    color: #000;
  }
  
  .nav-item svg {
    flex-shrink: 0;
  }
</style>
