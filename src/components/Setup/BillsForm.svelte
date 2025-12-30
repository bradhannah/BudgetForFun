<script lang="ts">
  import { createBill } from '../../stores/bills';
  import { billsStore } from '../../stores/bills';
  import { paymentSourcesStore } from '../../stores/payment-sources';

  export let onContinue: () => void;
  export let onBack: () => void;
  export let onSkip: () => void;

  let name = '';
  let amount = 0;
  let billing_period: 'monthly' | 'bi_weekly' | 'weekly' | 'semi_annually' = 'monthly';
  let payment_source_id = '';

  let error = '';

  function handleAdd() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }
    if (!payment_source_id) {
      error = 'Payment source is required';
      return;
    }

    createBill({ name, amount, billing_period, payment_source_id })
      .then(() => {
        name = '';
        amount = 0;
        payment_source_id = '';
        error = '';
      })
      .catch(e => {
        error = e instanceof Error ? e.message : 'Failed to add bill';
      });
  }

  function formatAmount(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }
</script>

<div class="form-container">
  <h2>Add Recurring Bills</h2>
  <p class="subtitle">Add your monthly bills like rent, utilities, subscriptions.</p>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="form">
    <div class="form-group">
      <label for="name">Bill Name</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="e.g., Rent"
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
        placeholder="e.g., 150000 for $1,500.00"
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
      <button class="btn btn-secondary" on:click={onSkip}>
        Skip for now
      </button>
      <button class="btn btn-secondary" on:click={onBack}>
        Back
      </button>
      <button class="btn btn-secondary" on:click={onContinue}>
        Continue
      </button>
      <button class="btn btn-primary" on:click={handleAdd}>
        Add Bill
      </button>
    </div>
  </div>

  {#if $billsStore.bills.length > 0}
    <div class="existing-items">
      <h3>Bills Added</h3>
      <div class="items-list">
        {#each $billsStore.bills as bill}
          <div class="item-card">
            <div class="item-header">
              <span class="item-name">{bill.name}</span>
              <span class="item-period">{bill.billing_period}</span>
            </div>
            <div class="item-amount">
              {formatAmount(bill.amount)}
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
    color: #ff6b6b;
  }
</style>
