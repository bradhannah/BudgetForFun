<script lang="ts">
  /**
   * VariableExpenseTemplateForm - Drawer-compatible form for variable expense templates
   * 
   * @prop editingItem - Template being edited (null for new)
   * @prop onSave - Callback after successful save
   * @prop onCancel - Callback to close form without saving
   */
  import { variableExpenseTemplatesStore, type VariableExpenseTemplate, type VariableExpenseFrequency } from '../../stores/variable-expense-templates';
  import { paymentSourcesStore } from '../../stores/payment-sources';
  import { categoriesStore } from '../../stores/categories';
  import { success, error as showError } from '../../stores/toast';

  export let editingItem: VariableExpenseTemplate | null = null;
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};

  // Form state - estimated_amount is stored in dollars for user input
  let name = editingItem?.name || '';
  let frequency: VariableExpenseFrequency = editingItem?.frequency || 'monthly';
  let estimatedAmountDollars = editingItem?.estimated_amount ? (editingItem.estimated_amount / 100).toFixed(2) : '';
  let payment_source_id = editingItem?.payment_source_id || '';
  let category_id = editingItem?.category_id || '';
  let notes = editingItem?.notes || '';
  let is_active = editingItem?.is_active ?? true;
  
  let error = '';
  let saving = false;

  // Frequency options
  const FREQUENCY_OPTIONS: { value: VariableExpenseFrequency; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  // Reset form when editingItem changes
  $: if (editingItem) {
    name = editingItem.name;
    frequency = editingItem.frequency;
    estimatedAmountDollars = editingItem.estimated_amount ? (editingItem.estimated_amount / 100).toFixed(2) : '';
    payment_source_id = editingItem.payment_source_id || '';
    category_id = editingItem.category_id || '';
    notes = editingItem.notes || '';
    is_active = editingItem.is_active;
  }

  // Convert dollars to cents
  function dollarsToCents(dollars: string): number | undefined {
    if (!dollars.trim()) return undefined;
    const parsed = parseFloat(dollars.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? undefined : Math.round(parsed * 100);
  }

  // Get expense categories only
  $: expenseCategories = $categoriesStore.categories.filter(c => c.type === 'bill');

  async function handleSubmit() {
    // Validation
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }

    saving = true;
    error = '';

    try {
      const templateData = {
        name: name.trim(),
        frequency,
        estimated_amount: dollarsToCents(estimatedAmountDollars),
        payment_source_id: payment_source_id || undefined,
        category_id: category_id || undefined,
        notes: notes.trim() || undefined,
        is_active
      };

      if (editingItem) {
        await variableExpenseTemplatesStore.update(editingItem.id, templateData);
        success(`Template "${name}" updated`);
      } else {
        await variableExpenseTemplatesStore.create(templateData);
        success(`Template "${name}" added`);
      }
      onSave();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save template';
      showError(error);
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
    <label for="template-name">Template Name</label>
    <input
      id="template-name"
      type="text"
      bind:value={name}
      placeholder="e.g., Groceries, Gas, Entertainment"
      required
      disabled={saving}
    />
  </div>

  <div class="form-group">
    <label for="template-frequency">Frequency</label>
    <select id="template-frequency" bind:value={frequency} disabled={saving}>
      {#each FREQUENCY_OPTIONS as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <div class="help-text">How often do you expect this expense?</div>
  </div>

  <div class="form-group">
    <label for="template-amount">Estimated Amount (Optional)</label>
    <div class="amount-input-wrapper">
      <span class="currency-prefix">$</span>
      <input
        id="template-amount"
        type="text"
        bind:value={estimatedAmountDollars}
        placeholder="0.00"
        disabled={saving}
      />
    </div>
    <div class="help-text">Pre-fills when adding this expense to a month</div>
  </div>

  <div class="form-group">
    <label for="template-category">Category (Optional)</label>
    <select id="template-category" bind:value={category_id} disabled={saving}>
      <option value="">-- No category --</option>
      {#each expenseCategories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="template-payment-source">Default Payment Source (Optional)</label>
    <select id="template-payment-source" bind:value={payment_source_id} disabled={saving}>
      <option value="">-- No default --</option>
      {#each $paymentSourcesStore.paymentSources as ps}
        <option value={ps.id}>{ps.name}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="template-notes">Notes (Optional)</label>
    <textarea
      id="template-notes"
      bind:value={notes}
      placeholder="Any additional notes..."
      rows="3"
      disabled={saving}
    ></textarea>
  </div>

  <div class="form-group">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={is_active} disabled={saving} />
      Active
    </label>
    <div class="help-text">Inactive templates won't appear in quick-add lists</div>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" on:click={onCancel} disabled={saving}>
      Cancel
    </button>
    <button type="submit" class="btn btn-primary" disabled={saving}>
      {saving ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Template')}
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

  input, select, textarea {
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #333355;
    background: #0f0f0f;
    color: #fff;
    font-size: 15px;
    box-sizing: border-box;
  }

  input, select {
    height: 46px;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #24c8db;
  }

  input:disabled, select:disabled, textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .amount-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .currency-prefix {
    position: absolute;
    left: 12px;
    color: #888;
    font-size: 15px;
    pointer-events: none;
  }

  .amount-input-wrapper input {
    padding-left: 28px;
    width: 100%;
  }

  .help-text {
    font-size: 12px;
    color: #24c8db;
    margin-top: 4px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: normal;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #24c8db;
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
