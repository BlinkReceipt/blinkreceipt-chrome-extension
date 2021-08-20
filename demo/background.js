const _fetchModes = {
    ON_TAB_OPEN: 'on-tab-open',
    SCHEDULED: 'scheduled'
}
var _ordersCache = {};
let _fetchMode = "on-tab-open";
let _supportedRetailers = null;

chrome.storage.sync.get(settings => {
    _fetchMode = settings['run-mode'] || _fetchModes.ON_TAB_OPEN;

    // Setup observers
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (key in changes) {
            let storageChange = changes[key];
            let newValue = storageChange.newValue;
            if (key == 'run-mode') {
                _fetchMode = newValue;
                if (newValue == _fetchModes.SCHEDULED) {
                    chrome.storage.sync.get(settings => {
                        const scheduledSecs = parseInt(settings['scheduled-secs']) || 10;
                        let params = { retailers: validRetailers(null) };
                        getDefaultOpts(opts => {
                            AccountLinking.enableScheduledGetOrders(scheduledSecs, {...params, ...opts}, processOrders);
                        });
                    });
                    return;
                }
                AccountLinking.disableScheduledGetOrders();
            } else if (key == 'scheduled-secs') {
                if (_fetchMode == _fetchModes.SCHEDULED) {
                    let params = { retailers: validRetailers(null) };
                    getDefaultOpts(opts => {
                        AccountLinking.enableScheduledGetOrders(scheduledSecs, {...params, ...opts}, processOrders);
                    });
                }
            }
        }
    });
    
    chrome.tabs.onActivated.addListener(tabInfo => {
        if (_fetchMode == _fetchModes.ON_TAB_OPEN) {
            chrome.tabs.get(tabInfo.tabId, (tab) => {
                getUserOrders({
                    url: tab.url,
                    fetchMode: _fetchMode,
                    retailers: validRetailers(tab.url)
                });
            });
        }
    });
    
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (_fetchMode == _fetchModes.ON_TAB_OPEN) {
            getUserOrders({
                url: tab.url,
                fetchMode: _fetchMode,
                retailers: validRetailers(tab.url)
            });
        }
    });

    if (_fetchMode == _fetchModes.SCHEDULED) {
        const scheduledSecs = parseInt(settings['scheduled-secs']) || 10;
        let params = { retailers: validRetailers(null) };
        getDefaultOpts(opts => {
            AccountLinking.enableScheduledGetOrders(scheduledSecs, {...params, ...opts}, processOrders);
        }); 
    }

});

function validRetailers(url) {
    if (_supportedRetailers == null) {
        _supportedRetailers = AccountLinking.getSupportedRetailers();
    }
    if (_fetchMode == _fetchModes.SCHEDULED) {
        return _supportedRetailers;
    }
    const finalList = _supportedRetailers.filter(name => {
        if (name == 'Amazon') {
            return (url || '').includes(`${name.toLowerCase()}.`) && (url || '').includes('order-history');   
        }
        return (url || '').includes(`${name.toLowerCase()}.`);
    });
    return finalList;
}

function getDefaultOpts(callback) {
    let opts = {
        clientKey: 'YOUR-KEY-HERE'
    }
    chrome.storage.sync.get(settings => {
        opts.cutOffDays = parseInt(settings['alp-global-cutoffdays']) || 60;
        callback(opts);
    });
}

function getUserOrders(params) {
    if ((params.retailers || []).length == 0) {
        return;
    }
    getDefaultOpts(opts => {
        AccountLinking.getOrders({...params, ...opts}, processOrders);
    });
}

function processOrders(name, code, data, errorMessage) {
    console.log('----------------------------');
    console.log(`Code ${code}, Error: ${errorMessage}`);
    if (code != 200) {
        return;
    }
    console.log('Orders: ');
    console.log(data);
    
}