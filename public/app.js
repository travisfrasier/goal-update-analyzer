/**
 * Goal Update Analyzer - Frontend JavaScript
 * 
 * Handles:
 * - AJAX requests to analyze text
 * - localStorage management for saved updates
 * - Sidebar toggle functionality
 * - Read-only modal for viewing saved updates
 */

// DOM Elements
const updateText = document.getElementById('updateText');
const analyzeBtn = document.getElementById('analyzeBtn');
const areaSelect = document.getElementById('areaSelect');
const resultsSection = document.getElementById('resultsSection');
const summaryList = document.getElementById('summaryList');
const sentimentLabel = document.getElementById('sentimentLabel');
const nextStep = document.getElementById('nextStep');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarToggleFixed = document.getElementById('sidebarToggleFixed');
const sidebarContent = document.getElementById('sidebarContent');
const updateList = document.getElementById('updateList');
const emptyMessage = document.getElementById('emptyMessage');
const readOnlyModal = document.getElementById('readOnlyModal');
const closeModal = document.getElementById('closeModal');
const areaFilter = document.getElementById('areaFilter');
const filterCount = document.getElementById('filterCount');

// Constants
const STORAGE_KEY = 'goalUpdates';
const LAST_AREA_STORAGE_KEY = 'goalUpdateLastArea';
const AREA_FILTER_STORAGE_KEY = 'goalUpdateAreaFilter';
const MAX_SAVED_UPDATES = 10;

/**
 * Saves an update to localStorage
 * @param {string} text - The original text
 * @param {Object} analysis - The analysis results
 */
function saveUpdate(text, analysis) {
  const updates = getSavedUpdates();
  
  // Get selected area
  const area = areaSelect.value;
  
  // Create new update object
  const newUpdate = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    text: text,
    analysis: analysis,
    area: area
  };
  
  // Save last selected area
  localStorage.setItem(LAST_AREA_STORAGE_KEY, area);
  
  // Add to beginning of array
  updates.unshift(newUpdate);
  
  // Keep only last MAX_SAVED_UPDATES
  if (updates.length > MAX_SAVED_UPDATES) {
    updates.splice(MAX_SAVED_UPDATES);
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  
  // Refresh sidebar
  renderSavedUpdates();
}

/**
 * Gets all saved updates from localStorage
 * @returns {Array} Array of saved updates
 */
function getSavedUpdates() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing saved updates:', e);
    return [];
  }
}

/**
 * Renders the list of saved updates in the sidebar
 */
function renderSavedUpdates() {
  const allUpdates = getSavedUpdates();
  
  // Get selected filter (empty string means "All Areas")
  const selectedArea = areaFilter.value;
  
  // Filter updates by area (treat missing area as "Misc")
  const filteredUpdates = selectedArea === ''
    ? allUpdates
    : allUpdates.filter(update => {
        const area = update.area || 'Misc';
        return area === selectedArea;
      });
  
  // Update count display
  const totalCount = allUpdates.length;
  const filteredCount = filteredUpdates.length;
  if (totalCount > 0) {
    filterCount.textContent = `Showing ${filteredCount} of ${totalCount}`;
    filterCount.style.display = 'block';
  } else {
    filterCount.style.display = 'none';
  }
  
  // Clear existing list
  updateList.innerHTML = '';
  
  if (filteredUpdates.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }
  
  emptyMessage.style.display = 'none';
  
  // Create list items for each filtered update
  filteredUpdates.forEach(update => {
    const li = document.createElement('li');
    li.className = 'update-item';
    
    // Format timestamp
    const date = new Date(update.timestamp);
    const timeStr = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    // Get preview text (first 100 chars)
    const preview = update.text.length > 100 
      ? update.text.substring(0, 100) + '...'
      : update.text;
    
    // Get sentiment class
    const sentimentClass = update.analysis.sentimentLabel.toLowerCase();
    
    // Get area (default to 'Misc' if not set)
    const area = update.area || 'Misc';
    
    li.innerHTML = `
      <div class="update-item-header">
        <span class="update-item-time">${timeStr}</span>
        <span class="update-item-sentiment sentiment-label ${sentimentClass}">
          ${update.analysis.sentimentLabel}
        </span>
      </div>
      <div class="update-item-meta">
        <span class="area-badge">${escapeHtml(area)}</span>
      </div>
      <div class="update-item-preview">${escapeHtml(preview)}</div>
    `;
    
    // Add click handler to show read-only view
    li.addEventListener('click', () => {
      showReadOnlyView(update);
    });
    
    updateList.appendChild(li);
  });
}

