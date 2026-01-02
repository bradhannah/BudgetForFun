<script lang="ts">
  import type { PaymentSource } from '../../stores/payment-sources';
  import { isDebtAccount, formatBalanceForDisplay } from '../../stores/payment-sources';
  
  interface Tally {
    expected: number;
    actual: number;
  }
  
  interface Tallies {
    bills: Tally;
    adhocBills: Tally;
    totalExpenses: Tally;
    income: Tally;
    adhocIncome: Tally;
    totalIncome: Tally;
  }
  
  interface LeftoverBreakdown {
    bankBalances: number;
    actualIncome: number;
    actualBills: number;
    variableExpenses: number;
    freeFlowingExpenses: number;
    totalExpenses: number;
    leftover: number;
    hasActuals: boolean;
  }
  
  export let paymentSources: PaymentSource[] = [];
  export let bankBalances: Record<string, number> = {};
  export let tallies: Tallies;
  export let leftoverBreakdown: LeftoverBreakdown;
  export let variableExpensesTotal: number = 0;
  
  function formatCurrency(cents: number): string {
    const dollars = Math.abs(cents) / 100;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
    return cents < 0 ? '-' + formatted : formatted;
  }
  
  function formatCurrencyWithSign(cents: number): string {
    const prefix = cents >= 0 ? '+' : '';
    return prefix + formatCurrency(cents);
  }
  
  // Get balance for a payment source (with display formatting for debt)
  function getBalance(source: PaymentSource): number {
    const raw = bankBalances[source.id] ?? source.balance;
    return raw;
  }
  
  function getDisplayBalance(source: PaymentSource): number {
    const raw = bankBalances[source.id] ?? source.balance;
    return formatBalanceForDisplay(raw, source.type);
  }
  
  // Separate payment sources by type
  $: assetAccounts = paymentSources.filter(ps => !isDebtAccount(ps.type));
  $: debtAccounts = paymentSources.filter(ps => isDebtAccount(ps.type));
  
  // Calculate totals
  $: totalAssets = assetAccounts.reduce((sum, ps) => sum + getBalance(ps), 0);
  $: totalDebt = debtAccounts.reduce((sum, ps) => sum + getBalance(ps), 0);
  $: netWorth = totalAssets - totalDebt;
  
  // Calculate liquid total (sum of all bank balances - for display, uses display balance)
  $: liquidTotal = netWorth;
  
  // Income calculations - actuals focused
  $: incomeReceived = tallies?.totalIncome?.actual ?? 0;
  $: incomeExpected = tallies?.totalIncome?.expected ?? 0;
  $: incomePending = incomeExpected - incomeReceived;
  
  // Expense calculations - actuals focused
  $: billsPaid = tallies?.totalExpenses?.actual ?? 0;
  $: billsExpected = tallies?.totalExpenses?.expected ?? 0;
  $: billsPending = billsExpected - billsPaid;
  $: totalSpent = billsPaid + variableExpensesTotal;
  
  // Current position (what's real right now)
  $: currentBalance = liquidTotal;
  
  // Projected position (current + pending income - pending bills)
  $: projectedBalance = currentBalance + incomePending - billsPending;
</script>

