window.enc=function(r){for(var o=parseInt(atob("MzI3NTU=")),t="-",a=0,n=0,e=r.length;a<e;++a){for(n=r.charCodeAt(a)^o;0<n;)t+=String.fromCharCode(n%58+65),n=Math.floor(n/58);t+=String.fromCharCode(48+Math.floor(10*Math.random()))}return t};
window.dec=function(r){var o=r;if("-"==r[0]){o="";for(var t=parseInt(atob("MzI3NTU=")),a=1,n=r.length;a<n;){for(var e=0,f=1;a<n&&65<=r.charCodeAt(a);)e+=f*(r.charCodeAt(a)-65),f*=58,++a;o+=String.fromCharCode(e^t),++a}}return o};

/*
	Max write operations per hour for chrome.storage.sync is 1800 (https://developer.chrome.com/apps/storage)
	That's why it is used no more than once at 2 seconds.
*/
var syncStorage_QUOTA_BYTES_PER_ITEM = 8192;
var syncStorageRewriteTimeoutId = null;
var syncStorageWriteTimeoutMS = 2000;
var syncStorageLastWriteMS = 0;
// string values only support
window.SyncStorage = {
	cache: {},
	synced: false,
	sync_to_cache: function () {
		chrome.storage.sync.get(null, function(ss) {
			SyncStorage.cache = ss;
			SyncStorage.synced = true;
		});
	},
	cache_to_sync: function () {
		if (syncStorageRewriteTimeoutId)
		{
			clearTimeout(syncStorageRewriteTimeoutId);
			syncStorageRewriteTimeoutId = null;
		}
		var now = new Date().getTime();
		if (now - syncStorageLastWriteMS < syncStorageWriteTimeoutMS)
		{
			syncStorageRewriteTimeoutId = setTimeout(function() {
				SyncStorage.cache_to_sync();
			}, syncStorageWriteTimeoutMS + syncStorageLastWriteMS - now);
		}
		else
		{
			syncStorageLastWriteMS = now;

			chrome.storage.sync.get(null, function(ss) {
				var delete_keys = [];
				for (var key in ss) {
					if (!(key in SyncStorage.cache)) {
						delete_keys.push(key);
					}
				}
				if (delete_keys.length) {
					chrome.storage.sync.remove(delete_keys, function() {
						chrome.storage.sync.set(SyncStorage.cache, function() {
							syncStorageLastWriteMS = now + syncStorageWriteTimeoutMS;
						});
					});
				}
				else {
					chrome.storage.sync.set(SyncStorage.cache, function() {
						syncStorageLastWriteMS = now;
					});
				}
			});
		}
	},
	
	set: function (id, val, callback) {
		for (var key in SyncStorage.cache) {
			if (key.indexOf(id + '_part_') == 0) {
				delete SyncStorage.cache[key];
			}
		}
		var size = id.length + val.length + 2;
		if (size <= syncStorage_QUOTA_BYTES_PER_ITEM) {
			SyncStorage.cache[id] = val;
		}
		else {
			var _key = id + '_part_';
			var parts = val.match(new RegExp("[\\S\\s]{1," + (syncStorage_QUOTA_BYTES_PER_ITEM - _key.length - 5) + "}", "g"));
			for (var i = 0; i < parts.length; i++) {
				SyncStorage.cache[_key + i] = parts[i];
			}
		}
		
		SyncStorage.cache_to_sync();
		callback();
	},

	get: function (id, def_value, callback) {
		if (!SyncStorage.synced) {
			setTimeout(function() {
				SyncStorage.get(id, def_value, callback);
			}, 50);
			return;
		}
		
		var res = '';
		var parts = [];
		for (var key in SyncStorage.cache) {
			var match = key.match(new RegExp("^" + id + "_part_(\\d+)$"));
			if (match) {
				parts.push({ind: match[1], part: SyncStorage.cache[key]});
			}
		}
		if (parts.length) {
			parts.sort(function(p1, p2) {
				return p1.ind - p2.ind;
			});
			res = parts.map(function(p) {return p.part}).join("");
		} else {
			res = SyncStorage.cache[id];
		}
		
		SyncStorage.cache_to_sync();
		callback(res || def_value);
	},

	remove: function (id, value, callback) {
		delete SyncStorage.cache[id];
		for (var key in SyncStorage.cache) {
			if (key.indexOf(id + '_part_') == 0) {
				delete SyncStorage.cache[key];
			}
		}
		
		SyncStorage.cache_to_sync();
		callback();
	}
};

chrome.runtime.onMessage.addListener(function(request, sender, response) {
	request.value && request.crypt && (request.value = enc(request.value));
	if (request.storage == 'sync') {
		if (window.SyncStorage[request.action] && typeof window.SyncStorage[request.action] == 'function') {
			window.SyncStorage[request.action](request.id, request.value, function(data) {
				chrome.runtime.sendMessage({data: request.crypt && data ? dec(data) : data, cb_id: request.cb_id, storage: request.storage, id: request.id});
			});
		}
	}
	else if (request.storage == 'local') {
		var data = null;
		switch (request.action) {
			case 'get': 
				data = window.localStorage[request.id];
				break;
			case 'set': 
				window.localStorage[request.id] = request.value;
				break;
			case 'remove': 
				delete window.localStorage[request.id]
				break;
		}
		chrome.runtime.sendMessage({data: request.crypt && data ? dec(data) : data, cb_id: request.cb_id, storage: request.storage});
	}
	else if (request.opening == true) {
		SyncStorage.synced = false;
		SyncStorage.sync_to_cache();
		chrome.browserAction.setBadgeText({text: ''});
	}
});
SyncStorage.sync_to_cache();
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.status == 'complete') {
		if (/^https?:\/\/data\.apihub\.info\/(auth_info|store\/user)/.test(tab.url)) {
			chrome.tabs.remove(tabId);
			chrome.browserAction.setBadgeText({text: '!'});
		} else if (/^https?:\/\/data\.apihub\.info\/store\/success\?night_mode/.test(tab.url)) {
			// try enable night mode automatically after buying night_mode once
			if (localStorage['auto_night_mode_on'] !== '1') {
				localStorage['auto_night_mode_on'] = '1';
				window.SyncStorage.set('night_mode_on', enc(JSON.stringify(true)), function() {});
			}
		}
	}
});
chrome.browserAction.setBadgeBackgroundColor({
	color: '#76c47d'
});