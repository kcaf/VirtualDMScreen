var CombatantModel = function(){
	var _this = this;
	_this.Id = ko.observable(null).extend({ trackChange: true });
	_this.ModelType = ko.observable().extend({ trackChange: true });
	_this.Size = ko.observable().extend({ trackChange: true });
	_this.Name = ko.observable().extend({ trackChange: true });
	_this.Initiative = ko.observable().extend({ trackChange: true });
	_this.AC = ko.observable().extend({ trackChange: true });
	_this.HP = ko.observable().extend({ trackChange: true });
	_this.Skip = ko.observable().extend({ trackChange: true });
	_this.Effects = ko.observableArray().extend({ trackChange: true });
	_this.Level = ko.observable().extend({ trackChange: true });
	_this.CR = ko.observable().extend({ trackChange: true });
	_this.MaxHP = ko.observable().extend({ trackChange: true });
	_this.PositionTop = ko.observable("").extend({ trackChange: true });
	_this.PositionLeft = ko.observable("").extend({ trackChange: true });
	_this.ZIndex = ko.observable(0).extend({ trackChange: true });
	_this.LatLng = ko.observable().extend({ trackChange: true });
	_this.Token = ko.observable(null).extend({ trackChange: true });
	_this.Angle = ko.observable(0).extend({ trackChange: true });
	_this.CurrentLink = null;
	_this.ClickY = null;
	_this.ClickX = null;

	_this.Name.subscribe(function(newValue) {
		$.each(WORKSPACE.ViewModels.CombatViewModel.CustomIcons(), function(z, x) {
			if(x.name == _this.Name()) {
				_this.Token(x.token);
				WORKSPACE.ViewModels.CombatViewModel.LoadTokens();
			}
		});
	});

	_this.PickToken = function(data, event) {
		var result = prompt("Token URL", ""),
			combatvm = WORKSPACE.ViewModels.CombatViewModel;
		if(result){
			_this.Token(result);
			$.each(combatvm.CustomIcons(), function(z, x) {
				if(x.name && x.name == _this.Name()){
					combatvm.CustomIcons.remove(x);
				}
			});
			combatvm.CustomIcons.push({ name: _this.Name(), token: _this.Token() });
			combatvm.LoadTokens();
		}
	};

	_this.ViewCombatant = function(data, event) {
		if(_this.Id() !== null && _this.ModelType() == "NPC") {
			WORKSPACE.Helpers.ViewNPC(_this.Id(), event);
		}
	};

	_this.Distance = function (point1, point2) {
		var xs = 0;
		var ys = 0;

		xs = point2.x - point1.x;
		xs = xs * xs;

		ys = point2.y - point1.y;
		ys = ys * ys;

		return Math.sqrt( xs + ys );
	};

	_this.MouseMove = function(data, event) {
		if(WORKSPACE.Clicked)
			_this.DragScroll(event);
	};

	_this.MouseDown = function(data, event) {
		WORKSPACE.Clicked = true;
		_this.ClickY = event.pageY;
		_this.ClickX = event.pageX;

		var from = $(event.currentTarget),
			fromLeft = parseInt(from.css("left").slice(0,-2)),
			fromTop = parseInt(from.css("top").slice(0,-2));

		_this.CurrentLink = {
			left: fromLeft,
			top: fromTop
		};
	};

	_this.MouseUp = function(data, event) {
		var canvas = $("#grid-canvas")[0],
			ctx = canvas.getContext("2d");

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		_this.CurrentLink = null;
		WORKSPACE.Clicked = false;
	};

	_this.DragScroll = function(event) {
		var target = $(event.currentTarget),
			position = target.position();
		_this.PositionLeft(position.left + "px");
		_this.PositionTop(position.top + "px");
		_this.ZIndex(target.css("z-index"));
		_this.Connect(event);
	};

	_this.TokenClass = ko.pureComputed(function() {
		var dead = _this.HP() <= 0 ? " dead" : "";
		return "grid-token " + (_this.ModelType() ? _this.ModelType().toLowerCase() : "unknown") + "-row" + dead + " size-" + _this.Size();
	});

	_this.Style = ko.pureComputed(function() {
		return "left: " + _this.PositionLeft() + "; top: " + _this.PositionTop() + ";";
	});

	_this.RowClass = ko.pureComputed(function() {
		var dead = _this.HP() <= 0 ? " dead" : "";
		return (_this.ModelType() ? _this.ModelType().toLowerCase() : "unknown") + "-row" + dead + " size-" + _this.Size();
	});

	_this.NameShort = ko.pureComputed(function() {
		if(_this.Name() && _this.Name().length)
			return _this.Name().slice(0,1);
		else
			return _this.Name();
	});

	_this.XP = ko.pureComputed(function() {
		if(!_this.CR()) return 0;
		return WORKSPACE.XPPerCR[_this.CR()];
	});

	_this.ACBasic = ko.pureComputed({
		read: function () {
			if(!_this.AC()) return "";
			return _this.AC().split(" ")[0];
		},
		write: function (newValue) {
			_this.AC(newValue);
		},
		owner: _this
	});

	_this.MaxHPText = ko.pureComputed(function() {
		if(!_this.MaxHP()) return _this.HP();
		return "Max: " + _this.MaxHP();
	});

	_this.LevelAndCR = ko.pureComputed({
		read: function() {
			if(_this.Level()) return _this.Level();
			if(_this.CR()) return _this.CR();
		},
		write: function(newValue) {
			if(_this.Level()) _this.Level(newValue);
			if(_this.CR()) _this.CR(newValue);
		}
	});

	_this.HP.subscribe(function(newValue) {
		WORKSPACE.ViewModels.CombatViewModel.LoadTokens();
	});

	_this.CalculateHP = ko.pureComputed({
		read: function() {
			return _this.HP();
		},
		write: function(newValue) {
			var total= 0, 
				matches = newValue.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
			while(matches.length){
				total+= parseFloat(matches.shift());
			}
			if (!_this.MaxHP()) _this.MaxHP(_this.HP());
			_this.HP(total);
		},
		owner: _this
	});
	
	_this.Load = function(data){
		if (data.ModelType == "Player") {
			_this.Initiative(data.Initiative);
			_this.HP(data.HP);
			_this.Level(data.Level);
			_this.Size("M");
		} else if (data.ModelType == "NPC") {
			_this.Id(data.Id);
			_this.Size(data.Size);
			_this.CR(data.CR);
			var init = data.Initiative || WORKSPACE.Helpers.Roll( 1,20 ) + parseInt( data.DEXMOD );
			_this.Initiative( init >= 0 ? init : 0 );

			var hpArr = ("" + data.HP).split("("),
				rollArr = [],
				hp = 0;

			if (typeof hpArr == "object" && hpArr.length > 1) {
				//console.log(hpArr, typeof hpArr);
				hpArr = hpArr[1].split(")");
				//console.log(hpArr);
				rollArr = hpArr[0].match(/\d+d\d+/g);
				//console.log(rollArr);
				rollSplit = rollArr[0].split("d");
				//console.log(rollSplit);
				for(i=0; i<rollSplit[0]; i++){
					hp += parseInt(WORKSPACE.Helpers.Roll( 1,rollSplit[1]) );
					//console.log(hp);
				}
				hp += parseInt(hpArr[0].slice(rollArr[0].length)) || 0;
				//console.log(hp);
			} else {
				hp = parseInt(hpArr[0]);
			}

			var dataHPSplit = ("" + data.HP).split("d");
			if(typeof dataHPSplit == "object" && dataHPSplit.length > 1) 
				_this.HP(hp);
			else
				_this.HP(data.HP || hp);
		} else {
			_this.Size("M");
		}

		_this.PositionTop(data.PositionTop || 0);
		_this.PositionLeft(data.PositionLeft || 0);
		_this.ZIndex(data.ZIndex || 0);
		_this.MaxHP(data.MaxHP || null);
		_this.ModelType(data.ModelType);
		_this.Name(data.Name || "");
		_this.AC(data.AC);
		_this.Skip(data.Skip || false);
		_this.Effects(data.Effects || []);
		_this.LatLng(data.LatLng || null);
		_this.Token(data.Token || null);
		_this.Angle(data.Angle || 0);
	};

	_this.AddEffect = function(){
		
	};
};

var CombatViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.Interval = null;
	_this.ActiveTab = ko.observable(0).extend({ trackChange: true });
	_this.CombatantList = ko.observableArray().extend({ trackChange: true });
	/*_this.GridTokens = ko.observableArray();*/
	_this.Combatant = new CombatantModel();
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });
	_this.GridWidth = ko.observable();
	_this.MapSlides = ko.observableArray().extend({ trackChange: true });
	_this.MapToAdd = ko.observable();
	_this.ShowGridLines = ko.observable(true).extend({ trackChange: true });
	_this.AltGridColor = ko.observable(false).extend({ trackChange: true });
	_this.ActiveMap = ko.observable("").extend({ trackChange: true });
	_this.ShowOutlines = ko.observable(false).extend({ trackChange: true });
	_this.CustomIcons = ko.observableArray().extend({ trackChange: true });
	_this.TokenScale = ko.observable(1).extend({ throttle: 200, trackChange: true });
	_this.TransmitMap = ko.observable(false).extend({ trackChange: true });
	_this.GridCenter = ko.observable([0,0]).extend({ trackChange: true });
	_this.GridZoom = ko.observable(1).extend({ trackChange: true });

	/*_this.Interval = setInterval(function() {
		if(WORKSPACE.IsLoaded) {
			$(_this.Selector).find(".grid-token").each(function() {
				if(!$(this).hasClass("ui-draggable")){
					$(this).draggable({ 
						grid: [ 15, 15 ],
						containment: "#grid-map",
						stack: ".grid-token",
						scale: true,
						scroll: false
					});
				}
			});
		}
	}, 500);*/

	_this.CombatantList.subscribe(function(newValue) {
		_this.LoadTokens();
	});

	_this.ShowOutlines.subscribe(function(newValue) {
		_this.LoadTokens();
	});

	_this.TokenScale.subscribe(function(newValue) {
		if(newValue){
			_this.LoadTokens();
		}
	});

	_this.LoadTokens = function(reset) {
		$.each(WORKSPACE.GridLayers, function(i, v) {
			WORKSPACE.GridMap.removeLayer(v);
		});

		var boxSize = WORKSPACE.TokenSize.M * _this.TokenScale() + "px";
		boxSize = boxSize + " " + boxSize;
		$("#grid-lines").css("background-size", boxSize);

		$.each(_this.CombatantList(), function(i, v) {
			var token = null;
			if(v.Name() && v.Name() !== "") {
				$.each(_this.CustomIcons(), function(z, x) {
					if(x.name == v.Name()) {
						//if(v.Token())
						//	x.token = v.Token();
						token = x.token;
						//v.Token(token);
					}
				});
			}

			if(token === null) {
				if(v.Token() === null) {
					if(v.ModelType() == "Player")
						token = "http://i.imgur.com/BF7DY3I.png";
					else 
						token = "http://i.imgur.com/dgZ2jjL.png";
					v.Token(token);
				} else {
					token = v.Token();
					var found = false;
					$.each(_this.CustomIcons(), function(z, x) {
						if(x.name == v.Name()){
							found = true;
							_this.CustomIcons.remove(x);
						}
					});
					
					_this.CustomIcons.push({ name: v.Name(), token: v.Token() });
				}
			}

			var classes = (v.HP() <= 0 ? "dead " : "") + (_this.ShowOutlines() ? "outline " + v.ModelType() : "");
			var size = WORKSPACE.TokenSize[v.Size()] * _this.TokenScale(),
				icon = new L.icon({
				iconUrl: token,
				iconSize: [size, size],
				className: classes
			});

			v.LatLng( !v.LatLng() || reset ? L.latLng(50,50) : v.LatLng() );
			//v.LatLng( !v.LatLng() || reset ? WORKSPACE.GridMap.getCenter() : v.LatLng() );

			var marker = new L.marker(v.LatLng(), {
				draggable: "true",
				icon: icon,
				title: v.Name(),
				alt: v.Name(),
				iconAngle: v.Angle()
			});

			marker.bindPopup(v.Name(), {
				closeButton: false,
				offset: L.point(0, 38 * _this.TokenScale()),
				closeOnClick: false,
				opacity: 0.7,
				autoPan: false
			});

			marker.on("dragend", function(event) {
				var marker = event.target;
				v.LatLng(marker.getLatLng());
			});

			marker.on("drag", function(event) {
				marker.setIconAngle(v.Angle());
			});

			marker.on("dblclick", function(event) {
				var e = event.originalEvent;
				e.stopPropagation();
				WORKSPACE.Helpers.ViewNPC(v.Id(), e);
			});

			marker.on("contextmenu", function(event) {
				v.Angle((v.Angle() + 45) % 360);
				marker.setIconAngle(v.Angle());
			});

			marker.on("mousedown", function(event) {
				var e = event.originalEvent,
					from = WORKSPACE.DistanceFrom;
				e.stopPropagation();
				if (e.which > 1) {
					from.left = $(e.srcElement).offset().left + $(e.srcElement).width()/2;
					from.top = $(e.srcElement).offset().top + $(e.srcElement).height()/2;
					WORKSPACE.ShowDistance = true;
				}
			});

			marker.on("mouseup", function(event) {
				WORKSPACE.Helpers.DisableDistance(event.originalEvent);
			});

			WORKSPACE.GridLayers.push(marker);
			marker.addTo(WORKSPACE.GridMap);

			//WORKSPACE.GridMap.addLayer(marker);

			/*var origin = null;
			marker.on("dragstart", function(event) {
				var marker = event.target;
				origin = marker.getLatLng();
			});*/
			/*marker.on("drag", function(event){
				var step = 50,
					marker = event.target,
					latDiff = marker.getLatLng().lat - origin.lat,
					lngDiff = marker.getLatLng().lng - origin.lng,
					latMove = Math.abs(latDiff) >= step,
					lngMove = Math.abs(lngDiff) >= step,
					latDelta = 0,
					lngDelta = 0;

				if( latMove ) latDelta += step * (latDiff > 0 ? 1 : -1);
				if( lngMove ) lngDelta += step * (lngDiff > 0 ? 1 : -1);

				marker.setLatLng( L.latLng( origin.lat + latDelta, origin.lng + lngDelta ) );
				origin = marker.getLatLng();
			});*/
		});
	};

	_this.ResetTokens = function() {
		_this.LoadTokens(true);
	};

	_this.AddMap = function(data, event) {
		_this.MapSlides.push({ Source: _this.MapToAdd() });
		_this.MapToAdd("");
	};

	_this.RemoveMap = function(map) {
		_this.MapSlides.remove(map);
	};

	_this.ActiveMap.subscribe(function(newValue){
		if (newValue !== "") {
			WORKSPACE.Helpers.SwapMap(newValue);
		}
	});

	_this.LoadMap = function(data, event) {
		_this.ActiveMap(event.currentTarget.src);
		//WORKSPACE.Helpers.SwapMap(event.currentTarget.src);
		//_this.GridBackground( "url(" + event.currentTarget.src + ")" );
	};

	_this.OrderedCombatantList = ko.pureComputed(function(){
		return _this.CombatantList().sort(function(a, b) {
			var z = parseInt(a.Initiative() || 0),
				x = parseInt(b.Initiative() || 0);
			if(z < x)
				return 1;
			else if(z > x)
				return -1;
			else if(z === x){
				return (a.Name() < b.Name()) ? -1 : 1;
			}
		});
	});

	_this.Difficulty = ko.pureComputed(function() {
		var difficulty = "Unknown",
			partyXPThreshold = [0,0,0,0],
			players = [],
			npcs = [];

		$.each(_this.CombatantList(), function(i, v) {
			if(v.ModelType() == "NPC")
				npcs.push(v);
			else if(v.ModelType() == "Player")
				players.push(v);
		});

		if (players.length) {
			// Create party's xp threshold
			$.each(players, function(i, v) {

				// If player's level isn't set
				if(!v.Level()){
					partyXPThreshold = null;
				}

				if(partyXPThreshold === null)
					return;

				// Total party threshold
				for(i=0; i<partyXPThreshold.length; i++) {
					partyXPThreshold[i] += WORKSPACE.XPPerLevel[v.Level()][i];
				}

			});
		} else {
			return difficulty;
		}

		// If a player doesn't have level set, fail out.
		if(partyXPThreshold !== null){
			var len = npcs.length,
				multiplier = 0,
				adjustedxp = 0,
				xp = 0,
				index = 0;

			// Adjust for number of monsters
			if(len < 2) index = 0; else
				if(len < 3) index = 1; else
					if(len < 7) index = 2; else
						if(len < 11) index = 3; else
							if(len < 15) index = 4; else
								index = 5;

			// Adjust for smaller parties
			if( WORKSPACE.ViewModels.PlayersViewModel.PlayersList().length < 3)
				index++;

			// Set multiplier
			multiplier = WORKSPACE.Multipliers[index];

			// Total monster xp
			$.each(npcs, function(i, v) {
				xp += parseInt(v.XP());
			});

			// Encounter's adjusted xp
			adjustedxp = xp * multiplier;

			// Determine difficulty
			if(adjustedxp < partyXPThreshold[0]) difficulty = "Trivial"; else 
				if(adjustedxp < partyXPThreshold[1]) difficulty = "Easy"; else 
					if(adjustedxp < partyXPThreshold[2]) difficulty = "Medium"; else 
						if(adjustedxp < partyXPThreshold[3]) difficulty = "Hard"; else 
							difficulty = "Deadly";
		}
		return difficulty;
	});

	_this.AddCombatant = function(data) {
		if (data === undefined) {
			_this.CombatantList.push(new CombatantModel());
			return;
		}
		var dupe = false,
			combatant = new CombatantModel();

		$.each(_this.CombatantList(), function(i,v) {
			if(v.Name() == data.Name)
				dupe = true;
		});

		if (!dupe || data.ModelType == "NPC") {
			combatant.Load(data);
			_this.CombatantList.push(combatant);
		}
	};
	
	_this.RemoveCombatant = function(combatant) {
		_this.CombatantList.remove(combatant);
	};
	
	_this.SetActiveTab = function(index) {
		_this.ActiveTab(index);
	};
	
	_this.Load = function(data) {
		_this.ActiveTab(data.ActiveTab || 0);
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});

		_this.IsMinimized(data.IsMinimized);
		_this.ShowOutlines(data.ShowOutlines || false);
		_this.ShowGridLines(data.ShowGridLines || false);
		_this.AltGridColor(data.AltGridColor || false);
		_this.ActiveMap(data.ActiveMap || "");
		_this.CustomIcons(data.CustomIcons || []);
		_this.TokenScale(data.TokenScale || 1);
		_this.GridCenter(data.GridCenter || [0,0]);
		_this.GridZoom(data.GridZoom || 1);

		var tmpList = [];
		if(data.CombatantList.length > 0){
			for(i=0; i<data.CombatantList.length; i++){
				var tmp = new CombatantModel();
				tmp.Load(data.CombatantList[i]);
				tmpList.push(tmp);
			}
			
			_this.CombatantList(tmpList);
		}

		_this.MapSlides(data.MapSlides || []);
	};
};
