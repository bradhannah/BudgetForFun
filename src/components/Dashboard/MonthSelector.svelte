<script lang="ts">
  import { currentMonth, currentMonthDisplay, goToPreviousMonth, goToNextMonth, goToCurrentMonth } from '../../stores/ui';
  
  $: isCurrentMonth = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return $currentMonth === `${year}-${month}`;
  })();
</script>

<div class="month-selector">
  <button class="nav-btn" on:click={goToPreviousMonth} aria-label="Previous month">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  
  <div class="month-display">
    <span class="month-label">{$currentMonthDisplay}</span>
    {#if !isCurrentMonth}
      <button class="today-btn" on:click={goToCurrentMonth}>Today</button>
    {/if}
  </div>
  
  <button class="nav-btn" on:click={goToNextMonth} aria-label="Next month">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>

<style>
  .month-selector {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #333355;
  }
  
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid #333355;
    border-radius: 8px;
    color: #e4e4e7;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .nav-btn:hover {
    background: #24c8db;
    border-color: #24c8db;
    color: #000;
  }
  
  .month-display {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 200px;
    justify-content: center;
  }
  
  .month-label {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .today-btn {
    padding: 4px 12px;
    background: transparent;
    border: 1px solid #24c8db;
    border-radius: 6px;
    color: #24c8db;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .today-btn:hover {
    background: #24c8db;
    color: #000;
  }
</style>
