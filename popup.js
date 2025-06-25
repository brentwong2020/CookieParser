// Handles loading, editing, and copying cookies
const cookieList = document.getElementById('cookie-list');
const copyBtn = document.getElementById('copy-btn');

// Popup logic for EditThisCookie-like layout with per-cookie copy
function getCurrentTabUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0].url);
    });
}

function formatDate(epoch) {
    if (!epoch) return '';
    const d = new Date(epoch * 1000);
    return d.toUTCString();
}

function renderCookies(cookies, format) {
    const list = document.getElementById('cookie-list');
    list.innerHTML = '';
    cookies.forEach((cookie, idx) => {
        const card = document.createElement('div');
        card.className = 'cookie-card';
        // Map SameSite values to display
        let sameSiteDisplay = '';
        if (cookie.sameSite === 'no_restriction' || cookie.sameSite === 'None') sameSiteDisplay = 'No restriction';
        else if (cookie.sameSite === 'lax' || cookie.sameSite === 'Lax') sameSiteDisplay = 'Lax';
        else if (cookie.sameSite === 'strict' || cookie.sameSite === 'Strict') sameSiteDisplay = 'Strict';
        else sameSiteDisplay = '';
        card.innerHTML = `
      <div class="cookie-header">${cookie.domain} | <b>${cookie.name}</b>
        <button class="copy-btn" data-idx="${idx}">Copy</button>
      </div>
      <div class="cookie-field"><span class="cookie-label">Value</span><textarea rows="2" data-idx="${idx}" data-field="value">${cookie.value}</textarea></div>
      <div class="cookie-field"><span class="cookie-label">Domain</span><input type="text" value="${cookie.domain}" data-idx="${idx}" data-field="domain" readonly></div>
      <div class="cookie-field"><span class="cookie-label">Path</span><input type="text" value="${cookie.path}" data-idx="${idx}" data-field="path" readonly></div>
      <div class="cookie-field"><span class="cookie-label">Expiration</span><input type="text" value="${formatDate(cookie.expirationDate)}" data-idx="${idx}" data-field="expiration" readonly></div>
      <div class="cookie-field"><span class="cookie-label">SameSite</span>
        <select data-idx="${idx}" data-field="sameSite">
          <option value="no_restriction" ${sameSiteDisplay === 'No restriction' ? 'selected' : ''}>No restriction</option>
          <option value="lax" ${sameSiteDisplay === 'Lax' ? 'selected' : ''}>Lax</option>
          <option value="strict" ${sameSiteDisplay === 'Strict' ? 'selected' : ''}>Strict</option>
        </select>
      </div>
      <div class="flags">
        <label><input type="checkbox" ${cookie.hostOnly ? 'checked' : ''}> HostOnly</label>
        <label><input type="checkbox" ${cookie.session ? 'checked' : ''}> Session</label>
        <label><input type="checkbox" ${cookie.secure ? 'checked' : ''}> Secure</label>
        <label><input type="checkbox" ${cookie.httpOnly ? 'checked' : ''}> HttpOnly</label>
      </div>
    `;
        list.appendChild(card);
    });
}

function getCookiesAndRender() {
    getCurrentTabUrl((url) => {
        chrome.runtime.sendMessage({ action: 'getCookies', url }, (response) => {
            chrome.storage.sync.get(['cookieFormat'], (result) => {
                const format = result.cookieFormat || '{{name}}={{value}};';
                window.cookies = response.cookies;
                window.format = format;
                renderCookies(window.cookies, format);
            });
        });
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const idx = e.target.dataset.idx;
        const c = window.cookies[idx];
        const format = window.format;
        // Map SameSite for output
        let samesite = '';
        if (c.sameSite === 'no_restriction' || c.sameSite === 'None') samesite = 'No restriction';
        else if (c.sameSite === 'lax' || c.sameSite === 'Lax') samesite = 'Lax';
        else if (c.sameSite === 'strict' || c.sameSite === 'Strict') samesite = 'Strict';
        else samesite = '';
        const text = format
            .replace(/\{\s*name\s*\}/g, c.name)
            .replace(/\{\s*value\s*\}/g, c.value)
            .replace(/\{\s*domain\s*\}/g, c.domain)
            .replace(/\{\s*path\s*\}/g, c.path)
            .replace(/\{\s*expires\s*\}/g, c.expirationDate ? formatDate(c.expirationDate) : '')
            .replace(/\{\s*samesite\s*\}/g, samesite)
            .replace(/\{\s*hostonly\s*\}/g, c.hostOnly ? 'true' : 'false')
            .replace(/\{\s*session\s*\}/g, c.session ? 'true' : 'false')
            .replace(/\{\s*secure\s*\}/g, c.secure ? 'true' : 'false')
            .replace(/\{\s*httponly\s*\}/g, c.httpOnly ? 'true' : 'false');
        navigator.clipboard.writeText(text);
    }
});

document.addEventListener('DOMContentLoaded', getCookiesAndRender);

// Settings button handler
const settingsBtn = document.getElementById('settings-btn');
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
}
