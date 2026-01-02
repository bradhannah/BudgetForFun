<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Occurrence } from '../../stores/detailed-month';
  import { apiClient } from '../../lib/api/client';
  import { success, error as showError } from '../../stores/toast';
  
  export let occurrence: Occurrence;
  export let month: string;
  export let instanceId: string;
  export let type: 'bill' | 'income' = 'bill';
  export let readOnly: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  let saving = false;
  let isEditingExpected = false;
  let expectedEditValue = '';
  
  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
  }
  
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  function parseDollarsToCents(value: string): number {
    const dollars = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(dollars) ? 0 : Math.round(dollars * 100);
  }
  
  // Computed values
  $: totalPaid = occurrence.payments.reduce((sum, p) => sum + p.amount, 0);
  $: remaining = occurrence.expected_amount - totalPaid;
  $: hasPayments = occurrence.payments.length > 0 || totalPaid > 0;
  $: showAmber = totalPaid !== occurrence.expected_amount && totalPaid > 0;
  $: isPartiallyPaid = hasPayments && totalPaid > 0 && totalPaid < occurrence.expected_amount && !occurrence.is_closed;
  
  // API endpoint base
  $: apiBase = `/api/months/${month}/${type}s/${instanceId}/occurrences/${occurrence.id}`;
  
  async function handlePayFull() {
    if (saving) return;
    saving = true;
    
    try {
      // Add payment for remaining amount
      const paymentAmount = remaining > 0 ? remaining : occurrence.expected_amount;
      const today = new Date().toISOString().split('T')[0];
      
      await apiClient.post(`${apiBase}/payments`, {
        amount: paymentAmount,
        date: today
      });
      
      // Close the occurrence
      await apiClient.post(`${apiBase}/close`, {});
      
      success(type === 'bill' ? 'Payment added and closed' : 'Receipt added and closed');
      dispatch('updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to process');
    } finally {
      saving = false;
    }
  }
  
  async function handleClose() {
    if (saving) return;
    saving = true;
    
    try {
      await apiClient.post(`${apiBase}/close`, {});
      success('Closed');
      dispatch('updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to close');
    } finally {
      saving = false;
    }
  }
  
  async function handleReopen() {
    if (saving) return;
    saving = true;
    
    try {
      await apiClient.post(`${apiBase}/reopen`, {});
      success('Reopened');
      dispatch('updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reopen');
    } finally {
      saving = false;
    }
  }
  
  function startEditingExpected() {
    if (readOnly || occurrence.is_closed) return;
    expectedEditValue = (occurrence.expected_amount / 100).toFixed(2);
    isEditingExpected = true;
  }
  
  async function saveExpectedAmount() {
    const newAmount = parseDollarsToCents(expectedEditValue);
    if (newAmount === occurrence.expected_amount) {
      isEditingExpected = false;
      return;
    }
    
    if (newAmount <= 0) {
      showError('Amount must be greater than 0');
      return;
    }
    
    saving = true;
    try {
      await apiClient.putPath(apiBase, {
        expected_amount: newAmount
      });
      success('Amount updated');
      isEditingExpected = false;
      dispatch('updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update amount');
    } finally {
      saving = false;
    }
  }
  
  function cancelEditingExpected() {
    isEditingExpected = false;
    expectedEditValue = '';
  }
  
  function handleExpectedKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveExpectedAmount();
    } else if (event.key === 'Escape') {
      cancelEditingExpected();
    }
  }
  
  function openPaymentDrawer() {
    dispatch('openPayments', { occurrence });
  }
</script>

<div 
  class="occurrence-row" 
  class:closed={occurrence.is_closed} 
  class:partial={isPartiallyPaid}
  class:adhoc={occurrence.is_adhoc}
