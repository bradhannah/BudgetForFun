<script lang="ts">
  /**
   * PaymentSourceForm - Drawer-compatible form for payment sources
   * 
   * @prop editingItem - Payment source being edited (null for new)
   * @prop onSave - Callback after successful save
   * @prop onCancel - Callback to close form without saving
   */
  import { createPaymentSource, updatePaymentSource } from '../../stores/payment-sources';
  import type { PaymentSource } from '../../stores/payment-sources';

  export let editingItem: PaymentSource | null = null;
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};

  // Form state
  let name = editingItem?.name || '';
  let type: 'bank_account' | 'credit_card' | 'cash' = editingItem?.type || 'bank_account';
  let balance = editingItem?.balance || 0;
  let error = '';
  let saving = false;

  // Reset form when editingItem changes
  $: if (editingItem) {
    name = editingItem.name;
    type = editingItem.type;
    balance = editingItem.balance;
  }

  function formatAmount(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  async function handleSubmit() {
    // Validation
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }

    saving = true;
    error = '';

    try {
      if (editingItem) {
        await updatePaymentSource(editingItem.id, { name, type, balance });
      } else {
        await createPaymentSource({ name, type, balance });
      }
      onSave();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save payment source';
    } finally {
      saving = false;
    }
  }
</script>

<form class="entity-form" on:submit|preventDefault={handleSubmit}>
  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="form-group">
    <label for="ps-name">Name</label>
    <input
      id="ps-name"
      type="text"
      bind:value={name}
      placeholder="e.g., Main Checking"
      required
      disabled={saving}
    />
  </div>

  <div class="form-group">
    <label for="ps-type">Type</label>
    <select id="ps-type" bind:value={type} disabled={saving}>
      <option value="bank_account">Bank Account</option>
      <option value="credit_card">Credit Card</option>
      <option value="cash">Cash</option>
    </select>
  </div>

  <div class="form-group">
    <label for="ps-balance">Current Balance (in cents)</label>
    <input
      id="ps-balance"
      type="number"
      bind:value={balance}
      min="0"
      step="1"
      placeholder="e.g., 150000 for $1,500.00"
      required
      disabled={saving}
    />
    <div class="amount-preview">
      {formatAmount(balance)}
    </div>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" on:click={onCancel} disabled={saving}>
      Cancel
    </button>
    <button type="submit" class="btn btn-primary" disabled={saving}>
      {saving ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Payment Source')}
    </button>
  </div>
</form>

<style>
  .entity-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .error-message {
    background: #ff4444;
    color: #fff;
    padding: 12px;
    border-radius: 6px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-weight: 500;
    font-size: 14px;
    color: #e4e4e7;
  }

  input, select {
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #333355;
    background: #0f0f0f;
    color: #fff;
    font-size: 15px;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #24c8db;
  }

  input:disabled, select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .amount-preview {
    font-size: 13px;
    color: #888;
    margin-top: 4px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
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

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #24c8db;
    color: #000;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1ab0c9;
  }

  .btn-secondary {
    background: #333355;
    color: #fff;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #444466;
  }
</style>
