// Handles saving and loading the export format template
const formatInput = document.getElementById('format');
const saveBtn = document.getElementById('save');
const statusDiv = document.getElementById('status');

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['cookieFormat'], (result) => {
        formatInput.value = result.cookieFormat || '{name}={value}; Path={path}; Expires={expires}';
    });
});

saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ cookieFormat: formatInput.value }, () => {
        statusDiv.textContent = 'Saved!';
        setTimeout(() => statusDiv.textContent = '', 1000);
    });
});
