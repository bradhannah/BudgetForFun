<script lang="ts">
  /**
   * AccountBalancesCard - Shows payment sources with editable balances
   * Designed for placement at top of Dashboard and Details views
   * 
   * @prop paymentSources - List of all payment sources
   * @prop bankBalances - Per-month balance overrides (from monthly data)
   * @prop month - Current month (YYYY-MM)
   * @prop loading - Whether data is still loading
   * @prop onUpdateBalances - Callback when balances are updated
   */
  import { createEventDispatcher } from 'svelte';
  import type { PaymentSource } from '../../stores/payment-sources';
  
  export let paymentSources: PaymentSource[] = [];
  export let bankBalances: Record<string, number> = {};
  export let month: string = '';
  export let loading: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  // Editing state
  let editingId: string | null = null;
  let editValue: string = '';
  
  // Get effective balance for a payment source
  // Use per-month override if available, otherwise use the source's current balance
  function getEffectiveBalance(source: PaymentSource): number {
    if (bankBalances[source.id] !== undefined) {
      return bankBalances[source.id];
    }
    return source.balance;
  }
  
  // Calculate totals from effective balances
  $: effectiveBalances = paymentSources.map(ps => ({
    ...ps,
    effectiveBalance: getEffectiveBalance(ps)
  }));
  
  // Separate by type
  $: bankAccounts = effectiveBalances.filter(ps => ps.type === 'bank_account' || ps.type === 'cash');
  $: creditCards = effectiveBalances.filter(ps => ps.type === 'credit_card');
  
  $: totalCash = bankAccounts.reduce((sum, ps) => sum + ps.effectiveBalance, 0);
  $: totalCreditDebt = creditCards.reduce((sum, ps) => sum + ps.effectiveBalance, 0);
  $: netWorth = totalCash - totalCreditDebt;
  
  // Format amount in cents to dollars
  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
  }
  
  // Parse currency input to cents
  function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const dollars = parseFloat(cleaned) || 0;
    return Math.round(dollars * 100);
  }
  
  // Start editing a balance
  function startEdit(source: PaymentSource & { effectiveBalance: number }) {
    editingId = source.id;
    editValue = (source.effectiveBalance / 100).toFixed(2);
  }
  
  // Save edited balance
  async function saveEdit(source: PaymentSource) {
    const newBalance = parseCurrency(editValue);
    const newBalances = { ...bankBalances, [source.id]: newBalance };
    
    dispatch('updateBalances', { balances: newBalances });
    editingId = null;
  }
  
  // Cancel editing
  function cancelEdit() {
    editingId = null;
    editValue = '';
  }
  
  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent, source: PaymentSource) {
    if (event.key === 'Enter') {
      saveEdit(source);
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }
  
  // Get icon for payment source type
  function getTypeIcon(type: string) {
    switch (type) {
      case 'bank_account':
        return '🏦';
      case 'credit_card':
        return '💳';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  }
  
  // Check if balance has been customized for this month
  function isCustomized(source: PaymentSource): boolean {
    return bankBalances[source.id] !== undefined;
  }
</script>

<div class="account-balances-card">
  <div class="card-header">
    <h3 class="card-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Account Balances
    </h3>
    {#if month}
      <span class="month-label">{month}</span>
    {/if}
  </div>
  
  {#if loading}
    <div class="loading-state">Loading...</div>
  {:else if paymentSources.length === 0}
    <p class="empty-message">No accounts set up. <a href="/setup">Add accounts in Setup</a></p>
  {:else}
    <!-- Accounts Grid - horizontal layout -->
    <div class="accounts-grid">
      <!-- Bank Accounts -->
      {#each bankAccounts as source (source.id)}
        <div class="account-item" class:customized={isCustomized(source)}>
          <div class="account-info">
            <span class="account-icon">{getTypeIcon(source.type)}</span>
            <span class="account-name">{source.name}</span>
          </div>
          
          {#if editingId === source.id}
            <div class="edit-container">
              <span class="currency-prefix">$</span>
              <input
                type="text"
                bind:value={editValue}
                on:keydown={(e) => handleKeydown(e, source)}
                on:blur={() => saveEdit(source)}
                class="balance-input"
                autofocus
              />
            </div>
          {:else}
            <button 
              class="balance-button positive"
              on:click={() => startEdit(source)}
              title="Click to edit"
            >
              {formatCurrency(source.effectiveBalance)}
            </button>
          {/if}
        </div>
      {/each}
      
      <!-- Credit Cards -->
      {#each creditCards as source (source.id)}
        <div class="account-item" class:customized={isCustomized(source)}>
          <div class="account-info">
            <span class="account-icon">{getTypeIcon(source.type)}</span>
            <span class="account-name">{source.name}</span>
          </div>
          
          {#if editingId === source.id}
            <div class="edit-container">
              <span class="currency-prefix">$</span>
              <input
                type="text"
                bind:value={editValue}
                on:keydown={(e) => handleKeydown(e, source)}
                on:blur={() => saveEdit(source)}
                class="balance-input"
                autofocus
              />
            </div>
          {:else}
            <button 
              class="balance-button negative"
              on:click={() => startEdit(source)}
              title="Click to edit"
            >
              {formatCurrency(source.effectiveBalance)}
            </button>
          {/if}
        </div>
      {/each}
    </div>
    
    <!-- Summary Totals - horizontal -->
    <div class="totals-row">
      <div class="total-item">
        <span class="total-label">Cash & Bank</span>
        <span class="total-value positive">{formatCurrency(totalCash)}</span>
      </div>
      <div class="total-divider"></div>
      <div class="total-item">
        <span class="total-label">Credit Debt</span>
        <span class="total-value negative">-{formatCurrency(totalCreditDebt)}</span>
      </div>
      <div class="total-divider"></div>
      <div class="total-item">
        <span class="total-label">Net Worth</span>
        <span class="total-value" class:positive={netWorth >= 0} class:negative={netWorth < 0}>
          {formatCurrency(netWorth)}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .account-balances-card {
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #333355;
    padding: 16px 20px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e4e4e7;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .card-title svg {
    color: #24c8db;
  }
  
  .month-label {
    font-size: 0.75rem;
    color: #666;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .loading-state {
    color: #888;
    font-size: 0.875rem;
    text-align: center;
    padding: 20px;
  }
  
  .empty-message {
    color: #666;
    font-size: 0.875rem;
    text-align: center;
    padding: 16px;
    margin: 0;
  }
  
  .empty-message a {
    color: #24c8db;
    text-decoration: none;
  }
  
  .empty-message a:hover {
    text-decoration: underline;
  }
  
  /* Accounts grid - horizontal layout */
  .accounts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .account-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid transparent;
    min-width: 180px;
    flex: 1;
    max-width: 280px;
  }
  
  .account-item.customized {
    border-color: rgba(36, 200, 219, 0.3);
    background: rgba(36, 200, 219, 0.05);
  }
  
  .account-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .account-icon {
    font-size: 1rem;
  }
  
  .account-name {
    font-size: 0.8rem;
    color: #a0a0a0;
    font-weight: 500;
  }
  
  .balance-button {
    background: none;
    border: 1px solid transparent;
    padding: 4px 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    font-family: inherit;
  }
  
  .balance-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #444466;
  }
  
  .balance-button.positive {
    color: #4ade80;
  }
  
  .balance-button.negative {
    color: #f87171;
  }
  
  .edit-container {
    display: flex;
    align-items: center;
    background: #0f0f1a;
    border: 1px solid #24c8db;
    border-radius: 4px;
    padding: 2px 6px;
  }
  
  .currency-prefix {
    color: #888;
    font-size: 0.875rem;
    margin-right: 2px;
  }
  
  .balance-input {
    width: 80px;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    font-family: inherit;
    text-align: right;
    outline: none;
  }
  
  /* Totals row - horizontal */
  .totals-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border-top: 1px solid #333355;
  }
  
  .total-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .total-label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .total-value {
    font-size: 1rem;
    font-weight: 700;
    color: #e4e4e7;
  }
  
  .total-value.positive {
    color: #4ade80;
  }
  
  .total-value.negative {
    color: #f87171;
  }
  
  .total-divider {
    width: 1px;
    height: 30px;
    background: #333355;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .accounts-grid {
      flex-direction: column;
    }
    
    .account-item {
      max-width: none;
    }
    
    .totals-row {
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .total-divider {
      display: none;
    }
  }
</style>
