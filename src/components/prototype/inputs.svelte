<script lang="ts">
  let currencyInput1 = $state('');
  let currencyInput2 = $state('');
  let currencyInput3Dollars = $state('');
  let currencyInput3Cents = $state('');
  let textInput1 = $state('');
  let textInput2 = $state('');
</script>

<section class="variation-section">
  <h2>Input Component Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Native Input with $ Prefix</h3>
      <div class="demo">
        <label>Amount</label>
        <span class="currency-input">
          <span class="prefix">$</span>
          <input type="text" placeholder="0.00" bind:value={currencyInput1} />
        </span>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Custom Component with Auto-formatting</h3>
      <div class="demo">
        <label>Amount (auto-formatted)</label>
        <input 
          type="text" 
          placeholder="$0.00" 
          bind:value={currencyInput2} 
          class="formatted-currency"
        />
        <small>Shows: {currencyInput2 || '0.00'}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Split Inputs (Dollars + Cents)</h3>
      <div class="demo">
        <label>Amount</label>
        <div class="split-currency">
          <span class="dollar-symbol">$</span>
          <input 
            type="number" 
            placeholder="0" 
            bind:value={currencyInput3Dollars} 
            class="dollars"
          />
          <span class="decimal">.</span>
          <input 
            type="number" 
            placeholder="00" 
            bind:value={currencyInput3Cents} 
            class="cents"
            maxlength="2"
          />
        </div>
        <small>Shows: ${currencyInput3Dollars || 0}.{currencyInput3Cents || '00'}</small>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 4: Standard Text Field</h3>
      <div class="demo">
        <label>Name</label>
        <input type="text" placeholder="Enter name" bind:value={textInput1} />
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 5: Floating Label Pattern</h3>
      <div class="demo">
        <div class="floating-label">
          <input 
            type="text" 
            id="floating-name"
            placeholder=" " 
            bind:value={textInput2}
          />
          <label for="floating-name">Name</label>
        </div>
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  input {
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #24c8db;
    box-shadow: 0 0 0 2px rgba(36, 200, 219, 0.2);
  }
  
  .currency-input {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  .currency-input .prefix {
    padding: 0 0.5rem;
    color: #666;
    font-weight: 500;
  }
  
  .currency-input input {
    border: none;
    flex: 1;
    padding: 0.5rem;
  }
  
  .currency-input input:focus {
    box-shadow: none;
  }
  
  .formatted-currency {
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
  }
  
  .split-currency {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  .split-currency .dollar-symbol {
    padding: 0 0.5rem;
    color: #666;
    font-weight: 500;
  }
  
  .split-currency .dollars {
    flex: 1;
    border: none;
    padding: 0.5rem;
  }
  
  .split-currency .cents {
    width: 60px;
    border: none;
    padding: 0.5rem;
    text-align: center;
  }
  
  .split-currency input:focus {
    box-shadow: none;
  }
  
  .floating-label {
    position: relative;
  }
  
  .floating-label input {
    width: 100%;
    padding: 1rem 0.75rem 0.5rem;
  }
  
  .floating-label label {
    position: absolute;
    left: 0.75rem;
    top: 0.75rem;
    transition: all 0.2s;
    color: #999;
    pointer-events: none;
  }
  
  .floating-label input:focus + label,
  .floating-label input:not(:placeholder-shown) + label {
    top: 0.25rem;
    font-size: 0.75rem;
    color: #24c8db;
  }
  
  small {
    color: #999;
    font-size: 0.85rem;
  }
</style>
