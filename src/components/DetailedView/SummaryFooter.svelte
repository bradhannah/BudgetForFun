<script lang="ts">
  import type { LeftoverBreakdown } from '../../stores/detailed-month';
  
  export let breakdown: LeftoverBreakdown;
  export let bankBalancesMap: Record<string, number> = {};
  
  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
  }
  
  function formatSignedCurrency(cents: number, isExpense: boolean = false): string {
    const dollars = Math.abs(cents) / 100;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
    return isExpense && cents !== 0 ? `-${formatted}` : formatted;
  }
  
  $: totalBankBalance = Object.values(bankBalancesMap).reduce((sum, b) => sum + b, 0);
  $: hasBalances = Object.keys(bankBalancesMap).length > 0;
  $: leftoverClass = breakdown.leftover < 0 ? 'negative' : 'positive';
</script>

<div class="summary-footer">
  <h3>Summary</h3>
  
  {#if !breakdown.hasActuals}
    <div class="no-actuals-message">
      <p>Enter actual amounts to see your leftover calculation.</p>
      <p class="hint">When you enter payments or mark items as paid, the leftover will update.</p>
    </div>
  {:else}
    <div class="breakdown">
      <!-- Bank Balances -->
      {#if hasBalances}
        <div class="breakdown-row">
          <span class="breakdown-label">Bank Balances</span>
          <span class="breakdown-value">{formatCurrency(totalBankBalance)}</span>
        </div>
        <div class="breakdown-detail">
          {#each Object.entries(bankBalancesMap) as [name, balance]}
            <span class="balance-item">{name}: {formatCurrency(balance)}</span>
          {/each}
        </div>
      {:else}
        <div class="breakdown-row muted">
          <span class="breakdown-label">Bank Balances</span>
          <span class="breakdown-value">Not set</span>
        </div>
      {/if}
      
      <!-- Actual Income -->
      <div class="breakdown-row">
        <span class="breakdown-label">Actual Income</span>
        <span class="breakdown-value income">+{formatCurrency(breakdown.actualIncome)}</span>
      </div>
      
      <!-- Actual Expenses (combined) -->
      <div class="breakdown-row">
        <span class="breakdown-label">Actual Expenses</span>
        <span class="breakdown-value expense">{formatSignedCurrency(breakdown.totalExpenses, true)}</span>
      </div>
      
      {#if breakdown.actualBills > 0 || breakdown.variableExpenses > 0 || breakdown.freeFlowingExpenses > 0}
        <div class="breakdown-detail expense-detail">
          {#if breakdown.actualBills > 0}
            <span class="expense-item">Bills: {formatCurrency(breakdown.actualBills)}</span>
          {/if}
          {#if breakdown.variableExpenses > 0}
            <span class="expense-item">Variable: {formatCurrency(breakdown.variableExpenses)}</span>
          {/if}
          {#if breakdown.freeFlowingExpenses > 0}
            <span class="expense-item">Free-flowing: {formatCurrency(breakdown.freeFlowingExpenses)}</span>
          {/if}
        </div>
      {/if}
      
      <!-- Divider -->
      <div class="divider"></div>
      
      <!-- Leftover -->
      <div class="leftover-row" class:negative={leftoverClass === 'negative'}>
        <span class="leftover-label">LEFTOVER</span>
        <span class="leftover-value">{formatCurrency(breakdown.leftover)}</span>
      </div>
      
      <!-- Formula explanation -->
      <div class="formula">
        Bank Balances + Actual Income - Actual Expenses = Leftover
      </div>
    </div>
  {/if}
</div>

<style>
  .summary-footer {
    margin-top: 32px;
    padding: 24px;
    background: #1a1a2e;
    border-radius: 16px;
    border: 1px solid #333355;
  }
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .no-actuals-message {
    text-align: center;
    padding: 20px;
    color: #888;
  }
  
  .no-actuals-message p {
    margin: 0;
  }
  
  .no-actuals-message .hint {
    font-size: 0.875rem;
    color: #666;
    margin-top: 8px;
  }
  
  .breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .breakdown-row.muted {
    opacity: 0.5;
  }
  
  .breakdown-label {
    font-size: 0.9rem;
    color: #a1a1aa;
  }
  
  .breakdown-value {
    font-size: 1rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .breakdown-value.income {
    color: #4ade80;
  }
  
  .breakdown-value.expense {
    color: #f87171;
  }
  
  .breakdown-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-left: 16px;
    font-size: 0.8rem;
    color: #666;
  }
  
  .expense-detail {
    margin-top: -8px;
  }
  
  .balance-item, .expense-item {
    background: rgba(255, 255, 255, 0.03);
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .divider {
    height: 1px;
    background: #333355;
    margin: 8px 0;
  }
  
  .leftover-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(74, 222, 128, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(74, 222, 128, 0.2);
  }
  
  .leftover-row.negative {
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
  
  .leftover-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #888;
  }
  
  .leftover-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4ade80;
  }
  
  .leftover-row.negative .leftover-value {
    color: #f87171;
  }
  
  .formula {
    text-align: center;
    font-size: 0.75rem;
    color: #555;
    font-style: italic;
    margin-top: 8px;
  }
</style>
