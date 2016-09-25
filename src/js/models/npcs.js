var NPCModel = function(){
	var _this = this;
	_this.ModelType = "NPC";
	_this.Id = ko.observable().extend({ trackChange: true });
	_this.Name = ko.observable().extend({ trackChange: true });
	_this.Description = ko.observable().extend({ trackChange: true });
	_this.Size = ko.observable().extend({ trackChange: true });
	_this.Type = ko.observable().extend({ trackChange: true });
	_this.Alignment = ko.observable().extend({ trackChange: true });
	_this.AC = ko.observable().extend({ trackChange: true });
	_this.HP = ko.observable().extend({ trackChange: true });
	_this.Speed = ko.observable().extend({ trackChange: true });
	_this.STR = ko.observable().extend({ trackChange: true });
	_this.DEX = ko.observable().extend({ trackChange: true });
	_this.CON = ko.observable().extend({ trackChange: true });
	_this.INT = ko.observable().extend({ trackChange: true });
	_this.WIS = ko.observable().extend({ trackChange: true });
	_this.CHA = ko.observable().extend({ trackChange: true });
	_this.Skill = ko.observable().extend({ trackChange: true });
	_this.Resist = ko.observable().extend({ trackChange: true });
	_this.Senses = ko.observable().extend({ trackChange: true });
	_this.Passive = ko.observable().extend({ trackChange: true });
	_this.Languages = ko.observable().extend({ trackChange: true });
	_this.CR = ko.observable().extend({ trackChange: true });
	_this.Trait = ko.observableArray().extend({ trackChange: true });
	_this.Action = ko.observableArray().extend({ trackChange: true });
	_this.Immune = ko.observable().extend({ trackChange: true });
	_this.ConditionImmune = ko.observable().extend({ trackChange: true });
	_this.Spells = ko.observable().extend({ trackChange: true });
	_this.Legendary = ko.observableArray().extend({ trackChange: true });
	_this.Save = ko.observable().extend({ trackChange: true });
	_this.Source = ko.observable().extend({ trackChange: true });
	_this.Vulnerable = ko.observable().extend({ trackChange: true });
	_this.Reaction = ko.observableArray().extend({ trackChange: true });
	_this.IsRemoveVisible = ko.observable(false);
	_this.Similar = ko.observableArray();
	_this.SelectedSimilar = ko.observableArray().extend({ trackChange: true });

	_this.PopulateSimilar = function(){
		if (_this.Id() === undefined) return [{Id: 0, Name: "None [0]", Cost: 0}];
		var arr = [];
		$.each(MONSTERS, function(i, v) {
			if(_this.Name() == v.name) return;
			var obj = { Id: i, Name: v.name, Cost: 0};
			obj.Cost += _this.Name().levenstein(v.name);
			obj.Cost += _this.Type().levenstein(v.type) * 5;
			//obj.Cost += _this.Size().levenstein(v.size);
			obj.Cost += _this.CR().levenstein(v.cr);
			obj.Cost += _this.AC().levenstein(v.ac);
			/*obj.Cost += _this.STR().levenstein(v.str);
			obj.Cost += _this.DEX().levenstein(v.dex);
			obj.Cost += _this.CON().levenstein(v.con);
			obj.Cost += _this.INT().levenstein(v.int);
			obj.Cost += _this.WIS().levenstein(v.wis);
			obj.Cost += _this.CHA().levenstein(v.cha);*/
			obj.Cost += _this.Alignment().levenstein(v.alignment) * 5;
			obj.Cost += _this.HP().split(" ")[0].levenstein(v.hp.split(" ")[0]);
			//var percent = (100 - obj.Cost) < 0 ? 0 : 100 - obj.Cost;
			//obj.Name = percent + "%   " + obj.Name;
			arr.push(obj);
		});

		arr.sort(function(a, b) {
			return a.Cost < b.Cost ? -1 : 1;
		});

		_this.Similar(arr.slice(1,11));
	};

	_this.SelectedSimilar.subscribe(function(newValue) {
		if(newValue === undefined) return;
		WORKSPACE.NPCView.dialog("close");
		WORKSPACE.NPCViewVM.Load(newValue.Id, MONSTERS[newValue.Id]);
		WORKSPACE.ViewModels.NPCsViewModel.CurrentNPCId = newValue.Id;
		WORKSPACE.NPCView.dialog("option", "title", MONSTERS[newValue.Id].name);
		WORKSPACE.NPCView.dialog("open");
		WORKSPACE.NPCViewVM.PopulateSimilar();
	});

	_this.ShowRemove = function(){
		_this.IsRemoveVisible(true);
	};
	
	_this.HideRemove = function(){
		_this.IsRemoveVisible(false);
	};

	_this.PassivePerception = ko.pureComputed(function() {
		return "passive perception " + _this.Passive();
	});

	_this.TotalSenses = ko.pureComputed(function() {
		var senses = _this.Senses(),
			passive =  _this.PassivePerception();
		if (senses && passive) return senses + '; ' + passive; else 
		if (senses) return senses; else 
		if (passive) return passive; else
			return null;
	});

	_this.XP = ko.pureComputed(function() {
		return WORKSPACE.XPPerCR[_this.CR()];
	});

	_this.Challenge = ko.pureComputed(function() {
		return _this.CR() + " (" + _this.XP() + " XP)";
	});

	_this.SizeText = ko.pureComputed(function() {
		switch(_this.Size()){
			case "F":
				return "Fine";
			case "D":
				return "Diminutive";
			case "T":
				return "Tiny";
			case "S":
				return "Small";
			case "M":
				return "Medium";
			case "L":
				return "Large";
			case "H":
				return "Huge";
			case "G":
				return "Gargantuan";
			case "C":
				return "Colossal";
			default:
				return "(Unknown Size)";
		}
	});

	/*_this.Actions = ko.pureComputed(function() {
		var actions = [];
		if(!_this.Action().length)
			return actions;

		$.each(_this.Action(), function(i, v) {
			var obj = {};
			obj.name = v.name;
			obj.text = v.text;
			if(v.attack !== "") {
				var attack = v.attack.split('|');
				obj.bonus = attack[1] > 0 ? "+" + attack[1] : attack[1] < 0 ? "-" + attack[1] : attack[1];
				obj.damage = attack[2];
			}
			actions.push(obj);
		});
		return actions;
	});*/

	_this.BasicDescription = ko.pureComputed(function() {
		return _this.SizeText() + ' ' + _this.Type() + ', ' + _this.Alignment();
	});

	_this.STRMOD = ko.pureComputed(function() {
		return _this.MOD(_this.STR());
	});

	_this.DEXMOD = ko.pureComputed(function() {
		return _this.MOD(_this.DEX());
	});

	_this.CONMOD = ko.pureComputed(function() {
		return _this.MOD(_this.CON());
	});

	_this.INTMOD = ko.pureComputed(function() {
		return _this.MOD(_this.INT());
	});

	_this.WISMOD = ko.pureComputed(function() {
		return _this.MOD(_this.WIS());
	});

	_this.CHAMOD = ko.pureComputed(function() {
		return _this.MOD(_this.CHA());
	});

	_this.MOD = function(value){
		var val = Math.floor((value - 10) / 2);
		return val > 0 ? '+' + val : val;
	};

	_this.Load = function(id, data){
		_this.Id(id);
		_this.Name(data.name || "");
		_this.Description(data.description || "");
		_this.Size(data.size || "");
		_this.Type(data.type || "");
		_this.Alignment(data.alignment || "");
		_this.AC(data.ac || "");
		_this.HP(data.hp || "");
		_this.Speed(data.speed || "");
		_this.STR(data.str || "");
		_this.DEX(data.dex || "");
		_this.CON(data.con || "");
		_this.INT(data.int || "");
		_this.WIS(data.wis || "");
		_this.CHA(data.cha || "");
		_this.Skill(data.skill || "");
		_this.Resist(data.resist || "");
		_this.Senses(data.senses || "");
		_this.Passive(data.passive || "");
		_this.Languages(data.languages || "");
		_this.CR(data.cr || "");
		_this.Trait(data.trait || []);
		_this.Action(data.action || []);
		_this.Immune(data.immune || "");
		_this.ConditionImmune(data.conditionImmune || "");
		_this.Spells(data.spells || "");
		_this.Legendary(data.legendary || []);
		_this.Save(data.save || "");
		_this.Source(data.source || "");
		_this.Vulnerable(data.vulnerable || "");
		_this.Reaction(data.reaction || []);
	};
};

