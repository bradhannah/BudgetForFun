<script lang="ts">
  import { mockBills } from '../../prototype-data';
</script>

<section class="variation-section">
  <h2>List & Table Variations</h2>
  
  <div class="variations">
    <div class="variation">
      <h3>Variation 1: Table Layout with Borders</h3>
      <div class="demo">
        <table class="bordered-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each mockBills as bill}
              <tr>
                <td>{bill.name}</td>
                <td>${(bill.amount / 100).toFixed(2)}</td>
                <td>{bill.billing_period}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 2: Card-based Layout</h3>
      <div class="demo">
        <div class="card-list">
          {#each mockBills as bill}
            <div class="bill-card">
              <div class="card-header">
                <h4>{bill.name}</h4>
                <span class="amount">${(bill.amount / 100).toFixed(2)}</span>
              </div>
              <div class="card-body">
                <span class="period">{bill.billing_period}</span>
                <div class="actions">
                  <button>Edit</button>
                  <button>Delete</button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 3: Compact List (Mobile-first)</h3>
      <div class="demo">
        <div class="compact-list">
          {#each mockBills as bill}
            <div class="compact-item">
              <div class="compact-info">
                <span class="name">{bill.name}</span>
                <span class="amount">${(bill.amount / 100).toFixed(2)}</span>
              </div>
              <div class="compact-actions">
                <span class="period">{bill.billing_period}</span>
                <div class="actions">
                  <button>Edit</button>
                  <button>Delete</button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <div class="variation">
      <h3>Variation 4: Grid Layout (Dashboard Cards)</h3>
      <div class="demo">
        <div class="grid-cards">
          {#each mockBills as bill}
            <div class="grid-card">
              <h4>{bill.name}</h4>
              <div class="grid-amount">${(bill.amount / 100).toFixed(2)}</div>
              <div class="grid-period">{bill.billing_period}</div>
              <div class="grid-actions">
                <button>Edit</button>
                <button>Delete</button>
              </div>
            </div>
          {/each}
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
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
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
    overflow-x: auto;
  }
  
  .bordered-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .bordered-table th,
  .bordered-table td {
    border: 1px solid #ccc;
    padding: 0.75rem 1rem;
    text-align: left;
  }
  
  .bordered-table th {
    background: #f9f9f9;
    font-weight: 600;
  }
  
  .bordered-table tr:hover {
    background: #f5f5f5;
  }
  
  .bordered-table button {
    padding: 0.25rem 0.5rem;
    margin-right: 0.25rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  
  .bordered-table button:last-child {
    background: #dc3545;
  }
  
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .bill-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background: #f9f9f9;
  }
  
  .bill-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .bill-card .card-header h4 {
    margin: 0;
    color: #333;
  }
  
  .bill-card .amount {
    font-weight: 600;
    color: #24c8db;
    font-size: 1.1rem;
  }
  
  .bill-card .card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .bill-card .period {
    font-size: 0.9rem;
    color: #666;
  }
  
  .bill-card .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .bill-card .actions button {
    padding: 0.25rem 0.75rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  
  .bill-card .actions button:last-child {
    background: #dc3545;
  }
  
  .compact-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .compact-item {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .compact-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .compact-info .name {
    font-weight: 500;
    color: #333;
  }
  
  .compact-info .amount {
    font-weight: 600;
    color: #24c8db;
  }
  
  .compact-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
  
  .compact-actions .period {
    font-size: 0.85rem;
    color: #666;
  }
  
  .compact-actions .actions {
    display: flex;
    gap: 0.25rem;
  }
  
  .compact-actions .actions button {
    padding: 0.25rem 0.5rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .compact-actions .actions button:last-child {
    background: #dc3545;
  }
  
  .grid-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .grid-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background: #f9f9f9;
    text-align: center;
  }
  
  .grid-card h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1rem;
  }
  
  .grid-card .grid-amount {
    font-weight: 600;
    color: #24c8db;
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .grid-card .grid-period {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.75rem;
  }
  
  .grid-card .grid-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .grid-card .grid-actions button {
    padding: 0.25rem 0.5rem;
    background: #24c8db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .grid-card .grid-actions button:last-child {
    background: #dc3545;
  }
</style>
