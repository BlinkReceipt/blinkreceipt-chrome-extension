document.addEventListener('DOMContentLoaded', () => {
    let el = document.getElementById("global-cutoff-days");
    
    chrome.storage.sync.get(settings => {
        document.getElementById("global-cutoff-days").value = settings['alp-global-cutoffdays'] || 30;
        const fetchMode = settings['run-mode'] || 'on-tab-open';
        resetRadioBut(fetchMode);
    });

    el.addEventListener('mouseup', event => {
        // console.log(event.target.value);
        chrome.storage.sync.set({'alp-global-cutoffdays': event.target.value});
    });
    el.addEventListener('keyup', event => {
        // console.log(event.target.value || 0);
        chrome.storage.sync.set({'alp-global-cutoffdays': event.target.value});
    });

    let fetchSecEl = document.getElementById("scheduled-secs");
    fetchSecEl.addEventListener('mouseup', event => {
        // console.log(event.target.value);
        chrome.storage.sync.set({'scheduled-secs': event.target.value});
    });
    fetchSecEl.addEventListener('keyup', event => {
        // console.log(event.target.value || 0);
        chrome.storage.sync.set({'scheduled-secs': event.target.value});
    });

    // ------------------------------------
    let radioElements = document.getElementsByClassName('radio');
    for (let i = 0; i < radioElements.length; i++) {
        let radioEl = radioElements[i];
        radioEl.addEventListener('change', event => {
            console.log(event.target.value || 'on-tab-open');
            resetRadioBut(event.target.id);
            chrome.storage.sync.set({'run-mode': event.target.value || 'on-tab-open'});
        });
    }

    function resetRadioBut(id) {
        let radioElements = document.getElementsByClassName('radio');
        for (let i = 0; i < radioElements.length; i++) {
            let radioEl = radioElements[i];
            if (radioEl.id == id) {
                radioEl.checked = true
                continue;
            }
            radioEl.checked = false
        }
    }

});
