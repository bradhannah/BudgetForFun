<script lang="ts">
  import { onMount } from 'svelte';
  import MonthSelector from './MonthSelector.svelte';
  import LeftoverCard from './LeftoverCard.svelte';
  import AccountBalancesCard from '../shared/AccountBalancesCard.svelte';
  import CollapsibleSummarySection from './CollapsibleSummarySection.svelte';
  import { currentMonth, wideMode } from '../../stores/ui';
  import { 
    monthsStore, 
    monthlyLoading, 
    leftover, 
    billInstances,
    incomeInstances,
    variableExpenses,
    bankBalances
  } from '../../stores/months';
  import { paymentSources, loadPaymentSources } from '../../stores/payment-sources';
  
  // Load payment sources on mount
  onMount(() => {
    loadPaymentSources();
  });
  
  // Load data when month changes
  $: {
    if ($currentMonth) {
      monthsStore.loadMonth($currentMonth);
    }
  }
  
  // Refresh data after changes
  function handleRefresh() {
    if ($currentMonth) {
      monthsStore.loadMonth($currentMonth);
    }
  }
  
  // Handle bank balance updates
  async function handleUpdateBalances(event: CustomEvent<{ balances: Record<string, number> }>) {
    if ($currentMonth) {
      try {
        await monthsStore.updateBankBalances($currentMonth, event.detail.balances);
        handleRefresh();
      } catch (error) {
        console.error('Failed to update balances:', error);
      }
    }
  }
  
  // Transform bill instances for CollapsibleSummarySection
  $: billItems = $billInstances.map(bill => ({
    id: bill.id,
    name: bill.name,
    expected: bill.amount,
    actual: bill.is_paid ? bill.amount : 0,
    isPaid: bill.is_paid ?? false
  }));
  
  // Transform income instances for CollapsibleSummarySection
  $: incomeItems = $incomeInstances.map(income => ({
    id: income.id,
    name: income.name,
    expected: income.amount,
    actual: income.is_paid ? income.amount : 0,
    isPaid: income.is_paid ?? false
  }));
  
  // Transform variable expenses for CollapsibleSummarySection
  // Variable expenses are always "actual" only - no expected
  $: expenseItems = $variableExpenses.map(expense => ({
    id: expense.id,
    name: expense.name,
    expected: 0,
    actual: expense.amount,
    isPaid: true // Expenses are always "spent"
  }));
  
  // Toggle width mode
  function toggleWideMode() {
    wideMode.toggle();
  }
</script>

<div class="dashboard" class:wide={$wideMode}>
  <header class="dashboard-header">
    <div class="header-left">
      <h1>Dashboard</h1>
    </div>
    <div class="header-right">
      <button 
        class="width-toggle" 
        on:click={toggleWideMode}
        title={$wideMode ? 'Normal width' : 'Wide mode'}
      >
        {#if $wideMode}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M15 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 9L9 12L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9L15 12L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 20H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 4H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M20 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 12L12 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12L12 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </button>
      <MonthSelector />
    </div>
  </header>
  
  <main class="dashboard-content">
    <!-- Account Balances - Top, Editable -->
    <section class="balances-section">
      <AccountBalancesCard
        paymentSources={$paymentSources}
        bankBalances={$bankBalances}
        month={$currentMonth}
        loading={$monthlyLoading}
        on:updateBalances={handleUpdateBalances}
      />
    </section>
    
    <!-- Leftover Card -->
    <section class="leftover-section">
      <LeftoverCard leftover={$leftover} loading={$monthlyLoading} />
    </section>
    
    <!-- Collapsible Sections - All collapsed by default, read-only -->
    <section class="summary-sections">
      <CollapsibleSummarySection
        title="Income"
        items={incomeItems}
        type="income"
        expanded={false}
      />
      
      <CollapsibleSummarySection
        title="Bills"
        items={billItems}
        type="bills"
        expanded={false}
      />
      
      <CollapsibleSummarySection
        title="Variable Expenses"
        items={expenseItems}
        type="expenses"
        expanded={false}
      />
    </section>
  </main>
</div>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    transition: max-width 0.3s ease;
  }
  
  .dashboard.wide {
    max-width: 100%;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .dashboard-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .width-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333355;
    border-radius: 8px;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .width-toggle:hover {
    background: rgba(36, 200, 219, 0.1);
    border-color: #24c8db;
    color: #24c8db;
  }
  
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .summary-sections {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
    }
    
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
