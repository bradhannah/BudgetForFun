<script lang="ts">
  import PaymentSourcesForm from './PaymentSourcesForm.svelte';
  import BillsForm from './BillsForm.svelte';
  import IncomesForm from './IncomesForm.svelte';

  let step = 1;
  const totalSteps = 3;

  function nextStep() {
    if (step < totalSteps) step++;
  }

  function prevStep() {
    if (step > 1) step--;
  }

  function skipStep() {
    if (step < totalSteps) step++;
  }
</script>

<div class="setup-container">
  <div class="progress-bar">
    {#each Array(totalSteps) as _, i}
      <div class="progress-step" class:active={i + 1 === step} class:completed={i + 1 < step}>
        <span class="step-number">{i + 1}</span>
        {#if i + 1 === 1}
          <span class="step-label">Payment Sources</span>
        {:else if i + 1 === 2}
          <span class="step-label">Bills</span>
        {:else}
          <span class="step-label">Incomes</span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="setup-content">
    {#if step === 1}
      <PaymentSourcesForm 
        onContinue={nextStep} 
        onSkip={skipStep} 
      />
    {:else if step === 2}
      <BillsForm 
        onContinue={nextStep} 
        onBack={prevStep} 
        onSkip={skipStep} 
      />
    {:else}
      <IncomesForm 
        onContinue={() => window.location.href = '/'} 
        onBack={prevStep} 
        onSkip={() => window.location.href = '/'}
      />
    {/if}
  </div>
</div>

<style>
  .setup-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .progress-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 10px;
  }

  .progress-step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    border-radius: 8px;
    background: #1a1a1a;
    color: #888;
    font-weight: 500;
  }

  .progress-step.active {
    background: #24c8db;
    color: #000;
  }

  .progress-step.completed {
    color: #24c8db;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(36, 200, 219, 0.1);
    font-weight: bold;
  }

  .step-label {
    font-size: 14px;
  }

  .setup-content {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 30px;
  }
</style>