var GroupModel = function(title){
	var _this = this;
	_this.NPCs = ko.observableArray().extend({ trackChange: true });
	_this.Title = ko.observable(title || "").extend({ rateLimit: 500, trackChange: true });

	_this.Load = function(data){
		_this.Title(data.Title || "");
		$.each(data.NPCs, function(i, v) {
			_this.AddNPC(v.Id);
		});
	};

	_this.NPCsByCR = ko.pureComputed(function() {
		return _this.NPCs().sort(function(a, b) {
			var abits = a.CR().split("/"),
				bbits = b.CR().split("/"),
				acr = (abits.length > 1) ? parseInt(abits[0],10)/parseInt(abits[1],10) : parseInt(abits[0]),
				bcr = (bbits.length > 1) ? parseInt(bbits[0],10)/parseInt(bbits[1],10) : parseInt(bbits[0]);

			
			if(acr < bcr)
				return -1;
			else if(acr > bcr)
				return 1;
			else if(acr === bcr)
				return a.Name() < b.Name() ? -1 : 1;
		});
	});

	_this.Difficulty = ko.pureComputed(function() {
		var difficulty = "Unknown",
			partyXPThreshold = [0,0,0,0];

		if (WORKSPACE.ViewModels.PlayersViewModel.PlayersList().length) {
			// Create party's xp threshold
			$.each(WORKSPACE.ViewModels.PlayersViewModel.PlayersList(), function(i, v) {

				// If player's level isn't set
				if(!v.Level()){
					partyXPThreshold = null;
					return;
				}

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
			var len = _this.NPCs().length,
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
			$.each(_this.NPCs(), function(i, v) {
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
	
	_this.AddNPC = function(id){
		var npc = new NPCModel();
		npc.Load(id, MONSTERS[id]);
		_this.NPCs.push(npc);
	};
	
	_this.RemoveNPC = function(npc){
		_this.NPCs.remove(npc);
	};
};

var NPCsViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.ActiveTab = ko.observable(0).extend({ trackChange: true });
	_this.CurrentNPCId = 0;
	_this.Search = ko.observable("").extend({ rateLimit: 500 }).extend({ trackChange: true });
	_this.Type = ko.observable("").extend({ rateLimit: 500 }).extend({ trackChange: true });
	_this.CRList = ko.observableArray(WORKSPACE.CRArray);
	_this.CR = ko.observable("").extend({ rateLimit: 500 }).extend({ trackChange: true });
	_this.SearchList = ko.observableArray();
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });
	_this.GroupList = ko.observableArray([new GroupModel("Group1")]).extend({ trackChange: true });
	_this.SelectedGroup = ko.observable().extend({ trackChange: true });

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
		_this.Search(data.Search || "");
		_this.Type(data.Type || "");
		_this.CR(data.CR || "");

		var tmpList = [];
		
		if(data.GroupList.length > 0){
			$.each(data.GroupList, function(i, v){
				var tmpgroup = data.GroupList[i];
				var group = new GroupModel();
				group.Load(tmpgroup);
				if(data.SelectedGroup.Title == tmpgroup.Title)
					_this.SelectedGroup(group);
				tmpList.push(group);
			});
			
			_this.GroupList(tmpList);
		}
	};

	_this.SendCombat = function() {
		$.each(_this.SelectedGroup().NPCs(), function(i,v) {
			WORKSPACE.ViewModels.CombatViewModel.AddCombatant(ko.toJS(v));
		});
	};

	_this.AddGroup = function() {
		var group = new GroupModel( "Group" + (_this.GroupList().length+1) );
		_this.GroupList.push(group);
		_this.SelectedGroup(group);
	};
	
	_this.RemoveGroup = function(group) {
		if(_this.GroupList().length == 1){
			_this.GroupList.push(new GroupModel("Group1"));
		}
		_this.GroupList.remove(group);
	};

	_this.SearchGrid = new ko.simpleGrid.viewModel({
        data: _this.SearchList,
        type: "npcs",
        columns: [
        	{ headerText: "Id", rowText: "Id" },
            { headerText: "Name", rowText: "Name" },
            { headerText: "Type", rowText: "Type" },
            { headerText: "CR", rowText: "CR" }
        ],
        pageSize: 6
    });

	_this.Type.subscribe(function(newValue){
		_this.RunSearch();
	});

	_this.CR.subscribe(function(newValue){
		_this.RunSearch();
	});

	_this.Search.subscribe(function(newValue){
		_this.RunSearch();
	});

	_this.RunSearch = function(){
		if (_this.Search() === "" && 
			_this.Type() === "" && 
			_this.CR() === "") {
			_this.SearchList.removeAll();
			_this.SearchGrid.currentPageIndex(0);
			return;
		}
		_this.SearchList.removeAll();
		_this.SearchGrid.currentPageIndex(0);
		var tmpArr = [];
		$.each(MONSTERS, function(i, v) {
			if ( ( _this.Search() === "" || v.name.toLowerCase().indexOf(_this.Search().toLowerCase()) !== -1 ) && 
				( _this.Type() === "" || v.type.toLowerCase().indexOf(_this.Type().toLowerCase()) !== -1 ) && 
				( _this.CR() === "" || v.cr == _this.CR() ) )  {
				/*var dupe = false;
				$.each(tmpArr, function(x, y){
					//console.log(v.Name.toLowerCase() == y.Name.toLowerCase());
					//console.log(v.Type == y.Type);
					//console.log(v.CR == y.CR)
					if(v.Name.toLowerCase() == y.Name.toLowerCase() && 
						v.CR == y.CR){
						dupe = true;
					}
				});
				if(!dupe){
					tmpArr.push({
						Id: i,
						Name: v.Name,
						Type: v.Type.toLowerCase(),
						CR: v.CR
					});
				}*/
				tmpArr.push({
					Id: i,
					Name: v.name,
					Type: v.type,
					CR: v.cr
				});
			}
		});

		tmpArr.sort(function(a, b) {
			var abits = a.CR.split("/"),
				bbits = b.CR.split("/"),
				acr = (abits.length > 1) ? parseInt(abits[0],10)/parseInt(abits[1],10) : parseInt(abits[0]),
				bcr = (bbits.length > 1) ? parseInt(bbits[0],10)/parseInt(bbits[1],10) : parseInt(bbits[0]);

			
			if(acr < bcr)
				return -1;
			else if(acr > bcr)
				return 1;
			else if(acr === bcr)
				return a.Name < b.Name ? -1 : 1;
		});
		_this.SearchList(tmpArr);
	};
};