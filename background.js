// Placeholder for background logic
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getCookies') {
        chrome.cookies.getAll({ url: msg.url }, (cookies) => {
            sendResponse({ cookies });
        });
        return true;
    }
    if (msg.action === 'setCookie') {
        chrome.cookies.set(msg.details, (cookie) => {
            sendResponse({ cookie });
        });
        return true;
    }
});
