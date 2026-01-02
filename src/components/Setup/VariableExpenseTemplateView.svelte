<script lang="ts">
  /**
   * VariableExpenseTemplateView - Read-only view of a variable expense template
   * 
   * @prop item - The template to display
   * @prop onEdit - Callback to switch to edit mode
   * @prop onClose - Callback to close the drawer
   */
  import { paymentSourcesStore } from '../../stores/payment-sources';
  import { categoriesStore } from '../../stores/categories';
  import type { VariableExpenseTemplate } from '../../stores/variable-expense-templates';

  export let item: VariableExpenseTemplate;
  export let onEdit: () => void = () => {};
  export let onClose: () => void = () => {};

  function formatAmount(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  function formatFrequency(frequency: string): string {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-Weekly';
      case 'monthly': return 'Monthly';
      case 'as_needed': return 'As Needed';
      default: return frequency;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  function getPaymentSourceName(id: string | undefined): string {
    if (!id) return 'None';
    const ps = $paymentSourcesStore.paymentSources.find(p => p.id === id);
    return ps?.name || 'Unknown';
  }

  function getCategoryName(id: string | undefined): string {
    if (!id) return 'None';
    const category = $categoriesStore.categories.find(c => c.id === id);
    return category?.name || 'Unknown';
  }
</script>

<div class="entity-view">
  <div class="view-field">
    <label>Template Name</label>
    <div class="view-value">{item.name}</div>
  </div>

  <div class="view-field">
    <label>Status</label>
    <div class="view-value">
      <span class="status-badge" class:active={item.is_active} class:inactive={!item.is_active}>
        {item.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>

  <div class="view-field">
    <label>Frequency</label>
    <div class="view-value">{formatFrequency(item.frequency)}</div>
  </div>

  {#if item.estimated_amount}
    <div class="view-field">
      <label>Estimated Amount</label>
      <div class="view-value amount" style="color: #ff6b6b;">
        {formatAmount(item.estimated_amount)}
      </div>
    </div>
  {/if}

  <div class="view-field">
    <label>Category</label>
    <div class="view-value">{getCategoryName(item.category_id)}</div>
  </div>

  <div class="view-field">
    <label>Default Payment Source</label>
    <div class="view-value">{getPaymentSourceName(item.payment_source_id)}</div>
  </div>

  {#if item.notes}
    <div class="view-field">
      <label>Notes</label>
      <div class="view-value notes">{item.notes}</div>
    </div>
  {/if}

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

  .view-value.notes {
    white-space: pre-wrap;
    font-size: 14px;
    color: #a0a0a0;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 6px;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge.active {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .status-badge.inactive {
    background: rgba(136, 136, 136, 0.2);
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