/**
 * Shows the read-only modal with a saved update
 * @param {Object} update - The update object to display
 */
function showReadOnlyView(update) {
  // Populate modal with update data
  document.getElementById('modalText').textContent = update.text;
  
  // Format timestamp
  const date = new Date(update.timestamp);
  const timeStr = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  document.getElementById('modalTimestamp').textContent = `Saved: ${timeStr}`;
  
  // Populate summary
  const modalSummary = document.getElementById('modalSummary');
  modalSummary.innerHTML = '';
  update.analysis.summaryBullets.forEach(bullet => {
    const li = document.createElement('li');
    li.textContent = bullet;
    modalSummary.appendChild(li);
  });
  
  // Populate sentiment
  const modalSentiment = document.getElementById('modalSentiment');
  modalSentiment.textContent = update.analysis.sentimentLabel;
  modalSentiment.className = `sentiment-label ${update.analysis.sentimentLabel.toLowerCase()}`;
  
  // Populate next step
  document.getElementById('modalNextStep').textContent = update.analysis.nextStep;
  
  // Populate area (default to 'Misc' if not set)
  const modalArea = document.getElementById('modalArea');
  const area = update.area || 'Misc';
  modalArea.textContent = area;
  modalArea.className = 'area-badge';
  
  // Show modal
  readOnlyModal.style.display = 'flex';
}

/**
 * Closes the read-only modal
 */
function closeReadOnlyView() {
  readOnlyModal.style.display = 'none';
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Analyzes the text in the textarea
 */
async function analyzeText() {
  const text = updateText.value.trim();
  
  // Validate input
  if (!text) {
    alert('Please enter some text to analyze.');
    return;
  }
  
  if (text.length > 5000) {
    alert('Text is too long. Please keep it under 5000 characters.');
    return;
  }
  
  // Disable button and show loading state
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  document.body.classList.add('loading');
  
  try {
    // Make POST request to /analyze endpoint
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }
    
    const analysis = await response.json();
    
    // Display results
    displayResults(analysis);
    
    // Save to localStorage
    saveUpdate(text, analysis);
    
  } catch (error) {
    console.error('Error analyzing text:', error);
    alert(`Error: ${error.message}`);
  } finally {
    // Re-enable button
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
    document.body.classList.remove('loading');
  }
}

/**
 * Displays analysis results in the UI
 * @param {Object} analysis - The analysis results
 */
function displayResults(analysis) {
  // Show results section
  resultsSection.style.display = 'block';
  
  // Populate summary
  summaryList.innerHTML = '';
  analysis.summaryBullets.forEach(bullet => {
    const li = document.createElement('li');
    li.textContent = bullet;
    summaryList.appendChild(li);
  });
  
  // Populate sentiment
  sentimentLabel.textContent = analysis.sentimentLabel;
  sentimentLabel.className = `sentiment-label ${analysis.sentimentLabel.toLowerCase()}`;
  
  // Populate next step
  nextStep.textContent = analysis.nextStep;
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Toggles sidebar visibility
 */
function toggleSidebar() {
  sidebar.classList.toggle('hidden');
  sidebarToggleFixed.style.display = sidebar.classList.contains('hidden') 
    ? 'block' 
    : 'none';
}

// Event Listeners
analyzeBtn.addEventListener('click', analyzeText);

// Allow Enter key to trigger analysis (Ctrl/Cmd + Enter)
updateText.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    analyzeText();
  }
});

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarToggleFixed.addEventListener('click', toggleSidebar);
closeModal.addEventListener('click', closeReadOnlyView);

// Close modal when clicking outside
readOnlyModal.addEventListener('click', (e) => {
  if (e.target === readOnlyModal) {
    closeReadOnlyView();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && readOnlyModal.style.display !== 'none') {
    closeReadOnlyView();
  }
});

// Initialize: Load last selected area
const lastArea = localStorage.getItem(LAST_AREA_STORAGE_KEY);
if (lastArea) {
  areaSelect.value = lastArea;
}

// Initialize: Load area filter from localStorage
const savedFilter = localStorage.getItem(AREA_FILTER_STORAGE_KEY);
if (savedFilter !== null) {
  areaFilter.value = savedFilter;
}

// Save area when changed
areaSelect.addEventListener('change', () => {
  localStorage.setItem(LAST_AREA_STORAGE_KEY, areaSelect.value);
});

// Filter updates when area filter changes
areaFilter.addEventListener('change', () => {
  localStorage.setItem(AREA_FILTER_STORAGE_KEY, areaFilter.value);
  renderSavedUpdates();
});

// Initialize: Load saved updates on page load (after filter is restored)
renderSavedUpdates();