<aside class="summary-sidebar">
  <!-- Combined: Account Balances, Income, Bills in single box -->
  <div class="sidebar-box">
    <!-- Asset Accounts -->
    <div class="box-section">
      <h3 class="box-title">Bank Accounts & Cash</h3>
      <div class="balance-list">
        {#each assetAccounts as source (source.id)}
          <div class="balance-row">
            <span class="balance-name">{source.name}</span>
            <span class="balance-value" class:negative={getDisplayBalance(source) < 0}>
              {formatCurrency(getDisplayBalance(source))}
            </span>
          </div>
        {/each}
      </div>
      {#if assetAccounts.length > 0}
        <div class="section-subtotal">
          <span class="subtotal-label">Subtotal</span>
          <span class="subtotal-value" class:negative={totalAssets < 0}>
            {formatCurrency(totalAssets)}
          </span>
        </div>
      {:else}
        <p class="empty-text">No bank accounts</p>
      {/if}
    </div>
    
    <!-- Debt Accounts -->
    {#if debtAccounts.length > 0}
      <div class="section-divider"></div>
      
      <div class="box-section">
        <h3 class="box-title debt-title">Credit & Lines of Credit</h3>
        <div class="balance-list">
          {#each debtAccounts as source (source.id)}
            <div class="balance-row">
              <span class="balance-name">{source.name}</span>
              <span class="balance-value negative">
                {formatCurrency(getDisplayBalance(source))}
              </span>
            </div>
          {/each}
        </div>
        <div class="section-subtotal">
          <span class="subtotal-label">Total Owed</span>
          <span class="subtotal-value negative">
            -{formatCurrency(totalDebt)}
          </span>
        </div>
      </div>
    {/if}
    
    <div class="section-divider"></div>
    
    <!-- Net Worth -->
    <div class="box-section">
      <div class="section-subtotal networth-row">
        <span class="subtotal-label">Net Worth</span>
        <span class="subtotal-value" class:negative={netWorth < 0} class:positive={netWorth >= 0}>
          {formatCurrency(netWorth)}
        </span>
      </div>
    </div>
    
    <div class="section-divider"></div>
    
    <!-- Income -->
    <div class="box-section">
      <h3 class="box-title">Income</h3>
      <div class="summary-rows">
        <div class="summary-row">
          <span class="row-label">Received</span>
          <span class="row-value income">{formatCurrency(incomeReceived)}</span>
        </div>
        <div class="summary-row muted">
          <span class="row-label">Pending</span>
          <span class="row-value">{formatCurrency(incomePending)}</span>
        </div>
      </div>
    </div>
    
    <div class="section-divider"></div>
    
    <!-- Bills/Expenses -->
    <div class="box-section">
      <h3 class="box-title">Bills</h3>
      <div class="summary-rows">
        <div class="summary-row">
          <span class="row-label">Paid</span>
          <span class="row-value expense">{formatCurrency(billsPaid)}</span>
        </div>
        <div class="summary-row muted">
          <span class="row-label">Pending</span>
          <span class="row-value">{formatCurrency(billsPending)}</span>
        </div>
        <div class="summary-row">
          <span class="row-label">Variable</span>
          <span class="row-value expense">{formatCurrency(variableExpensesTotal)}</span>
        </div>
      </div>
      <div class="section-subtotal">
        <span class="subtotal-label">Total Spent</span>
        <span class="subtotal-value expense">{formatCurrency(totalSpent)}</span>
      </div>
    </div>
  </div>
  
  <!-- Current Position - Separate Box -->
  <div class="sidebar-box current-box">
    <h3 class="box-title">Current</h3>
    <div class="leftover-calc">
      <div class="calc-row">
        <span class="calc-label">Starting</span>
        <span class="calc-value">{formatCurrency(leftoverBreakdown?.bankBalances ?? 0)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">+ Received</span>
        <span class="calc-value income">{formatCurrencyWithSign(incomeReceived)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">- Spent</span>
        <span class="calc-value expense">{formatCurrency(-totalSpent)}</span>
      </div>
    </div>
    <div class="leftover-total" class:negative={currentBalance < 0}>
      <span class="leftover-label">= Current</span>
      <span class="leftover-value">{formatCurrency(currentBalance)}</span>
    </div>
  </div>
  
  <!-- Projected Position - Separate Box -->
  <div class="sidebar-box projected-box">
    <h3 class="box-title">Projected</h3>
    <div class="leftover-calc">
      <div class="calc-row">
        <span class="calc-label">Current</span>
        <span class="calc-value">{formatCurrency(currentBalance)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">+ Pending In</span>
        <span class="calc-value income">{formatCurrencyWithSign(incomePending)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">- Pending Out</span>
        <span class="calc-value expense">{formatCurrency(-billsPending)}</span>
      </div>
    </div>
    <div class="projected-total" class:negative={projectedBalance < 0}>
      <span class="projected-label">= End of Month</span>
      <span class="projected-value">{formatCurrency(projectedBalance)}</span>
    </div>
  </div>
</aside>

<style>
  .summary-sidebar {
    width: 260px;
    min-width: 260px;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  /* Box styling for distinct sections */
  .sidebar-box {
    background: #151525;
    border-radius: 12px;
    border: 1px solid #333355;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .box-title {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .box-title.debt-title {
    color: #f87171;
  }
  
  .box-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .section-divider {
    height: 1px;
    background: #333355;
    margin: 4px 0;
  }
  
  .section-subtotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 6px;
    border-top: 1px dashed #444;
    margin-top: 2px;
  }
  
  .subtotal-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #a1a1aa;
  }
  
  .subtotal-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #e4e4e7;
  }
  
  .subtotal-value.negative {
    color: #f87171;
  }
  
  .subtotal-value.positive {
    color: #4ade80;
  }
  
  .networth-row {
    border-top: none;
    padding-top: 0;
  }
  
  .subtotal-value.expense {
    color: #f87171;
  }
  
  .box-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px dashed #444;
    margin-top: 2px;
  }
  
  /* Balance list */
  .balance-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
  }
  
  .balance-name {
    color: #a1a1aa;
  }
  
  .balance-value {
    font-weight: 500;
    color: #e4e4e7;
  }
  
  .balance-value.negative {
    color: #f87171;
  }
  
  /* Section totals */
  .section-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px dashed #444;
    margin-top: 2px;
  }
  
  .total-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #a1a1aa;
  }
  
  .total-value {
    font-size: 0.95rem;
    font-weight: 700;
    color: #e4e4e7;
  }
  
  .total-value.negative {
    color: #f87171;
  }
  
  .total-value.expense {
    color: #f87171;
  }
  
  /* Summary rows */
  .summary-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
  }
  
  .summary-row.muted {
    opacity: 0.6;
  }
  
  .row-label {
    color: #a1a1aa;
  }
  
  .row-value {
    font-weight: 500;
    color: #e4e4e7;
  }
  
  .row-value.income {
    color: #4ade80;
  }
  
  .row-value.expense {
    color: #f87171;
  }
  
  /* Leftover calculation */
  .leftover-calc {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .calc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
  }
  
  .calc-label {
    color: #a1a1aa;
  }
  
  .calc-value {
    font-weight: 500;
    color: #e4e4e7;
  }
  
  .calc-value.income {
    color: #4ade80;
  }
  
  .calc-value.expense {
    color: #f87171;
  }
  
  /* Current total */
  .leftover-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    margin-top: 6px;
    background: rgba(74, 222, 128, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(74, 222, 128, 0.2);
  }
  
  .leftover-total.negative {
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
  
  .leftover-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4ade80;
  }
  
  .leftover-total.negative .leftover-label {
    color: #f87171;
  }
  
  .leftover-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4ade80;
  }
  
  .leftover-total.negative .leftover-value {
    color: #f87171;
  }
  
  /* Projected total */
  .projected-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    margin-top: 6px;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(96, 165, 250, 0.2);
  }
  
  .projected-total.negative {
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
  
  .projected-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #60a5fa;
  }
  
  .projected-total.negative .projected-label {
    color: #f87171;
  }
  
  .projected-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #60a5fa;
  }
  
  .projected-total.negative .projected-value {
    color: #f87171;
  }
  
  .empty-text {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
  }
  
  /* Scrollbar styling */
  .summary-sidebar::-webkit-scrollbar {
    width: 6px;
  }
  
  .summary-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .summary-sidebar::-webkit-scrollbar-thumb {
    background: #333355;
    border-radius: 3px;
  }
  
  .summary-sidebar::-webkit-scrollbar-thumb:hover {
    background: #444466;
  }
</style>
