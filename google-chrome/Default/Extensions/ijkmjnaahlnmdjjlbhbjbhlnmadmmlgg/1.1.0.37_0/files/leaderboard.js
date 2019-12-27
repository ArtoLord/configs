var MIN_RECORD_FOR_PUBLISH = 500;
function lbRequest(data, onload) {
	data["app"] = "2048";
	if (!data["top"]) {
		data["top"] = 1;
	}
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "http://data.apihub.info/", true);
    xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.onload = function() {
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
	xhttp.send(JSON.stringify({data: enc(JSON.stringify(data))}));
}

window.Leaderboard = function(store) {
	
	var store = store;
	var state = null;
	var leaderboardDom = document.querySelector('.leaderboard-container');
	var leaderboardBtn = document.querySelector('.leaderboard-btn');
	var lbInfo = {
		userId: null,
		userName: null,
		bestScoreObj: null
	};
	var currentBestScoreObj;
	var loading = false;
	var onHideCallback = null;
	
	function generateUID()
	{
		var res = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		for (var randIter = 0; randIter < 32; ++randIter)
		{
			res += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return res;
	}
	
	function initListeners() {
		leaderboardDom.querySelector('#bestscore .btn.save').onclick = function() {
			showForm();
		}
		leaderboardDom.querySelector('#bestscore .btn.cancel').onclick = function() {
			hide();
		}
		leaderboardDom.querySelector('#form .input').onkeyup = function() {
			if (loading) return;
			
			if (this.value.length > 32) {
				this.value = this.value.substr(0, 32);
			}
			
			lbInfo.userName = this.value;
			SyncStorage.setItem('lbInfo', lbInfo);
		}
		leaderboardDom.querySelector('#form .btn.save').onclick = function() {
			var btn = this;
			
			store.controller.getInfo(false, function(info) {
				if (currentBestScoreObj.undos && !info) {
					store.view.showStore();
					return;
				}
				
				if (loading) return;
			
				loading = true;
				btn.classList.add('loading');
				if (!lbInfo.userName) {
					lbInfo.userName = 'User' + parseInt(Math.random() * 10000);
				}
				lbRequest({
					method: "set",
					id: lbInfo.userId,
					name: lbInfo.userName,
					scoreObj: currentBestScoreObj
				}, function(res) {
					loading = false;
					btn.classList.remove('loading');
					if (res.success) {
						lbInfo.bestScoreObj = currentBestScoreObj;
						SyncStorage.setItem('lbInfo', lbInfo);
					}
					showTop();
				});
			});
		}
		leaderboardDom.querySelector('#form .btn.cancel').onclick = function() {
			if (loading) return;
			
			hide();
		}
	}
	
	function showSuggestion(scoreObj, userClick, onHide) {
		onHideCallback = onHide;
		clear();
		if (!userClick || (scoreObj && scoreObj.score > lbInfo.bestScoreObj.score)) {
			if (!userClick) {
				leaderboardDom.querySelector('#congrat').style.display = 'inline';
				leaderboardDom.classList.add('anim');
			} else {
				leaderboardDom.querySelector('#congrat').style.display = 'none';
				leaderboardDom.classList.remove('anim');
			}
			state = 'bestscore';
			leaderboardDom.classList.add('bestscore');
			leaderboardDom.querySelector('#score').textContent = scoreObj.score;
			currentBestScoreObj = scoreObj;
		} else {
			showTop();
		}
		leaderboardBtn.classList.add('back');
	}
	function showForm() {
		clear();
		state = 'form';
		leaderboardDom.classList.add('form');
		leaderboardDom.querySelector('#form .input').value = lbInfo.userName;
		KeyboardInputManager.enableKeyDown(false);
	}
	
	function createTopRow(rank, name, score, undos) {
		var rowDom = document.createElement('div');
		rowDom.className = "row";
		rowDom.setAttribute('rank', rank);
		var rankDom = document.createElement('div');
		rankDom.className = 'rank';
		rankDom.textContent = rank + '.';
		var nameDom = document.createElement('div');
		nameDom.className = 'name';
		nameDom.textContent = name;
		var scoreDom = document.createElement('div');
		scoreDom.className = 'score';
		scoreDom.textContent = parseInt(score);

		rowDom.appendChild(rankDom);
		rowDom.appendChild(nameDom);
		rowDom.appendChild(scoreDom);
		
		if (undos) {
			rowDom.classList.add('undos');
		}
		
		return rowDom;
	}
	
	function showTop() {
		clear();
		state = 'table';
		leaderboardDom.classList.add('table');
		leaderboardDom.scrollTop = 0;
		loading = true;
		var table = document.querySelector('.leaderboard-container #table');
		table.classList.remove('empty');
		table.classList.add('loading');
		KeyboardInputManager.enableKeyDown(false);
		lbRequest({method: 'get', top: 100, id: lbInfo.userId}, function(res) {
			loading = false;
			table.classList.remove('loading');
			while (table.firstChild) {
				table.firstChild.remove();
			}
			
			var myId = res.myResult && res.myResult.id;
			var isInTop = false;
			if (res.success && res.top && res.top.length > 0) {
				for (var i = 0; i < res.top.length; i++) {
					var row = res.top[i];
					var rowDom = createTopRow(row.rank + 1, row.name, row.score, row.undos);
					if (!isInTop && row.id == myId) {
						isInTop = true;
						rowDom.classList.add('selected');
					}
					table.appendChild(rowDom);
				}
				if (myId && !isInTop) {
					var rowDom = createTopRow(res.myResult.rank + 1, res.myResult.name, res.myResult.score, res.myResult.undos);
					rowDom.classList.add('border');
					rowDom.classList.add('selected');
					table.insertBefore(rowDom, table.firstChild);
				}
			} else {
				table.classList.add('empty');
			}
		});
	}
	function isOpened() {
		return leaderboardDom.classList.contains('table') || 
			leaderboardDom.classList.contains('form') || 
			leaderboardDom.classList.contains('bestscore');
	}
	function clear() {
		KeyboardInputManager.enableKeyDown(true);
		leaderboardDom.classList.remove('anim');
		leaderboardDom.classList.remove('table');
		leaderboardDom.classList.remove('form');
		leaderboardDom.classList.remove('bestscore');
		state = null;
	}
	function hide(strict) {
		if (!strict && typeof onHideCallback == 'function') {
			onHideCallback(state);
		}
		onHideCallback = null;
		leaderboardBtn.classList.remove('back');
		clear();
	}
	
	SyncStorage.getItem('lbInfo', function(lb_info) {
		lbInfo = lb_info || {
			userId: generateUID(),
			userName: "",
			bestScoreObj: {score: 0}
		};
	});
	initListeners();
	
	return {
		showSuggestion: showSuggestion,
		hide: hide,
		isOpened: isOpened,
		bestLBScore: function() {
			return lbInfo.bestScoreObj ? lbInfo.bestScoreObj.score : 0;
		}
	}
}