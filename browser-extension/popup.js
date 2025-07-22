// PriceWise Browser Extension - Popup Script v1.2.0 (Production Ready)
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('extensionToggle');
  const statusElement = document.getElementById('status');
  
  // Update status message
  function updateStatus(message, type = 'info') {
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status ${type}`;
    }
  }
  
  // Check internet connectivity
  function checkConnectivity() {
    if (navigator.onLine) {
      updateStatus('Extension ready - finding deals online!', 'success');
      return true;
    } else {
      updateStatus('No internet connection - please check your network', 'error');
      return false;
    }
  }
  
  // Load current state
  chrome.storage.sync.get(['enabled'], (result) => {
    const enabled = result.enabled !== false; // Default to true
    if (checkConnectivity()) {
      updateToggle(enabled);
    }
  });
  
  // Handle toggle click
  if (toggle) {
    toggle.addEventListener('click', () => {
      if (!checkConnectivity()) {
        return;
      }
      
      const isEnabled = toggle.classList.contains('active');
      const newState = !isEnabled;
      
      chrome.storage.sync.set({ enabled: newState }, () => {
        updateToggle(newState);
        updateStatus(newState ? 'Extension activated - $ signs will appear when cheaper alternatives are found' : 'Extension deactivated', newState ? 'success' : 'info');
        
        // Send message to content scripts to update state
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'toggleExtension', 
              enabled: newState 
            }).catch(() => {
              // Content script might not be loaded, that's okay
            });
          }
        });
      });
    });
  }
  
  function updateToggle(enabled) {
    if (toggle) {
      if (enabled) {
        toggle.classList.add('active');
        toggle.textContent = 'Extension ON';
      } else {
        toggle.classList.remove('active');
        toggle.textContent = 'Extension OFF';
      }
    }
  }
  
  // Listen for online/offline events
  window.addEventListener('online', () => checkConnectivity());
  window.addEventListener('offline', () => checkConnectivity());
  
  // Initial connectivity check
  checkConnectivity();
});