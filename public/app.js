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
const logViewBtn = document.getElementById('logViewBtn');
const weekViewBtn = document.getElementById('weekViewBtn');
const logViewContent = document.getElementById('logViewContent');
const weekViewContent = document.getElementById('weekViewContent');
const weekSummary = document.getElementById('weekSummary');
const weekAreas = document.getElementById('weekAreas');
const tagsInput = document.getElementById('tagsInput');
const tagPresets = document.getElementById('tagPresets');
const modalTags = document.getElementById('modalTags');
const modalTagsSection = document.getElementById('modalTagsSection');
const activeTagFilters = document.getElementById('activeTagFilters');

// Constants
const STORAGE_KEY = 'goalUpdates';
const LAST_AREA_STORAGE_KEY = 'goalUpdateLastArea';
const AREA_FILTER_STORAGE_KEY = 'goalUpdateAreaFilter';
const VIEW_MODE_STORAGE_KEY = 'goalUpdateViewMode';
const TAG_FILTER_STORAGE_KEY = 'goalUpdateTagFilters';
const MAX_SAVED_UPDATES = 10;

// Area list in order (same as used for entry creation)
const AREAS_ORDER = [
  'Running',
  'Fitness / Health',
  'Cubing',
  'Coding / Projects',
  'Reading / Learning',
  'Home / Chores',
  'Relationship / Social',
  'Life Admin',
  'Work',
  'Misc'
];

// Tag presets (global presets)
const TAG_PRESETS = [
  'aof5',
  'pb',
  'weekly',
  'milestone',
  'blocker',
  'progress',
  'reflection',
  'planning'
];

/**
 * Saves an update to localStorage
 * @param {string} text - The original text
 * @param {Object} analysis - The analysis results
 */
function saveUpdate(text, analysis) {
  const updates = getSavedUpdates();
  
  // Get selected area
  const area = areaSelect.value;
  
  // Get and parse tags
  const tags = getCurrentTags();
  
  // Create new update object
  const newUpdate = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    text: text,
    analysis: analysis,
    area: area,
    tags: tags
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
  
  // Refresh sidebar (render appropriate view)
  if (getCurrentViewMode() === 'week') {
    renderWeekView();
  } else {
    renderSavedUpdates();
  }
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
 * Gets updates from the last 7 days (rolling)
 * @returns {Array} Array of recent updates
 */
function getRecentUpdates() {
  const allUpdates = getSavedUpdates();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return allUpdates.filter(update => {
    const updateDate = new Date(update.timestamp);
    return updateDate >= sevenDaysAgo;
  });
}

/**
 * Gets the current view mode (defaults to 'log')
 * @returns {string} 'log' or 'week'
 */
function getCurrentViewMode() {
  const savedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return savedMode || 'log';
}

/**
 * Gets active tag filters from localStorage
 * @returns {string[]} Array of normalized tag filters
 */
function getActiveTagFilters() {
  const stored = localStorage.getItem(TAG_FILTER_STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    const filters = JSON.parse(stored);
    return Array.isArray(filters) ? filters.map(tag => normalizeTag(tag)) : [];
  } catch (e) {
    console.error('Error parsing active tag filters:', e);
    return [];
  }
}

/**
 * Saves active tag filters to localStorage
 * @param {string[]} filters - Array of tag filters to save
 */
function setActiveTagFilters(filters) {
  const normalized = filters.map(tag => normalizeTag(tag)).filter(tag => tag.length > 0);
  localStorage.setItem(TAG_FILTER_STORAGE_KEY, JSON.stringify(normalized));
}

/**
 * Checks if an entry matches the active tag filters (AND logic)
 * @param {Object} update - Update entry to check
 * @param {string[]} activeFilters - Active tag filters
 * @returns {boolean} True if entry matches all filters
 */
function entryMatchesTagFilters(update, activeFilters) {
  if (activeFilters.length === 0) {
    return true;
  }
  
  const entryTags = (update.tags || []).map(tag => normalizeTag(tag));
  
  // Check if entry has ALL active filter tags (AND logic)
  return activeFilters.every(filterTag => entryTags.includes(filterTag));
}

/**
 * Renders the list of saved updates in the sidebar (Log view only)
 */
function renderSavedUpdates() {
  // Only render if we're in Log view mode
  if (getCurrentViewMode() !== 'log') {
    return;
  }
  
  const allUpdates = getSavedUpdates();
  
  // Get selected filter (empty string means "All Areas")
  const selectedArea = areaFilter.value;
  
  // Get active tag filters
  const activeTagFilters = getActiveTagFilters();
  
  // Filter updates by area (treat missing area as "Misc")
  let filteredUpdates = selectedArea === ''
    ? allUpdates
    : allUpdates.filter(update => {
        const area = update.area || 'Misc';
        return area === selectedArea;
      });
  
  // Apply tag filtering (AND logic - entry must have ALL active filter tags)
  if (activeTagFilters.length > 0) {
    filteredUpdates = filteredUpdates.filter(update => 
      entryMatchesTagFilters(update, activeTagFilters)
    );
  }
  
  // Render active tag filters UI
  renderActiveTagFilters();
  
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
    
    // Get tags (default to empty array if not set)
    const tags = update.tags || [];
    
    li.innerHTML = `
      <div class="update-item-header">
        <span class="update-item-time">${timeStr}</span>
        <span class="update-item-sentiment sentiment-label ${sentimentClass}">
          ${update.analysis.sentimentLabel}
        </span>
      </div>
      <div class="update-item-meta">
        <span class="area-badge">${escapeHtml(area)}</span>
        ${tags.length > 0 ? `<div class="tag-pills">${renderTagPills(tags, true)}</div>` : ''}
      </div>
      <div class="update-item-preview">${escapeHtml(preview)}</div>
    `;
    
    // Add click handler to show read-only view (but allow tag clicks to filter)
    li.addEventListener('click', (e) => {
      // If clicking a tag pill, don't open modal
      const tagPill = e.target.closest('.tag-pill.clickable');
      if (tagPill) {
        const tag = tagPill.getAttribute('data-tag');
        if (tag) {
          e.preventDefault();
          e.stopPropagation();
          toggleTagFilter(tag);
          return;
        }
      }
      showReadOnlyView(update);
    });
    
    updateList.appendChild(li);
  });
}