>
  <!-- Date -->
  <div class="occ-date">
    {#if occurrence.is_closed && occurrence.closed_date}
      <span class="closed-date">{formatDate(occurrence.closed_date)}</span>
    {:else}
      <span class="expected-date">{formatDate(occurrence.expected_date)}</span>
    {/if}
    {#if occurrence.is_adhoc}
      <span class="badge adhoc-badge">ad-hoc</span>
    {/if}
  </div>
  
  <!-- Expected amount -->
  <div class="amount-column">
    <span class="amount-label">Expected</span>
    {#if isEditingExpected}
      <div class="inline-edit">
        <span class="prefix">$</span>
        <input
          type="text"
          bind:value={expectedEditValue}
          on:keydown={handleExpectedKeydown}
          on:blur={saveExpectedAmount}
          disabled={saving}
          autofocus
        />
      </div>
    {:else}
      <button 
        class="amount-value clickable" 
        class:disabled={occurrence.is_closed}
        on:click={startEditingExpected}
        title={occurrence.is_closed ? 'Reopen to edit' : 'Click to edit'}
      >
        {formatCurrency(occurrence.expected_amount)}
      </button>
    {/if}
  </div>
  
  <!-- Arrow -->
  <div class="arrow">→</div>
  
  <!-- Actual/Paid amount -->
  <div class="amount-column">
    <span class="amount-label">
      {type === 'bill' ? 'Paid' : 'Received'}
      {#if occurrence.payments.length > 0}
        <span class="payment-count">({occurrence.payments.length})</span>
      {/if}
    </span>
    {#if hasPayments}
      <button 
        class="amount-value clickable" 
        class:amber={showAmber}
        on:click={openPaymentDrawer}
        title="View transactions"
      >
        {formatCurrency(totalPaid)}
      </button>
    {:else}
      <button class="add-payment-link" on:click={openPaymentDrawer}>
        {type === 'bill' ? 'Add Payment' : 'Add Receipt'}
      </button>
    {/if}
  </div>
  
  <!-- Status indicator -->
  <div class="status-column">
    {#if occurrence.is_closed}
      <span class="status-badge closed-badge">
        {type === 'bill' ? 'Closed' : 'Received'}
      </span>
    {:else if isPartiallyPaid}
      <span class="status-badge partial-badge">Partial</span>
    {:else}
      <span class="status-badge open-badge">
        {type === 'bill' ? 'Open' : 'Expected'}
      </span>
    {/if}
  </div>
  
  <!-- Action buttons -->
  <div class="action-buttons">
    {#if occurrence.is_closed}
      <button class="action-btn reopen" on:click={handleReopen} disabled={saving || readOnly}>
        Reopen
      </button>
    {:else if hasPayments}
      <button class="action-btn close" on:click={handleClose} disabled={saving || readOnly}>
        Close
      </button>
    {:else}
      <button class="action-btn pay-full" on:click={handlePayFull} disabled={saving || readOnly}>
        {type === 'bill' ? 'Pay Full' : 'Receive'}
      </button>
    {/if}
  </div>
</div>

<style>
  .occurrence-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    border-left: 2px solid transparent;
    transition: all 0.15s ease;
  }
  
  .occurrence-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  
  .occurrence-row.closed {
    background: rgba(74, 222, 128, 0.03);
    opacity: 0.7;
  }
  
  .occurrence-row.partial {
    border-left-color: #f59e0b;
  }
  
  .occurrence-row.adhoc:not(.partial) {
    border-left-color: #a78bfa;
  }
  
  .occ-date {
    min-width: 90px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .expected-date {
    font-size: 0.85rem;
    color: #888;
  }
  
  .closed-date {
    font-size: 0.85rem;
    color: #4ade80;
  }
  
  .badge {
    font-size: 0.55rem;
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
    font-weight: 600;
  }
  
  .adhoc-badge {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
  }
  
  .arrow {
    color: #555;
    font-size: 0.8rem;
  }
  
  .amount-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    min-width: 70px;
  }
  
  .amount-label {
    font-size: 0.55rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  
  .payment-count {
    color: #f59e0b;
  }
  
  .amount-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: #e4e4e7;
    background: none;
    border: none;
    padding: 0;
    cursor: default;
  }
  
  .amount-value.clickable {
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .amount-value.clickable:hover:not(.disabled) {
    color: #24c8db;
    text-decoration: underline;
  }
  
  .amount-value.clickable.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .amount-value.amber {
    color: #f59e0b;
  }
  
  .add-payment-link {
    background: none;
    border: none;
    color: #24c8db;
    font-size: 0.75rem;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
    transition: opacity 0.2s;
  }
  
  .add-payment-link:hover {
    opacity: 0.8;
  }
  
  .inline-edit {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .inline-edit .prefix {
    color: #888;
    font-size: 0.8rem;
  }
  
  .inline-edit input {
    width: 60px;
    padding: 2px 4px;
    background: #0f0f1a;
    border: 1px solid #24c8db;
    border-radius: 4px;
    color: #e4e4e7;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: right;
  }
  
  .inline-edit input:focus {
    outline: none;
  }
  
  .status-column {
    min-width: 70px;
    display: flex;
    justify-content: center;
  }
  
  .status-badge {
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }
  
  .closed-badge {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }
  
  .partial-badge {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  
  .open-badge {
    background: rgba(136, 136, 136, 0.15);
    color: #888;
  }
  
  .action-buttons {
    display: flex;
    gap: 6px;
    min-width: 70px;
    justify-content: flex-end;
  }
  
  .action-btn {
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .action-btn.pay-full {
    background: #24c8db;
    border: none;
    color: #000;
  }
  
  .action-btn.pay-full:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .action-btn.close {
    background: transparent;
    border: 1px solid #4ade80;
    color: #4ade80;
  }
  
  .action-btn.close:hover:not(:disabled) {
    background: rgba(74, 222, 128, 0.1);
  }
  
  .action-btn.reopen {
    background: transparent;
    border: 1px solid #888;
    color: #888;
  }
  
  .action-btn.reopen:hover:not(:disabled) {
    border-color: #e4e4e7;
    color: #e4e4e7;
  }
  
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .occurrence-row {
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .occ-date {
      min-width: 100%;
    }
    
    .amount-column {
      min-width: auto;
      flex: 1;
    }
    
    .arrow {
      display: none;
    }
    
    .status-column {
      min-width: auto;
    }
    
    .action-buttons {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
