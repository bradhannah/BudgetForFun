<script lang="ts">
  let colorScheme = $state('dark');
  
  const darkColors = {
    primary: '#24c8db',
    secondary: '#7c4dff',
    accent: '#4ade80',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#e4e4e7',
    border: '#333355'
  };
  
  const lightColors = {
    primary: '#24c8db',
    secondary: '#7c4dff',
    accent: '#4ade80',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    border: '#e0e0e0'
  };
  
  const highContrastColors = {
    primary: '#0000ff',
    secondary: '#ff0000',
    accent: '#00ff00',
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
    border: '#ffffff'
  };
  
  const currentColors = $derived(
    colorScheme === 'dark' ? darkColors : 
    colorScheme === 'light' ? lightColors : 
    highContrastColors
  );
</script>

<section class="variation-section">
  <h2>Color Scheme Variations</h2>
  
  <div class="controls">
    <label>Color Scheme:</label>
    <select bind:value={colorScheme}>
      <option value="dark">Dark Mode</option>
      <option value="light">Light Mode</option>
      <option value="high-contrast">High Contrast</option>
    </select>
  </div>
  
  <div class="preview" style="background: {currentColors.background}; color: {currentColors.text};">
    <div class="card" style="background: {currentColors.surface}; border-color: {currentColors.border};">
      <h3 style="color: {currentColors.primary};">Sample Card</h3>
      <p>This is a sample card demonstrating the {colorScheme.replace('-', ' ')} color scheme.</p>
      <div class="button-group">
        <button style="background: {currentColors.primary};">Primary</button>
        <button style="background: {currentColors.secondary};">Secondary</button>
        <button style="background: {currentColors.accent};">Accent</button>
      </div>
    </div>
    
    <div class="color-palette">
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.primary};"></div>
        <label>Primary</label>
        <code>{currentColors.primary}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.secondary};"></div>
        <label>Secondary</label>
        <code>{currentColors.secondary}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.accent};"></div>
        <label>Accent</label>
        <code>{currentColors.accent}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.background}; border: 1px solid #ccc;"></div>
        <label>Background</label>
        <code>{currentColors.background}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.surface};"></div>
        <label>Surface</label>
        <code>{currentColors.surface}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.text};"></div>
        <label>Text</label>
        <code>{currentColors.text}</code>
      </div>
      <div class="color-swatch">
        <div class="swatch" style="background: {currentColors.border};"></div>
        <label>Border</label>
        <code>{currentColors.border}</code>
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
  
  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .controls label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  .controls select {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .preview {
    border-radius: 8px;
    padding: 2rem;
    min-height: 500px;
  }
  
  .card {
    border: 1px solid;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    max-width: 500px;
  }
  
  .card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }
  
  .card p {
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
  }
  
  .button-group button {
    padding: 0.75rem 1.5rem;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .color-palette {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .color-swatch {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .swatch {
    width: 100%;
    height: 60px;
    border-radius: 8px;
  }
  
  .color-swatch label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  .color-swatch code {
    font-family: monospace;
    font-size: 0.85rem;
    color: #999;
  }
</style>
