window.enc=function(r){for(var o=parseInt(atob("MzI3NTU=")),t="-",a=0,n=0,e=r.length;a<e;++a){for(n=r.charCodeAt(a)^o;0<n;)t+=String.fromCharCode(n%58+65),n=Math.floor(n/58);t+=String.fromCharCode(48+Math.floor(10*Math.random()))}return t};

window.fakeStorage = {
	_data: {},

	setItem: function (id, val) {
		return this._data[id] = String(val);
	},

	getItem: function (id) {
		return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
	},

	removeItem: function (id) {
		return delete this._data[id];
	},

	clear: function () {
		return this._data = {};
	}
};

window.ABStorage = {
	setItem: function (id, val) {
		return localStorage.setItem(id, String(val));
	},

	getItem: function (id) {
		return localStorage.getItem(id);
	},

	removeItem: function (id) {
		delete localStorage[id];
	},

	clear: function () {
		
	}
};

window.BgStorage = function(type) {
	var callbacks = {};
	return {
		setItem: function (id, val, callback, crypt = true) {
			var cb_id = id + new Date().getTime();
			callbacks[cb_id] = function(data) {
				callback && callback(data);
			}
			chrome.runtime.sendMessage({storage: type, action: 'set', id: id, value: JSON.stringify(val), cb_id: cb_id, crypt: crypt});
		},
		getItem: function (id, callback, crypt = true) {
			var cb_id = id + new Date().getTime();
			callbacks[cb_id] = function(data) {
				var res;
				try
				{
					res = JSON.parse(data);
				}
				catch (e) {
					res = undefined;
				}
				callback && callback(res);
			}
			chrome.runtime.sendMessage({storage: type, action: 'get', id: id, cb_id: cb_id, crypt: crypt});
		},
		removeItem: function (id, callback) {
			var cb_id = id + new Date().getTime();
			callbacks[cb_id] = function(data) {
				callback && callback(data);
			}
			chrome.runtime.sendMessage({storage: type, action: 'remove', id: id, cb_id: cb_id});
		},
		handleResponse: function(cb_id, data) {
			if (callbacks[cb_id] && typeof callbacks[cb_id] == 'function') {
				callbacks[cb_id](data);
				delete callbacks[cb_id];
			}
		}
	}
};
window.SyncStorage = window.BgStorage('sync');
window.LocalBgStorage = window.BgStorage('local');
chrome.runtime.onMessage.addListener(function(request, sender, response) {
	if (request.storage == 'sync') {
		window.SyncStorage.handleResponse(request.cb_id, request.data);
	}
	else if (request.storage == 'local') {
		window.LocalBgStorage.handleResponse(request.cb_id, request.data);
	}
});