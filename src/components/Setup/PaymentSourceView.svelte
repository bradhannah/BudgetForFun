<script lang="ts">
  /**
   * PaymentSourceView - Read-only view of a payment source
   * 
   * @prop item - The payment source to display
   * @prop onEdit - Callback to switch to edit mode
   * @prop onClose - Callback to close the drawer
   */
  import type { PaymentSource } from '../../stores/payment-sources';

  export let item: PaymentSource;
  export let onEdit: () => void = () => {};
  export let onClose: () => void = () => {};

  function formatAmount(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  function formatType(type: string): string {
    switch (type) {
      case 'bank_account': return 'Bank Account';
      case 'credit_card': return 'Credit Card';
      case 'cash': return 'Cash';
      default: return type;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="entity-view">
  <div class="view-field">
    <label>Name</label>
    <div class="view-value">{item.name}</div>
  </div>

  <div class="view-field">
    <label>Type</label>
    <div class="view-value">{formatType(item.type)}</div>
  </div>

  <div class="view-field">
    <label>Current Balance</label>
    <div class="view-value amount" style="color: #24c8db;">
      {formatAmount(item.balance)}
    </div>
  </div>

  <div class="view-field">
    <label>Created</label>
    <div class="view-value muted">{formatDate(item.created_at)}</div>
  </div>

  <div class="view-field">
    <label>Last Updated</label>
    <div class="view-value muted">{formatDate(item.updated_at)}</div>
  </div>

  <div class="view-actions">
    <button class="btn btn-secondary" on:click={onClose}>
      Close
    </button>
    <button class="btn btn-primary" on:click={onEdit}>
      Edit
    </button>
  </div>
</div>

<style>
  .entity-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .view-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-value {
    font-size: 16px;
    color: #e4e4e7;
  }

  .view-value.amount {
    font-size: 24px;
    font-weight: bold;
  }

  .view-value.muted {
    font-size: 14px;
    color: #888;
  }

  .view-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #333355;
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
    background: #333355;
    color: #fff;
  }

  .btn-secondary:hover {
    background: #444466;
  }
</style>
