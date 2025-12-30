<script lang="ts">
  import { createPaymentSource, updatePaymentSource, deletePaymentSource } from '../../stores/payment-sources';
  import { paymentSources } from '../../stores/payment-sources';
  import type { PaymentSource } from '../../stores/payment-sources';

  export let onContinue: () => void;
  export let onSkip: () => void;

  let name = '';
  let type: 'bank_account' | 'credit_card' | 'cash' = 'bank_account';
  let balance = 0;

  let error = '';
  let editingId: string | null = null;
  let deleteConfirmId: string | null = null;

  async function handleAdd() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }

    try {
      if (editingId) {
        await updatePaymentSource(editingId, { name, type, balance });
        editingId = null;
      } else {
        await createPaymentSource({ name, type, balance });
      }
      name = '';
      type = 'bank_account';
      balance = 0;
      error = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save payment source';
    }
  }

  function startEdit(ps: PaymentSource) {
    editingId = ps.id;
    name = ps.name;
    type = ps.type;
    balance = ps.balance;
    error = '';
  }

  function cancelEdit() {
    editingId = null;
    name = '';
    type = 'bank_account';
    balance = 0;
    error = '';
  }

  async function confirmDelete(id: string) {
    try {
      await deletePaymentSource(id);
      deleteConfirmId = null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to delete payment source';
    }
  }

  function handleContinue() {
    onContinue();
  }

  function handleSkip() {
    onSkip();
  }

  function formatBalance(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }
</script>

<div class="form-container">
  <h2>Add Payment Sources</h2>
  <p class="subtitle">Add your bank accounts, credit cards, and cash to track your balances.</p>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="form">
    <div class="form-group">
      <label for="name">Name</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="e.g., Main Checking"
        required
      />
    </div>

    <div class="form-group">
      <label for="type">Type</label>
      <select id="type" bind:value={type}>
        <option value="bank_account">Bank Account</option>
        <option value="credit_card">Credit Card</option>
        <option value="cash">Cash</option>
      </select>
    </div>

    <div class="form-group">
      <label for="balance">Current Balance (in cents)</label>
      <input
        id="balance"
        type="number"
        bind:value={balance}
        min="0"
        step="1"
        placeholder="e.g., 150000 for $1,500.00"
        required
      />
      <div class="balance-preview">
        {formatBalance(balance)}
      </div>
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
        <button class="btn btn-secondary" on:click={handleSkip}>
          Skip for now
        </button>
        <button class="btn btn-secondary" on:click={handleContinue}>
          Continue
        </button>
        <button class="btn btn-primary" on:click={handleAdd}>
          Add Payment Source
        </button>
      {/if}
    </div>
  </div>

  {#if $paymentSources.length > 0}
    <div class="existing-items">
      <h3>Payment Sources Added</h3>
      <div class="items-list">
        {#each $paymentSources as ps}
          <div class="item-card" class:editing={editingId === ps.id}>
            <div class="item-header">
              <span class="item-name">{ps.name}</span>
              <span class="item-type">
                {#if ps.type === 'bank_account'}Bank Account{:else if ps.type === 'credit_card'}Credit Card{:else}Cash{/if}
              </span>
            </div>
            <div class="item-balance">
              {formatBalance(ps.balance)}
            </div>
            <div class="item-actions">
              {#if deleteConfirmId === ps.id}
                <span class="confirm-text">Delete?</span>
                <button class="btn-small btn-danger" on:click={() => confirmDelete(ps.id)}>Yes</button>
                <button class="btn-small btn-secondary" on:click={() => deleteConfirmId = null}>No</button>
              {:else}
                <button class="btn-small btn-secondary" on:click={() => startEdit(ps)}>Edit</button>
                <button class="btn-small btn-danger" on:click={() => deleteConfirmId = ps.id}>Delete</button>
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

  .balance-preview {
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

  .item-type {
    font-size: 13px;
    color: #24c8db;
    padding: 4px 10px;
    background: rgba(36, 200, 219, 0.1);
    border-radius: 4px;
  }

  .item-balance {
    font-size: 18px;
    font-weight: bold;
    color: #24c8db;
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
