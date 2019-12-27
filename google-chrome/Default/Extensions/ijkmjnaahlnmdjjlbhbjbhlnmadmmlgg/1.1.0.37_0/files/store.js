function declOfNum(number, titles) {  
	cases = [2, 0, 1, 1, 1, 2];  
	return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}

function Store() {
	var main_url = "http://data.apihub.info";
	var products = null;
	var info = null;
	var can_undo = false;

	var store_container = document.querySelector('.store-container');
	var store_title = document.querySelector('.store-container .big-text');
	var store_desription = document.querySelector('.store-container .small-text');
	var products_container = document.querySelector('#products-list');
	var email_text = document.querySelector('.store-container .email');
	var close_buttons = document.querySelectorAll('.store-container .close-btn');
	var report_buttons = document.querySelectorAll('.store-container .report_button a');
	var signout_button = document.querySelector('.store-container .signout-btn');
	var signin_button = document.querySelector('.store-container .google-signin');
	var undo_btns = document.querySelectorAll('.undo-button');
	var currency_list = document.querySelector('.choose-currency .currency-list select');
	
	var default_lang = "en";
	var lang = chrome.i18n.getUILanguage().substr(0, 2).toLowerCase();
	var currency = localStorage.currency || 'USD';
	
	var ext_version = chrome.runtime.getManifest().version;
	var timeout_per_requests = 400;
	var last_request_ms = 0;
	var request_timeout_ids = {};
	function request(type = 'GET', path, data, onload) {
		request_timeout_ids[path] && (clearTimeout(request_timeout_ids[path]), delete request_timeout_ids[path]);
		var now_ms = new Date().getTime();
		if (now_ms - last_request_ms < timeout_per_requests) {
			request_timeout_ids[path] = setTimeout(function() {
				delete request_timeout_ids[path];
				request(type, path, data, onload);
			}, Math.abs(now_ms - last_request_ms));
			return;
		}
		
		last_request_ms = now_ms;
		var xhttp = new XMLHttpRequest();
		data['ext_version'] = ext_version;
		var query = "?" + Object.keys(data).map(function(key){return key + "=" + data[key]}).join('&');
		xhttp.open(type, main_url + path + query, true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.onload = function() {
			last_request_ms = now_ms;
			try {
				var result = JSON.parse(xhttp.responseText);
				onload(result);
			} catch(e) {
				onload({'error': '-'});
			}
		};
		xhttp.onerror = function() {
			onload({'error': '-'});
		};
		xhttp.send();
	}

	function buy(product_id) {
		chrome.tabs.create({url: main_url + '/store/buy?id=' + product_id + '&currency=' + currency});
	}
	
	function getUserInfo(need_load, callback) {
		if (info || !need_load) {
			callback && callback(info);
		}
		else {
			updateUndoButton(can_undo, true);
			request('POST', '/store/user', {}, function(res) {
				info = res.user;
				callback && callback(info);
				if (res.error) {
					request('GET', '/auth_info', {}, function(res) {
						updateUndoButton(can_undo, false);
						if (res.error && res.error.indexOf('Login failed') >= 0) {
							logout();
						}
					});
				} else {
					updateUndoButton(can_undo, false);
				}
			});
		}
	}
	
	function useUndo(callback) {
		updateUndoButton(can_undo, true);
		request('GET', '/store/use_undo', {}, function(res) {
			updateUndoButton(can_undo, false);
			info = res.user;
			callback && callback(res.success && info, info);
		});
	}
	
	function getProducts(callback) {
		if (products) {
			callback(products);
		}
		else {
			updateUndoButton(can_undo, true);
			request('GET', '/store/get_products', {}, function(res) {
				updateUndoButton(can_undo, false);
				products = res.products;
				callback && callback(products);
			});
		}
	}
	
	function login() {
		var request_callback = function (granted) {
			if (granted) {
				chrome.tabs.create({url: main_url + '/login'});
			}
		}
		if (!isFF) {
			chrome.permissions.request({
				origins: ['*://*.apihub.info/*']
			}, request_callback);
		} else {
			request_callback(true);
		}
	}
	function logout(callback) {
		request('GET', '/logout', {}, function(res) {
			clearNightModeData();
			setNightMode(false);
			info = null;
			updateUndoButton(false);
			callback && callback();
		});
	}
	
	function showStore(data) {
		KeyboardInputManager.enableKeyDown(false);
		
		if (!data || data.type == 'shop') {
			if (info) {
				var store_title_text = declOfNum(info.product_elements, [
					chrome.i18n.getMessage('store_title_0'),
					chrome.i18n.getMessage('store_title_1'),
					chrome.i18n.getMessage('store_title_2')
				]);
				store_title_text = store_title_text.replace(/\d/, info.product_elements);
				store_title.textContent = store_title_text;
				store_desription.textContent = chrome.i18n.getMessage(info.product_elements > 0 ? 'store_desription' : 'store_desription_zero');

				getProducts(function() {
					store_container.className = 'store-container products';
					email_text.textContent = info.email;

					products_container.textContent = '';
					for (var id in products) {
						var product_dom = document.createElement('div');
						product_dom.className = 'product';
						product_dom.id = id;
						var icon = document.createElement('img');
						icon.className = 'icon';
						icon.src = products[id].icon;
						var title = document.createElement('div');
						title.className = 'title';
						title.textContent = lang in products[id].name ? products[id].name[lang] : products[id].name[default_lang];
						var buy_btn = document.createElement('div');
						buy_btn.className = 'buy-btn';
						buy_btn.textContent = products[id].price;
						if (products[id].buyed) {
							product_dom.classList.add('buyed');
						} else {
							product_dom.addEventListener('click', function() {
								buy(this.id);
							});
						}
						product_dom.appendChild(icon);
						product_dom.appendChild(title);
						product_dom.appendChild(buy_btn);
						products_container.appendChild(product_dom);
					}
				});
			}
			else {
				store_container.className = 'store-container signin';
			}
		} else if (data.type == 'night_mode_promo') {
			store_container.className = 'store-container night_mode_promo';
			document.querySelector('#night_mode_promo .store-btn').textContent = chrome.i18n.getMessage('to_shop');
			getProducts(function() {
				if (products && products['night_mode']) {
					document.querySelector('#night_mode_promo .store-btn').textContent = chrome.i18n.getMessage('buy_now') + ' ' + products['night_mode'].price;
				}
			});
		}
	}
	function hideStore() {
		KeyboardInputManager.enableKeyDown(true);
		store_container.className = 'store-container';
	}
	function updateUndoButton(_can_undo = can_undo, loading = false) {
		can_undo = _can_undo;
		for (var i = 0; i < undo_btns.length; i++) {
			if (loading) {
				undo_btns[i].classList.add('loading');
				undo_btns[i].classList.add('disabled');
			}
			else {
				undo_btns[i].classList.remove('loading');
				if (!can_undo) {
					undo_btns[i].classList.add('disabled');
				}
				else {
					undo_btns[i].classList.remove('disabled');
				}
			}
			
			undo_btns[i].querySelector('.count').textContent = info ? info.product_elements : '?';
		}
	}
	
	close_buttons.forEach(function(d) {d.addEventListener('click', hideStore)});
	signin_button.addEventListener('click', login);
	signout_button.addEventListener('click', function() {
		logout(showStore);
	});
	report_buttons.forEach(function(d) {d.addEventListener('click', function(e) {
		e.preventDefault();
		chrome.tabs.create({url: this.href});
	})});
	currency_list.value = currency;
	currency_list.addEventListener('change', function() {
		currency = this.value;
		localStorage.currency = currency;
	});
	document.querySelector('#night_mode_promo .store-btn').addEventListener('click', function() {
		showStore();
	});
	
	function getNightStyle(callback) {
		if (localStorage['night_mode_style']) {
			callback(localStorage['night_mode_style']);
		} else {
			request('GET', '/store/get_night_style', {}, function(res) {
				if (res.success) {
					localStorage['night_mode_style'] = res.data;
					callback(res.data);
				} else {
					callback(null);
				}
			});
		}
	}
	
	function clearNightModeData() {
		window.SyncStorage.setItem('night_mode_on', false);
		localStorage['night_mode_on_tmp'] = '0';
		delete localStorage['night_mode_style'];
		document.querySelector('#night_mode_checkbox input').checked = false;
		var dark_style = document.getElementById('night_style');
		dark_style && dark_style.remove();
	}
	
	function simpleSetNightMode(on, callback) {
		var dark_style = document.getElementById('night_style');
		if (on && !dark_style) {
			getNightStyle(function(css_text) {
				if (css_text) {
					dark_style = document.createElement('link');
					dark_style.setAttribute("rel", "stylesheet");
					dark_style.setAttribute("type", "text/css");
					dark_style.href = window.URL.createObjectURL(new Blob([css_text], {type: 'text/css'}));
					dark_style.id = 'night_style';
					document.body.appendChild(dark_style);
					callback && callback(true);
				} else {
					callback && callback(false);
				}
			});
		} else if (!on && dark_style) {
			dark_style.remove();
			callback && callback(true);
		}
	}
	
	function setNightMode(on, user_click) {
		if (on && (!info || !info.has_night_mode)) {
			clearNightModeData();
			user_click && showStore({type: 'night_mode_promo'});
		} else {
			simpleSetNightMode(on, function(success) {
				if (!success) {
					clearNightModeData();
				}
			});
		}
	}
	
	document.querySelector('#night_mode_checkbox input').addEventListener('change', function(e) {
		window.SyncStorage.setItem('night_mode_on', this.checked);
		localStorage['night_mode_on_tmp'] = this.checked ? '1' : '0';
		setNightMode(this.checked, true);
	});
	document.querySelector('#night_mode_checkbox input').checked = localStorage['night_mode_on_tmp'] == '1';
	simpleSetNightMode(document.querySelector('#night_mode_checkbox input').checked);
	getUserInfo(true, function() {
		window.SyncStorage.getItem('night_mode_on', function(night_mode_on) {
			localStorage['night_mode_on_tmp'] = night_mode_on ? '1' : '0';
			document.querySelector('#night_mode_checkbox input').checked = !!night_mode_on;
			setNightMode(!!night_mode_on, false);
		});
	});

	return {
		controller: {
			buy: buy,
			login: login,
			getInfo: getUserInfo,
			useUndo: useUndo
		},
		view: {
			showStore: showStore,
			hideStore: hideStore,
			updateUndoButton: updateUndoButton
		}
	}
}