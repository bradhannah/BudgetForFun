<script lang="ts">
  let name1 = $state('');
  let amount1 = $state('');
  let period1 = $state('');
  
  let name2 = $state('');
  let amount2 = $state('');
  let period2 = $state('');
  
  let name3 = $state('');
  let amount3 = $state('');
  let period3 = $state('');
  
  let name4 = $state('');
  let amount4 = $state('');
  let period4 = $state('');
  
  const billingPeriods = ['Monthly', 'Bi-weekly', 'Weekly', 'Semi-annually'];
</script>

<section class="variation-section">
  <h2>Form Layout Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Vertical Form</h3>
      <div class="demo">
        <form class="vertical-form">
          <label for="name1">Name</label>
          <input type="text" id="name1" placeholder="Enter bill name" bind:value={name1} />
          
          <label for="amount1">Amount</label>
          <input type="text" id="amount1" placeholder="$0.00" bind:value={amount1} />
          
          <label for="period1">Billing Period</label>
          <select id="period1" bind:value={period1}>
            <option value="">Select...</option>
            {#each billingPeriods as period}
              <option>{period}</option>
            {/each}
          </select>
          
          <div class="form-actions">
            <button type="button" class="secondary">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Horizontal Form</h3>
      <div class="demo">
        <form class="horizontal-form">
          <div class="form-group">
            <label for="name2">Name</label>
            <input type="text" id="name2" placeholder="Bill name" bind:value={name2} />
          </div>
          
          <div class="form-group">
            <label for="amount2">Amount</label>
            <input type="text" id="amount2" placeholder="$0.00" bind:value={amount2} />
          </div>
          
          <div class="form-group">
            <label for="period2">Period</label>
            <select id="period2" bind:value={period2}>
              <option value="">Select...</option>
              {#each billingPeriods as period}
                <option>{period}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="secondary">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Grid Layout (2-column)</h3>
      <div class="demo">
        <form class="grid-form">
          <div class="grid-row">
            <div class="form-group">
              <label for="name3">Name</label>
              <input type="text" id="name3" placeholder="Enter bill name" bind:value={name3} />
            </div>
            
            <div class="form-group">
              <label for="amount3">Amount</label>
              <input type="text" id="amount3" placeholder="$0.00" bind:value={amount3} />
            </div>
          </div>
          
          <div class="form-group full-width">
            <label for="period3">Billing Period</label>
            <select id="period3" bind:value={period3}>
              <option value="">Select...</option>
              {#each billingPeriods as period}
                <option>{period}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="secondary">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 4: Compact Form (Inline Labels)</h3>
      <div class="demo">
        <form class="compact-form">
          <div class="form-row">
            <label for="name4">Name</label>
            <input type="text" id="name4" placeholder="Bill name" bind:value={name4} />
          </div>
          
          <div class="form-row">
            <label for="amount4">Amount</label>
            <input type="text" id="amount4" placeholder="$0.00" bind:value={amount4} />
          </div>
          
          <div class="form-row">
            <label for="period4">Period</label>
            <select id="period4" bind:value={period4}>
              <option value="">Select...</option>
              {#each billingPeriods as period}
                <option>{period}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="secondary">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

<style>
  .variation-section {
    padding: 1rem;
  }
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: #1a1a1a;
  }
  
  .variations {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }
  
  .variation {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
  }
  
  .variation h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .demo {
    padding: 1rem;
  }
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  input, select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.95rem;
    width: 100%;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #24c8db;
    box-shadow: 0 0 0 2px rgba(36, 200, 219, 0.2);
  }
  
  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }
  
  .form-actions button {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
  }
  
  .form-actions button[type="submit"] {
    background: #24c8db;
    color: white;
  }
  
  .form-actions button[type="button"] {
    background: #f5f5f5;
    color: #333;
  }
  
  .vertical-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .horizontal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .horizontal-form .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .grid-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .grid-form .grid-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .grid-form .full-width {
    grid-column: span 2;
  }
  
  .compact-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .compact-form .form-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .compact-form .form-row label {
    width: 100px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
</style>
