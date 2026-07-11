<script lang="ts">
  import type { InsuranceProvider, InsuranceCategory } from '../../types/insurance';

  export let providers: InsuranceProvider[];
  export let categoriesById: InsuranceCategory[];
  export let onView: (provider: InsuranceProvider) => void;
  export let onEdit: (provider: InsuranceProvider) => void;
  export let onDelete: (provider: InsuranceProvider) => void;

  // Build a lookup map for categories
  $: categoryMap = new Map(categoriesById.map((c) => [c.id, c]));

  // Sort providers by name alphabetically
  $: sortedProviders = [...providers].sort((a, b) => a.name.localeCompare(b.name));

  function getCategoryBadge(catId: string): { icon: string; name: string } | null {
    const cat = categoryMap.get(catId);
    if (!cat) return null;
    return { icon: cat.icon, name: cat.name };
  }
</script>

<div class="insurance-providers-list">
  <div class="list-container">
    <!-- Column Header -->
    <div class="column-header">
      <span class="col-name">Provider Name</span>
      <span class="col-categories">Categories</span>
      <span class="col-status">Status</span>
      <span class="col-actions">Actions</span>
    </div>

    <!-- Provider Rows -->
    {#if sortedProviders.length === 0}
      <div class="empty-state">
        No insurance providers yet. Add your first provider to get started.
      </div>
    {:else}
      {#each sortedProviders as provider (provider.id)}
        <div
          class="provider-row"
          class:inactive={!provider.is_active}
          on:click={() => onView(provider)}
        >
          <div class="col-name">
            <span class="name-line">
              <span class="name-text">{provider.name}</span>
            </span>
            {#if provider.description}
              <span class="metadata-line">{provider.description}</span>
            {/if}
          </div>
          <span class="col-categories">
            <div class="category-badges">
              {#each provider.category_ids as catId (catId)}
                {@const badge = getCategoryBadge(catId)}
                {#if badge}
                  <span class="category-badge" title={badge.name}>
                    {badge.icon}
                    {badge.name}
                  </span>
                {:else}
                  <span class="category-badge category-badge--missing" title="Unknown category"
                    >Unknown</span
                  >
                {/if}
              {/each}
            </div>
          </span>
          <span class="col-status">
            <span
              class="status-badge"
              class:active={provider.is_active}
              class:inactive={!provider.is_active}
            >
              {provider.is_active ? 'Active' : 'Inactive'}
            </span>
          </span>
          <span class="col-actions" on:click|stopPropagation>
            <button class="btn-icon" on:click={() => onEdit(provider)} title="Edit">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button class="btn-icon btn-danger" on:click={() => onDelete(provider)} title="Delete">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .insurance-providers-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .list-container {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    border: 0.125rem solid var(--border-default);
    overflow: hidden;
  }

  .column-header {
    display: grid;
    grid-template-columns: 1fr 12.5rem 5.625rem 6.25rem;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-elevated);
    border-bottom: 0.125rem solid var(--border-default);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.03125rem;
  }

  .provider-row {
    display: grid;
    grid-template-columns: 1fr 12.5rem 5.625rem 6.25rem;
    gap: var(--space-3);
    padding: 0.875rem var(--space-4);
    align-items: center;
    border-bottom: 0.0625rem solid var(--border-subtle);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .provider-row:last-child {
    border-bottom: none;
  }

  .provider-row:hover {
    background: var(--accent-muted);
  }

  .provider-row.inactive {
    opacity: 0.6;
  }

  .provider-row .col-name {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    overflow: hidden;
  }

  .name-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
    color: var(--text-primary);
  }

  .name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .metadata-line {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .category-badge {
    display: inline-block;
    padding: 0.125rem var(--space-2);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .category-badge--missing {
    background: var(--error-muted);
    color: var(--error);
    font-size: 0.6875rem;
  }

  .status-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
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

  .provider-row .col-actions {
    display: flex;
    gap: var(--space-1);
    justify-content: flex-end;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--bg-elevated);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-icon:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .btn-icon.btn-danger:hover {
    background: var(--error);
    color: var(--text-inverse);
  }

  .empty-state {
    padding: 2.5rem var(--space-5);
    text-align: center;
    color: var(--text-tertiary);
    font-size: 0.875rem;
  }

  @media (max-width: 48rem) {
    .column-header,
    .provider-row {
      grid-template-columns: 1fr 5rem;
    }

    .col-categories,
    .col-status {
      display: none;
    }

    .column-header .col-categories,
    .column-header .col-status {
      display: none;
    }
  }
</style>
