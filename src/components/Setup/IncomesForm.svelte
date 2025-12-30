<script lang="ts">
  import { createIncome, updateIncome, deleteIncome } from '../../stores/incomes';
  import { incomesStore } from '../../stores/incomes';
  import { paymentSourcesStore } from '../../stores/payment-sources';
  import type { Income } from '../../stores/incomes';

  export let onContinue: () => void;
  export let onBack: () => void;
  export let onSkip: () => void;

  let name = '';
  let amount = 0;
  let billing_period: 'monthly' | 'bi_weekly' | 'weekly' | 'semi_annually' = 'monthly';
  let payment_source_id = '';

  let error = '';
  let editingId: string | null = null;
  let deleteConfirmId: string | null = null;

  async function handleAdd() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }
    if (!payment_source_id) {
      error = 'Payment source is required';
      return;
    }

    try {
      if (editingId) {
        await updateIncome(editingId, { name, amount, billing_period, payment_source_id });
        editingId = null;
      } else {
        await createIncome({ name, amount, billing_period, payment_source_id });
      }
      name = '';
      amount = 0;
      billing_period = 'monthly';
      payment_source_id = '';
      error = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save income';
    }
  }

  function startEdit(income: Income) {
    editingId = income.id;
    name = income.name;
    amount = income.amount;
    billing_period = income.billing_period;
    payment_source_id = income.payment_source_id;
    error = '';
  }

  function cancelEdit() {
    editingId = null;
    name = '';
    amount = 0;
    billing_period = 'monthly';
    payment_source_id = '';
    error = '';
  }

  async function confirmDelete(id: string) {
    try {
      await deleteIncome(id);
      deleteConfirmId = null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to delete income';
    }
  }

  function formatAmount(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }
</script>

<div class="form-container">
  <h2>Add Income Sources</h2>
  <p class="subtitle">Add your salary, freelance income, or other recurring income.</p>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="form">
    <div class="form-group">
      <label for="name">Income Name</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="e.g., Salary"
        required
      />
    </div>

    <div class="form-group">
      <label for="amount">Amount (in cents)</label>
      <input
        id="amount"
        type="number"
        bind:value={amount}
        min="1"
        step="1"
        placeholder="e.g., 500000 for $5,000.00"
        required
      />
      <div class="amount-preview">
        {formatAmount(amount)}
      </div>
    </div>

    <div class="form-group">
      <label for="billing_period">Billing Period</label>
      <select id="billing_period" bind:value={billing_period}>
        <option value="monthly">Monthly</option>
        <option value="bi_weekly">Bi-Weekly</option>
        <option value="weekly">Weekly</option>
        <option value="semi_annually">Semi-Annually</option>
      </select>
    </div>

    <div class="form-group">
      <label for="payment_source_id">Payment Source</label>
      <select id="payment_source_id" bind:value={payment_source_id} required>
        <option value="">-- Select Payment Source --</option>
        {#each $paymentSourcesStore.paymentSources as ps}
          <option value={ps.id}>{ps.name}</option>
        {/each}
      </select>
    </div>

    <div class="form-actions">
      {#if editingId}
        <button class="btn btn-secondary" on:click={cancelEdit}>
          Cancel Edit
        </button>
        <button class="btn btn-primary" on:click={handleAdd}>
          Save Changes
        </button>
      {:else}
        <button class="btn btn-secondary" on:click={onSkip}>
          Skip for now
        </button>
        <button class="btn btn-secondary" on:click={onBack}>
          Back
        </button>
        <button class="btn btn-primary" on:click={handleAdd}>
          Add Income
        </button>
        <button class="btn btn-success" on:click={onContinue}>
          Complete Setup
        </button>
      {/if}
    </div>
  </div>

  {#if $incomesStore.incomes.length > 0}
    <div class="existing-items">
      <h3>Incomes Added</h3>
      <div class="items-list">
        {#each $incomesStore.incomes as income}
          <div class="item-card" class:editing={editingId === income.id}>
            <div class="item-header">
              <span class="item-name">{income.name}</span>
              <span class="item-period">{income.billing_period.replace('_', '-')}</span>
            </div>
            <div class="item-amount">
              {formatAmount(income.amount)}
            </div>
            <div class="item-actions">
              {#if deleteConfirmId === income.id}
                <span class="confirm-text">Delete?</span>
                <button class="btn-small btn-danger" on:click={() => confirmDelete(income.id)}>Yes</button>
                <button class="btn-small btn-secondary" on:click={() => deleteConfirmId = null}>No</button>
              {:else}
                <button class="btn-small btn-secondary" on:click={() => startEdit(income)}>Edit</button>
                <button class="btn-small btn-danger" on:click={() => deleteConfirmId = income.id}>Delete</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .form-container {
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    margin-bottom: 10px;
    font-size: 28px;
  }

  .subtitle {
    color: #888;
    margin-bottom: 30px;
    font-size: 15px;
  }

  .error-message {
    background: #ff4444;
    color: #fff;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-weight: 500;
    font-size: 14px;
  }

  input, select {
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #333;
    background: #0f0f0f;
    color: #fff;
    font-size: 15px;
  }

  .amount-preview {
    font-size: 13px;
    color: #888;
    margin-top: 4px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }

  .btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-primary {
    background: #24c8db;
    color: #000;
  }

  .btn-primary:hover {
    background: #1ab0c9;
  }

  .btn-secondary {
    background: #333;
    color: #fff;
  }

  .btn-success {
    background: #22c55e;
    color: #fff;
  }

  .btn-success:hover {
    background: #1ea845;
  }

  .existing-items {
    margin-top: 40px;
    border-top: 1px solid #333;
    padding-top: 30px;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .item-card {
    background: #1a1a1a;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-name {
    font-weight: 500;
    font-size: 16px;
  }

  .item-period {
    font-size: 13px;
    color: #24c8db;
    padding: 4px 10px;
    background: rgba(36, 200, 219, 0.1);
    border-radius: 4px;
  }

  .item-amount {
    font-size: 18px;
    font-weight: bold;
    color: #22c55e;
  }

  .item-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    align-items: center;
  }

  .btn-small {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }

  .btn-danger {
    background: #ff4444;
    color: #fff;
  }

  .btn-danger:hover {
    background: #cc3333;
  }

  .confirm-text {
    font-size: 13px;
    color: #ff4444;
    font-weight: 500;
  }

  .item-card.editing {
    border: 2px solid #24c8db;
  }
</style>
