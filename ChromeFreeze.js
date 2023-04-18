const Freezer = {
	markedElement: false,
	active: false,
	finalResCaptured: undefined,
	PatchGUM(active){
		function _makeid(length) {
			let result = '';
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			const charactersLength = characters.length;
			let counter = 0;
			while (counter < length) {
			  result += characters.charAt(Math.floor(Math.random() * charactersLength));
			  counter += 1;
			}
			return result;
		}
		function _pause(vid){
			var vids = document.querySelectorAll('video:not([style*=display])');
			var vid = vids[vids.length-1];
			var Stream = vid.captureStream();
			var Track = Stream.getVideoTracks()[0];
			var URLIdea = undefined;
			new ImageCapture(Track).takePhoto().then((imCpt) => {
				URLIdea = URL.createObjectURL(imCpt);
				for(var i=0; i<10; i++) setTimeout(()=>{vid.src = _makeid(5);vid.currentSrc = _makeid(5);vid.srcObject = _makeid(5)}, i*10);
				var res = document.querySelectorAll('div[data-resolution-cap]+div')
				var finalRes = res[res.length-1]
				finalRes.style.backgroundImage = "url("+URLIdea+")";
				finalRes.style.backgroundSize = "contain";
				Freezer.finalResCaptured = finalRes;
			});
		}
		function _restart(camButton){
			if(Freezer.finalResCaptured) Freezer.finalResCaptured.style.backgroundImage = ""
		    var camButton = document.querySelector('button[aria-label*=camera]')
		    camButton.click();
			camButton.click();
		}
		function pause(){var cvids = document.querySelectorAll('video:not([style*=display])'); _pause(cvids[cvids.length-1])}
		function restart(){_restart(document.querySelector('button[aria-label*=camera]'))}
		if(active) return pause()
		return restart();
	},
	
    toggle: function() {
        if (Freezer.active) Freezer.deactivate();
        else Freezer.activate();
    },
    deactivate: function() {
		Freezer.active = false;
		if (Freezer.markedElement) {
			Freezer.removeHighlightStyle(Freezer.markedElement);
		}
		Freezer.markedElement = false;
		chrome.runtime.sendMessage({action: 'status', active: false});
		Freezer.PatchGUM(false)
		Freezer.removeHighlightStyle()
		// TODO: remove highlight if needed.
	},
    activate: function() {
        Freezer.active = true;
        chrome.runtime.sendMessage({
            action: 'status',
            active: true
        });
		// alert('starting...');
		// TODO: Call highlightElement in the future, to decide who to pause.
		// TODO: Stream stuff.
		Freezer.PatchGUM(true)
		Freezer.addHighlightStyle()
    },
    init: function() {
		chrome.runtime.onMessage.addListener(function(msg, sender, responseFun) {
			if (msg.action == "toggle") {
				responseFun(2.0);
				Freezer.toggle();
			}
			else if (msg.action == "heartbeat") {
				responseFun(Freezer.active);
			}
		});
	}, // Possible TODO: Add highlight to frozen element.
    addHighlightStyle: function () {
		Freezer.finalResCaptured.style.outline = 'solid 3px rgba(250,10,10,0.52)';
		Freezer.finalResCaptured.style.outlineOffset = '-3px';
	},
	removeHighlightStyle: function () {
		Freezer.finalResCaptured.style.outline = '';
		Freezer.finalResCaptured.style.outlineOffset = '';
	}
}

Freezer.init();