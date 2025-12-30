<script lang="ts">
  import { onMount } from 'svelte';
  import MonthSelector from './MonthSelector.svelte';
  import LeftoverCard from './LeftoverCard.svelte';
  import SummaryCards from './SummaryCards.svelte';
  import { currentMonth } from '../../stores/ui';
  import { 
    monthsStore, 
    monthlyLoading, 
    leftover, 
    totalIncome, 
    totalExpenses, 
    netWorth,
    billInstances,
    incomeInstances
  } from '../../stores/months';
  
  // Load data when month changes
  $: {
    if ($currentMonth) {
      monthsStore.loadMonth($currentMonth);
    }
  }
  
  // Format currency helper
  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
  }
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <h1>Dashboard</h1>
    <MonthSelector />
  </header>
  
  <main class="dashboard-content">
    <section class="leftover-section">
      <LeftoverCard leftover={$leftover} loading={$monthlyLoading} />
    </section>
    
    <section class="summary-section">
      <SummaryCards 
        totalIncome={$totalIncome} 
        totalExpenses={$totalExpenses} 
        netWorth={$netWorth}
        loading={$monthlyLoading}
      />
    </section>
    
    <section class="breakdown-section">
      <div class="breakdown-grid">
        <div class="breakdown-card">
          <h3>Bills This Month</h3>
          {#if $monthlyLoading}
            <p class="loading-text">Loading...</p>
          {:else if $billInstances.length === 0}
            <p class="empty-text">No bills configured. <a href="/setup">Set up bills</a></p>
          {:else}
            <ul class="breakdown-list">
              {#each $billInstances as bill}
                <li class="breakdown-item">
                  <span class="item-name">Bill</span>
                  <span class="item-amount">{formatCurrency(bill.amount)}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        
        <div class="breakdown-card">
          <h3>Income This Month</h3>
          {#if $monthlyLoading}
            <p class="loading-text">Loading...</p>
          {:else if $incomeInstances.length === 0}
            <p class="empty-text">No income configured. <a href="/setup">Set up income</a></p>
          {:else}
            <ul class="breakdown-list">
              {#each $incomeInstances as income}
                <li class="breakdown-item">
                  <span class="item-name">Income</span>
                  <span class="item-amount">{formatCurrency(income.amount)}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .dashboard-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0;
  }
  
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .leftover-section {
    /* Hero section for the main metric */
  }
  
  .summary-section {
    /* Grid of summary cards */
  }
  
  .breakdown-section {
    margin-top: 8px;
  }
  
  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .breakdown-card {
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #333355;
    padding: 20px;
  }
  
  .breakdown-card h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 16px 0;
  }
  
  .breakdown-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }
  
  .item-name {
    color: #e4e4e7;
    font-weight: 500;
  }
  
  .item-amount {
    color: #24c8db;
    font-weight: 600;
  }
  
  .loading-text, .empty-text {
    color: #888;
    font-size: 0.875rem;
    text-align: center;
    padding: 20px;
  }
  
  .empty-text a {
    color: #24c8db;
    text-decoration: none;
  }
  
  .empty-text a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
    }
    
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
