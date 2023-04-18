function setActive() {
    chrome.action.setIcon({
        path: '/icons/action_active.png'
    });
    chrome.action.setTitle({
        title: 'Click to freeze [active]'
    });
}

function setInactive() {
    chrome.action.setIcon({
        path: '/icons/Main-38.png'
    });
    chrome.action.setTitle({
        title: 'Click to freeze'
    });
}


function checkActive(tabid) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs){
        if (!tabs || !tabs[0] || tabs[0].id < 0) return;
        var tab = tabs[0];
        if (tab.url.indexOf('meet.google.com') < 5 || tab.url.indexOf('youtube.com') > 30 ) {
            chrome.action.setIcon({
                path: '/icons/action_unavailable.png'
            });
            chrome.action.setTitle({
                title: 'Click to freeze [unavailable for this tab]'
            });
            chrome.action.disable(tab.id);
            return;
        } else {
            chrome.action.enable(tab.id);
        }
        chrome.tabs.sendMessage(tab.id, {
            action: 'heartbeat'
        }, function(isActive) {
            if (chrome.runtime.lastError) return;

            if (isActive) {
                setActive();
            } else {
                setInactive();
            }
        });
    });
}


chrome.action.onClicked.addListener(function() {
	chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, { 'action': 'toggle' }, function(response) {
			if (chrome.runtime.lastError) {
				// lastError needs to be checked, otherwise Chrome may throw an error
			}
			if (!response) {
				chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    files: ['functions/reload.js'],
                });
			}
		});
	});
});

chrome.runtime.onMessage.addListener(function(msg) {
	if (msg.action == 'status' && msg.active == true) {
		setActive()
	} else if (msg.action == 'status' && msg.active == false) {
		setInactive()
	}
});


chrome.tabs.onActivated.addListener(function(activeInfo) {
    var tabid = activeInfo.tabId;
    checkActive(tabid);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    checkActive(tabId);
});

checkActive(undefined);
