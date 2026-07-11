<script lang="ts">
  import type { InsuranceProvider, InsuranceCategory } from '../../types/insurance';
  import { formatDate } from '$lib/utils/format';

  export let item: InsuranceProvider;
  export let categoriesById: InsuranceCategory[];
  export let onEdit: () => void = () => {};
  export let onClose: () => void = () => {};

  // Build a lookup map for categories
  $: categoryMap = new Map(categoriesById.map((c) => [c.id, c]));
  $: linkedCategories = item.category_ids
    .map((id) => categoryMap.get(id))
    .filter((c): c is InsuranceCategory => !!c);
</script>

<div class="entity-view">
  <div class="view-field">
    <span class="field-label">Name</span>
    <div class="view-value">{item.name}</div>
  </div>

  {#if item.description}
    <div class="view-field">
      <span class="field-label">Description</span>
      <div class="view-value notes">{item.description}</div>
    </div>
  {/if}

  <div class="view-field">
    <span class="field-label">Categories</span>
    <div class="category-list">
      {#if linkedCategories.length > 0}
        {#each linkedCategories as cat (cat.id)}
          <span class="category-pill">
            <span class="icon">{cat.icon}</span>
            <span class="name">{cat.name}</span>
          </span>
        {/each}
      {:else}
        <span class="muted">No categories linked</span>
      {/if}
    </div>
  </div>

  <div class="view-field">
    <span class="field-label">Status</span>
    <div class="view-value">
      <span class="status-badge" class:active={item.is_active} class:inactive={!item.is_active}>
        {item.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>

  <div class="view-field">
    <span class="field-label">Created</span>
    <div class="view-value muted">{formatDate(item.created_at)}</div>
  </div>

  <div class="view-field">
    <span class="field-label">Last Updated</span>
    <div class="view-value muted">{formatDate(item.updated_at)}</div>
  </div>

  <div class="view-actions">
    <button class="btn btn-secondary" on:click={onClose}> Close </button>
    <button class="btn btn-primary" on:click={onEdit}> Edit </button>
  </div>
</div>

<style>
  .entity-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .view-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.03125rem;
  }

  .view-value {
    font-size: 1rem;
    color: var(--text-primary);
  }

  .view-value.muted {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .view-value.notes {
    white-space: pre-wrap;
    background: var(--bg-elevated);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .category-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) 0.625rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    background: var(--accent-muted);
    color: var(--accent);
  }

  .category-pill .icon {
    font-size: 0.875rem;
  }

  .muted {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }

  .status-badge {
    display: inline-block;
    padding: var(--space-1) 0.625rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-badge.active {
    background: var(--success-muted);
    color: var(--success);
  }

  .status-badge.inactive {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .view-actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: 0.0625rem solid var(--border-default);
  }

  .btn {
    flex: 1;
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .btn-primary {
    background: var(--accent);
    color: var(--text-inverse);
  }

  .btn-primary:hover {
    background: var(--accent-hover);
  }

  .btn-secondary {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: var(--bg-hover);
  }
</style>
