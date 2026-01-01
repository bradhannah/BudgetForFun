<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { VariableExpense } from '../../stores/months';
  import type { PaymentSource } from '../../stores/payment-sources';
  import { success, error as showError } from '../../stores/toast';
  import ConfirmDialog from '../shared/ConfirmDialog.svelte';
  import { apiUrl } from '$lib/api/client';
  
  export let expenses: VariableExpense[] = [];
  export let month: string;
  export let paymentSources: PaymentSource[] = [];
  export let compactMode: boolean = false;
  export let readOnly: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let showForm = false;
  let editingId: string | null = null;
  let name = '';
  let amount = '';
  let paymentSourceId = '';
  let saving = false;
  let error = '';
  
  // Delete confirmation state
  let showDeleteConfirm = false;
  let expenseToDelete: VariableExpense | null = null;
  
  // Calculate total
  $: total = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(dollars);
  }
  
  function parseDollarsToCents(value: string): number {
    const dollars = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(dollars) ? 0 : Math.round(dollars * 100);
  }
  
  function getPaymentSourceName(id: string | undefined): string | null {
    if (!id) return null;
    const source = paymentSources.find(ps => ps.id === id);
    return source ? source.name : null;
  }
  
  function openAddForm() {
    if (readOnly) return;
    editingId = null;
    name = '';
    amount = '';
    paymentSourceId = paymentSources.length > 0 ? paymentSources[0].id : '';
    error = '';
    showForm = true;
  }
  
  function openEditForm(expense: VariableExpense) {
    if (readOnly) return;
    editingId = expense.id;
    name = expense.name;
    amount = (expense.amount / 100).toFixed(2);
    paymentSourceId = expense.payment_source_id || '';
    error = '';
    showForm = true;
  }
  
  function cancelForm() {
    showForm = false;
    editingId = null;
    name = '';
    amount = '';
    paymentSourceId = '';
    error = '';
  }
  
  function confirmDeleteExpense(expense: VariableExpense) {
    if (readOnly) return;
    expenseToDelete = expense;
    showDeleteConfirm = true;
  }
  
  function cancelDeleteExpense() {
    showDeleteConfirm = false;
    expenseToDelete = null;
  }
  
  async function handleConfirmDelete() {
    if (expenseToDelete) {
      await deleteExpense(expenseToDelete.id);
    }
  }
  
  async function saveExpense() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }
    
    const amountCents = parseDollarsToCents(amount);
    if (amountCents <= 0) {
      error = 'Amount must be greater than 0';
      return;
    }
    
    saving = true;
    error = '';
    
    try {
      const payload: Record<string, unknown> = { 
        name: name.trim(), 
        amount: amountCents 
      };
      
      if (paymentSourceId) {
        payload.payment_source_id = paymentSourceId;
      }
      
      if (editingId) {
        // Update existing
        const response = await fetch(apiUrl(`/api/months/${month}/expenses/${editingId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update expense');
        }
        success('Expense updated');
      } else {
        // Create new
        const response = await fetch(apiUrl(`/api/months/${month}/expenses`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create expense');
        }
        success('Expense added');
      }
      
      cancelForm();
      dispatch('refresh');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      showError(error);
    } finally {
      saving = false;
    }
  }
  
  async function deleteExpense(id: string) {
    try {
      const response = await fetch(apiUrl(`/api/months/${month}/expenses/${id}`), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete expense');
      }
      
      showDeleteConfirm = false;
      expenseToDelete = null;
      dispatch('refresh');
      success('Expense deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError(message);
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveExpense();
    } else if (event.key === 'Escape') {
      cancelForm();
    }
  }
</script>

<div class="variable-expenses-section" class:compact={compactMode}>
  <div class="section-header">
    <div class="section-title">
      <span class="section-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" stroke-width="2"/>
          <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
        </svg>
      </span>
      <h4>Variable Expenses</h4>
      <span class="item-count">({expenses.length})</span>
      <button class="add-btn" on:click={openAddForm} title="Add variable expense" disabled={readOnly}>
        +
      </button>
    </div>
    
    <div class="section-total">
      <span class="total-label">Total</span>
      <span class="total-value expense">{formatCurrency(total)}</span>
    </div>
  </div>
  
  {#if showForm}
    <div class="expense-form">
      <div class="form-row">
        <input 
          type="text" 
          placeholder="Expense name (e.g., Groceries)"
          bind:value={name}
          on:keydown={handleKeydown}
          class:error={error && !name.trim()}
        />
      </div>
      <div class="form-row">
        <div class="amount-input">
          <span class="prefix">$</span>
          <input 
            type="text" 
            placeholder="0.00"
            bind:value={amount}
            on:keydown={handleKeydown}
            class:error={error && parseDollarsToCents(amount) <= 0}
          />
        </div>
        {#if paymentSources.length > 0}
          <select bind:value={paymentSourceId} class="payment-source-select">
            <option value="">No payment source</option>
            {#each paymentSources as source}
              <option value={source.id}>{source.name}</option>
            {/each}
          </select>
        {/if}
      </div>
      {#if error}
        <p class="error-message">{error}</p>
      {/if}
      <div class="form-actions">
        <button type="button" class="cancel-btn" on:click={cancelForm} disabled={saving}>
          Cancel
        </button>
        <button type="button" class="save-btn" on:click={saveExpense} disabled={saving}>
          {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
        </button>
      </div>
    </div>
  {/if}
  
  {#if expenses.length === 0 && !showForm}
    <p class="empty-text">No variable expenses yet. Click + to add groceries, gas, etc.</p>
  {:else}
    <div class="expenses-list">
      {#each expenses as expense (expense.id)}
        <div class="expense-row" class:editing={editingId === expense.id}>
          <div class="expense-info">
            <span class="expense-name">{expense.name}</span>
            {#if getPaymentSourceName(expense.payment_source_id)}
              <span class="expense-source">{getPaymentSourceName(expense.payment_source_id)}</span>
            {/if}
          </div>
          <div class="expense-amount">{formatCurrency(expense.amount)}</div>
          <div class="expense-actions">
            <button class="action-btn edit" on:click={() => openEditForm(expense)} title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="action-btn delete" on:click={() => confirmDeleteExpense(expense)} title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete Expense"
  message="Are you sure you want to delete '{expenseToDelete?.name}'? This action cannot be undone."
  confirmText="Delete"
  on:confirm={handleConfirmDelete}
  on:cancel={cancelDeleteExpense}
/>

<style>
  .variable-expenses-section {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid #333355;
    padding: 16px;
    margin-top: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .section-icon {
    color: #f87171;
    display: flex;
    align-items: center;
  }
  
  .section-title h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .item-count {
    font-size: 0.75rem;
    color: #888;
  }
  
  .add-btn {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px dashed #555;
    background: transparent;
    color: #888;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 4px;
  }
  
  .add-btn:hover {
    border-color: #24c8db;
    color: #24c8db;
    background: rgba(36, 200, 219, 0.1);
  }
  
  .section-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  
  .total-label {
    font-size: 0.625rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .total-value {
    font-size: 1rem;
    font-weight: 700;
  }
  
  .total-value.expense {
    color: #f87171;
  }
  
  .expense-form {
    background: rgba(255, 255, 255, 0.03);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #24c8db33;
  }
  
  .form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .form-row input {
    flex: 1;
    padding: 10px 12px;
    background: #0f0f1a;
    border: 1px solid #333355;
    border-radius: 6px;
    color: #e4e4e7;
    font-size: 0.875rem;
    height: 40px;
    box-sizing: border-box;
  }
  
  .form-row input:focus {
    outline: none;
    border-color: #24c8db;
  }
  
  .form-row input.error {
    border-color: #f87171;
  }
  
  .amount-input {
    position: relative;
    flex: 1;
    max-width: 150px;
  }
  
  .amount-input .prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
  }
  
  .amount-input input {
    padding-left: 28px;
    width: 100%;
  }
  
  .payment-source-select {
    flex: 1;
    padding: 10px 12px;
    background: #0f0f1a;
    border: 1px solid #333355;
    border-radius: 6px;
    color: #e4e4e7;
    font-size: 0.875rem;
    cursor: pointer;
    height: 40px;
    box-sizing: border-box;
  }
  
  .payment-source-select:focus {
    outline: none;
    border-color: #24c8db;
  }
  
  .payment-source-select option {
    background: #0f0f1a;
    color: #e4e4e7;
  }
  
  .error-message {
    color: #f87171;
    font-size: 0.75rem;
    margin: 0 0 12px 0;
  }
  
  .form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .cancel-btn, .save-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cancel-btn {
    background: transparent;
    border: 1px solid #333355;
    color: #888;
  }
  
  .cancel-btn:hover {
    border-color: #e4e4e7;
    color: #e4e4e7;
  }
  
  .save-btn {
    background: #24c8db;
    border: none;
    color: #000;
  }
  
  .save-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .save-btn:disabled, .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .empty-text {
    color: #666;
    font-size: 0.875rem;
    text-align: center;
    padding: 24px;
  }
  
  .expenses-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .expense-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    transition: background 0.15s;
  }
  
  .expense-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .expense-row.editing {
    border: 1px solid #24c8db;
  }
  
  .expense-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .expense-name {
    color: #e4e4e7;
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .expense-source {
    color: #666;
    font-size: 0.75rem;
  }
  
  .expense-amount {
    font-weight: 600;
    color: #f87171;
    font-size: 0.9rem;
  }
  
  .expense-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;
  }
  
  .expense-row:hover .expense-actions {
    opacity: 1;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  
  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .action-btn.edit:hover {
    color: #24c8db;
  }
  
  .action-btn.delete:hover {
    color: #f87171;
  }
  
  /* Compact mode styles */
  .variable-expenses-section.compact {
    padding: 10px;
    margin-top: 12px;
  }
  
  .variable-expenses-section.compact .section-header {
    margin-bottom: 10px;
  }
  
  .variable-expenses-section.compact .section-title h4 {
    font-size: 0.9rem;
  }
  
  .variable-expenses-section.compact .add-btn {
    width: 18px;
    height: 18px;
    font-size: 0.85rem;
  }
  
  .variable-expenses-section.compact .total-value {
    font-size: 0.9rem;
  }
  
  .variable-expenses-section.compact .expense-row {
    padding: 6px 8px;
  }
  
  .variable-expenses-section.compact .expense-name {
    font-size: 0.8rem;
  }
  
  .variable-expenses-section.compact .expense-amount {
    font-size: 0.8rem;
  }
  
  .variable-expenses-section.compact .action-btn {
    width: 24px;
    height: 24px;
  }
  
  .variable-expenses-section.compact .expense-form {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .variable-expenses-section.compact .form-row input,
  .variable-expenses-section.compact .payment-source-select {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .variable-expenses-section.compact .cancel-btn,
  .variable-expenses-section.compact .save-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
</style>
