// Handles loading, editing, and copying cookies
const cookieList = document.getElementById('cookie-list');
const copyBtn = document.getElementById('copy-btn');

function getCurrentTabUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0].url);
    });
}

function renderCookies(cookies) {
    cookieList.innerHTML = '';
    cookies.forEach((cookie, idx) => {
        const div = document.createElement('div');
        div.className = 'cookie-item';
        div.innerHTML = `
      <input type="text" value="${cookie.name}" data-idx="${idx}" data-field="name" /> =
      <input type="text" value="${cookie.value}" data-idx="${idx}" data-field="value" />
      <button data-idx="${idx}" class="edit-btn">Save</button>
    `;
        cookieList.appendChild(div);
    });
}

function getCookiesAndRender() {
    getCurrentTabUrl((url) => {
        chrome.runtime.sendMessage({ action: 'getCookies', url }, (response) => {
            window.cookies = response.cookies;
            renderCookies(window.cookies);
        });
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const idx = e.target.dataset.idx;
        const name = document.querySelector(`input[data-idx='${idx}'][data-field='name']`).value;
        const value = document.querySelector(`input[data-idx='${idx}'][data-field='value']`).value;
        const cookie = { ...window.cookies[idx], name, value };
        chrome.runtime.sendMessage({ action: 'setCookie', details: cookie }, () => {
            getCookiesAndRender();
        });
    }
});

copyBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['cookieFormat'], (result) => {
        const format = result.cookieFormat || '{{name}}={{value}};';
        const text = window.cookies.map(c =>
            format.replace(/{{\s*name\s*}}/g, c.name).replace(/{{\s*value\s*}}/g, c.value)
        ).join('\n');
        navigator.clipboard.writeText(text);
    });
});

document.addEventListener('DOMContentLoaded', getCookiesAndRender);