/**
 * Renders the Week view in the sidebar
 */
function renderWeekView() {
  let recentUpdates = getRecentUpdates();
  
  // Apply tag filtering (AND logic - entry must have ALL active filter tags)
  const activeTagFilters = getActiveTagFilters();
  if (activeTagFilters.length > 0) {
    recentUpdates = recentUpdates.filter(update => 
      entryMatchesTagFilters(update, activeTagFilters)
    );
  }
  
  const totalEntries = recentUpdates.length;
  
  // Group updates by area
  const groupedByArea = {};
  recentUpdates.forEach(update => {
    const area = update.area || 'Misc';
    if (!groupedByArea[area]) {
      groupedByArea[area] = [];
    }
    groupedByArea[area].push(update);
  });
  
  // Calculate area counts for summary
  const areaCounts = Object.entries(groupedByArea).map(([area, updates]) => ({
    area,
    count: updates.length
  })).sort((a, b) => b.count - a.count);
  
  // Render summary
  let summaryHtml = `<div class="week-summary-card"><h3>Last 7 Days</h3><p class="week-summary-total">${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'}</p>`;
  
  if (areaCounts.length > 0) {
    summaryHtml += '<p class="week-summary-areas"><strong>Top areas:</strong> ';
    const top3 = areaCounts.slice(0, 3);
    summaryHtml += top3.map(item => `${item.area} (${item.count})`).join(', ');
    summaryHtml += '</p>';
  }
  
  summaryHtml += '</div>';
  weekSummary.innerHTML = summaryHtml;
  
  // Render active tag filters UI
  renderActiveTagFilters();
  
  // Clear areas container
  weekAreas.innerHTML = '';
  
  if (totalEntries === 0) {
    weekAreas.innerHTML = '<p class="empty-message">No entries in the last 7 days.</p>';
    return;
  }
  
  // Render grouped sections by area order
  AREAS_ORDER.forEach(area => {
    const updates = groupedByArea[area];
    if (!updates || updates.length === 0) {
      return;
    }
    
    // Sort updates by timestamp (newest first)
    updates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const areaSection = document.createElement('div');
    areaSection.className = 'week-area-section';
    
    const areaHeader = document.createElement('div');
    areaHeader.className = 'week-area-header';
    areaHeader.innerHTML = `
      <h3 class="week-area-title">${escapeHtml(area)}</h3>
      <span class="week-area-count">${updates.length}</span>
    `;
    
    const areaList = document.createElement('div');
    areaList.className = 'week-area-list';
    
    updates.forEach(update => {
      const entry = document.createElement('div');
      entry.className = 'week-entry';
      
      // Format short timestamp
      const date = new Date(update.timestamp);
      const timeStr = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      // Get preview (first ~80 chars)
      const preview = update.text.length > 80 
        ? update.text.substring(0, 80) + '...'
        : update.text;
      
      // Get sentiment badge if available
      let sentimentBadge = '';
      if (update.analysis && update.analysis.sentimentLabel) {
        const sentimentClass = update.analysis.sentimentLabel.toLowerCase();
        sentimentBadge = `<span class="week-entry-sentiment sentiment-label ${sentimentClass}">${update.analysis.sentimentLabel}</span>`;
      }
      
      // Get tags (default to empty array if not set)
      const tags = update.tags || [];
      
      entry.innerHTML = `
        <div class="week-entry-header">
          <span class="week-entry-time">${timeStr}</span>
          ${sentimentBadge}
        </div>
        <div class="week-entry-preview">${escapeHtml(preview)}</div>
        ${tags.length > 0 ? `<div class="tag-pills">${renderTagPills(tags, true)}</div>` : ''}
      `;
      
      // Add click handler to show read-only view (but allow tag clicks to filter)
      entry.addEventListener('click', (e) => {
        // If clicking a tag pill, don't open modal
        const tagPill = e.target.closest('.tag-pill.clickable');
        if (tagPill) {
          const tag = tagPill.getAttribute('data-tag');
          if (tag) {
            e.preventDefault();
            e.stopPropagation();
            toggleTagFilter(tag);
            return;
          }
        }
        showReadOnlyView(update);
      });
      
      areaList.appendChild(entry);
    });
    
    areaSection.appendChild(areaHeader);
    areaSection.appendChild(areaList);
    weekAreas.appendChild(areaSection);
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
  
  // Populate tags (default to empty array if not set)
  // Tags in modal are NOT clickable (display-only)
  const tags = update.tags || [];
  if (tags.length > 0) {
    modalTags.innerHTML = renderTagPills(tags, false);
    modalTagsSection.style.display = 'block';
  } else {
    modalTags.innerHTML = '';
    modalTagsSection.style.display = 'none';
  }
  
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
 * Normalizes a single tag (lowercase, trim)
 * @param {string} tag - Tag to normalize
 * @returns {string} Normalized tag
 */
function normalizeTag(tag) {
  return tag.trim().toLowerCase();
}

/**
 * Parses comma-separated tag input into normalized tag array
 * @param {string} tagInput - Comma-separated tag string
 * @returns {string[]} Array of normalized, unique tags
 */
function parseTags(tagInput) {
  if (!tagInput || !tagInput.trim()) {
    return [];
  }
  
  const tags = tagInput
    .split(',')
    .map(normalizeTag)
    .filter(tag => tag.length > 0);
  
  // Remove duplicates
  return [...new Set(tags)];
}

/**
 * Formats tag array back to comma-separated string for display in input
 * @param {string[]} tags - Array of tags
 * @returns {string} Comma-separated tag string
 */
function formatTagsForInput(tags) {
  return tags.join(', ');
}

/**
 * Gets current tags from input as parsed array
 * @returns {string[]} Array of normalized tags
 */
function getCurrentTags() {
  return parseTags(tagsInput.value);
}

/**
 * Toggles a tag in the input (adds if not present, removes if present)
 * @param {string} tag - Tag to toggle
 */
function toggleTagInInput(tag) {
  const normalizedTag = normalizeTag(tag);
  const currentTags = getCurrentTags();
  
  let newTags;
  if (currentTags.includes(normalizedTag)) {
    // Remove tag
    newTags = currentTags.filter(t => t !== normalizedTag);
  } else {
    // Add tag
    newTags = [...currentTags, normalizedTag];
  }
  
  // Update input
  tagsInput.value = formatTagsForInput(newTags);
  
  // Update chip states
  updateTagChipStates();
}

/**
 * Renders tag preset chips
 */
function renderTagPresets() {
  tagPresets.innerHTML = '';
  
  TAG_PRESETS.forEach(preset => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tag-chip';
    chip.textContent = preset;
    chip.addEventListener('click', () => toggleTagInInput(preset));
    tagPresets.appendChild(chip);
  });
  
  // Update chip states based on current input
  updateTagChipStates();
}

/**
 * Updates tag chip visual states (selected vs unselected)
 */
function updateTagChipStates() {
  const currentTags = getCurrentTags();
  const chips = tagPresets.querySelectorAll('.tag-chip');
  
  chips.forEach(chip => {
    const chipTag = normalizeTag(chip.textContent);
    if (currentTags.includes(chipTag)) {
      chip.classList.add('selected');
    } else {
      chip.classList.remove('selected');
    }
  });
}

/**
 * Renders tags as pills HTML
 * @param {string[]} tags - Array of tags to render
 * @param {boolean} clickable - Whether pills should be clickable for filtering
 * @param {Function} onClickHandler - Optional click handler function (receives tag)
 * @returns {string} HTML string of tag pills
 */
function renderTagPills(tags, clickable = false, onClickHandler = null) {
  if (!tags || tags.length === 0) {
    return '';
  }
  
  const activeFilters = getActiveTagFilters();
  
  return tags.map(tag => {
    const normalizedTag = normalizeTag(tag);
    const isActive = activeFilters.includes(normalizedTag);
    const clickableClass = clickable ? 'clickable' : '';
    const activeClass = isActive ? 'filter-active' : '';
    
    // Always add data-tag attribute when clickable, so we can retrieve it in click handlers
    const dataTagAttr = clickable ? `data-tag="${escapeHtml(tag)}"` : '';
    
    return `<span class="tag-pill ${clickableClass} ${activeClass}" ${dataTagAttr}>${escapeHtml(tag)}</span>`;
  }).join('');
}

/**
 * Toggles a tag in the active filters
 * @param {string} tag - Tag to toggle
 */
function toggleTagFilter(tag) {
  const normalizedTag = normalizeTag(tag);
  const activeFilters = getActiveTagFilters();
  
  let newFilters;
  if (activeFilters.includes(normalizedTag)) {
    // Remove filter
    newFilters = activeFilters.filter(t => t !== normalizedTag);
  } else {
    // Add filter
    newFilters = [...activeFilters, normalizedTag];
  }
  
  setActiveTagFilters(newFilters);
  renderActiveTagFilters();
  
  // Re-render views to apply filters
  if (getCurrentViewMode() === 'week') {
    renderWeekView();
  } else {
    renderSavedUpdates();
  }
}

/**
 * Clears all active tag filters
 */
function clearTagFilters() {
  setActiveTagFilters([]);
  renderActiveTagFilters();
  
  // Re-render views
  if (getCurrentViewMode() === 'week') {
    renderWeekView();
  } else {
    renderSavedUpdates();
  }
}

/**
 * Renders active tag filter chips in the sidebar
 */
function renderActiveTagFilters() {
  const activeFilters = getActiveTagFilters();
  
  if (activeFilters.length === 0) {
    activeTagFilters.innerHTML = '';
    return;
  }
  
  let html = '<div class="active-filters-row">';
  
  activeFilters.forEach(tag => {
    html += `
      <span class="active-filter-chip">
        ${escapeHtml(tag)}
        <button type="button" class="filter-remove-btn" data-tag="${escapeHtml(tag)}" aria-label="Remove ${escapeHtml(tag)} filter">×</button>
      </span>
    `;
  });
  
  html += `<button type="button" class="clear-filters-btn">Clear</button>`;
  html += '</div>';
  
  activeTagFilters.innerHTML = html;
  
  // Add event listeners for remove buttons
  activeTagFilters.querySelectorAll('.filter-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tag = btn.getAttribute('data-tag');
      if (tag) {
        toggleTagFilter(tag);
      }
    });
  });
  
  // Add event listener for clear button
  const clearBtn = activeTagFilters.querySelector('.clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTagFilters();
    });
  }
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

/**
 * Switches between Log and Week views
 * @param {string} viewMode - 'log' or 'week'
 */
function switchView(viewMode) {
  // Save to localStorage
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  
  // Update button states
  if (viewMode === 'log') {
    logViewBtn.classList.add('active');
    weekViewBtn.classList.remove('active');
    logViewContent.style.display = 'block';
    weekViewContent.style.display = 'none';
    renderActiveTagFilters();
    renderSavedUpdates();
  } else {
    logViewBtn.classList.remove('active');
    weekViewBtn.classList.add('active');
    logViewContent.style.display = 'none';
    weekViewContent.style.display = 'block';
    renderActiveTagFilters();
    renderWeekView();
  }
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

// View toggle event listeners
logViewBtn.addEventListener('click', () => switchView('log'));
weekViewBtn.addEventListener('click', () => switchView('week'));

// Tag input change listener - update chip states
tagsInput.addEventListener('input', updateTagChipStates);

// Initialize: Render tag presets
renderTagPresets();

// Initialize: Render active tag filters
renderActiveTagFilters();

// Initialize: Load saved view mode and render appropriate view
const savedViewMode = getCurrentViewMode();
switchView(savedViewMode);

