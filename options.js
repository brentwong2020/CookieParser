// Handles saving and loading the export format template
const formatInput = document.getElementById('format');
const saveBtn = document.getElementById('save');
const statusDiv = document.getElementById('status');
const defaultFormats = document.getElementById('default-formats');
const applyDefaultBtn = document.getElementById('apply-default');
const addCustomBtn = document.getElementById('add-custom');
const deleteFormatBtn = document.getElementById('delete-format');

function loadFormats() {
    let builtins = {
        'API Testing Tool': '{name}={value}; Path={path}; Expires={expires};',
        'Full Cookie': 'Cookie: {name}={value}; Domain={domain}; Path={path}; Secure={secure}; HttpOnly={httponly}; SameSite={samesite};'
    };
    chrome.storage.sync.get(['customFormats', 'cookieFormat'], (result) => {
        let customs = result.customFormats || [];
        defaultFormats.innerHTML = '';
        Object.entries(builtins).forEach(([label, f]) => {
            let opt = document.createElement('option');
            opt.value = f;
            opt.textContent = label;
            opt.dataset.builtin = '1';
            opt.dataset.format = f;
            defaultFormats.appendChild(opt);
        });
        customs.forEach(f => {
            let opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.dataset.builtin = '0';
            defaultFormats.appendChild(opt);
        });
        // Set selected
        let current = result.cookieFormat || builtins['API Testing Tool'];
        let found = Array.from(defaultFormats.options).find(o => o.value === current);
        if (found) found.selected = true;
        formatInput.value = current;
        const isBuiltin = Object.values(builtins).includes(current);
        formatInput.readOnly = isBuiltin;
        saveBtn.disabled = isBuiltin;
    });
}

document.addEventListener('DOMContentLoaded', loadFormats);

saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ cookieFormat: formatInput.value }, () => {
        statusDiv.textContent = 'Saved!';
        setTimeout(() => statusDiv.textContent = '', 1000);
        loadFormats();
    });
});

if (applyDefaultBtn && defaultFormats) {
    applyDefaultBtn.addEventListener('click', () => {
        formatInput.value = defaultFormats.value;
        const isBuiltin = defaultFormats.selectedOptions[0].dataset.builtin === '1';
        formatInput.readOnly = isBuiltin;
        saveBtn.disabled = isBuiltin;
    });
}

if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
        let val = formatInput.value.trim();
        if (!val) return;
        chrome.storage.sync.get(['customFormats'], (result) => {
            let customs = result.customFormats || [];
            if (!customs.includes(val)) {
                customs.push(val);
                chrome.storage.sync.set({ customFormats: customs }, loadFormats);
            }
        });
    });
}

if (deleteFormatBtn) {
    deleteFormatBtn.addEventListener('click', () => {
        let val = defaultFormats.value;
        if (!val) return;
        if (defaultFormats.selectedOptions[0].dataset.builtin === '1') return;
        chrome.storage.sync.get(['customFormats'], (result) => {
            let customs = result.customFormats || [];
            customs = customs.filter(f => f !== val);
            chrome.storage.sync.set({ customFormats: customs }, loadFormats);
        });
    });
}