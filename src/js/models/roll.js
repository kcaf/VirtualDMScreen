var RollModel = function(){
	var _this = this;
	_this.Amount = ko.observable(0).extend({ trackChange: true });
	_this.Dice = ko.observable(0).extend({ trackChange: true });
	_this.Modifier = ko.observable(0).extend({ trackChange: true });
	
	_this.Load = function(data){
		_this.Amount(data.Amount || 0);
		_this.Dice(data.Dice || 0);
		_this.Modifier(data.Modifier || 0);
	};

	_this.String = ko.pureComputed(function(){
		return _this.Amount() + "d" + _this.Dice() + 
			( _this.Modifier > 0 ) ? " +" + _this.Modifier() : 
				( _this.Modifier() < 0 ) ? " " + _this.Modifier() : "";
	});
};

var RollViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.RollList = ko.observableArray().extend({ trackChange: true });
	_this.Selected = ko.observable().extend({ trackChange: true });
	_this.Result = ko.observable().extend({ trackChange: true });
	_this.ResultBreakdown = ko.observableArray().extend({ trackChange: true });
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });
	_this.MatchDiceSet = /(\-?\+?\d+d\d+)/ig;
	_this.MatchDice = /(\d+)d(\d+)/i;
	_this.MatchMod = /[+\-]*(\.\d+|\d+(\.\d+)?)/g;
	_this.RollString = ko.observable("").extend({ trackChange: true });

	_this.BreakdownString = ko.pureComputed(function(){
		var str = "",
			results = _this.ResultBreakdown();

		$.each(results, function(i, v) {
			str += v.String + "  [" + v.Rolls.toString() + "]\n";
		});

		return str;
	});

	_this.RollList.subscribe(function(newValue) {
		if(_this.RollList().length > 10)
			_this.RollList.shift();
	});

	_this.Selected.subscribe(function(newValue) {
		if(newValue === undefined) return;
		_this.Result("");
		_this.ResultBreakdown.removeAll();
		_this.RollString(newValue);
	});

	_this.ExecuteRoll = function() {
		var result = 0,
			modtotal = 0,
			rollObj = null,
			dice = null,
			diceset = null,
			mod = null,
			roll = null,
			rollStr = _this.RollString();

		_this.MatchDiceSet.lastIndex = 0;
		_this.ResultBreakdown.removeAll();
		_this.Result("");

		if(_this.MatchDiceSet.test(rollStr) === false) {
			return;
		}

		// Breakdown by sets of rolls
		diceset = rollStr.match(_this.MatchDiceSet);
		for(s=0; s<diceset.length; s++){
			var thisroll = {
				String: diceset[s],
				Rolls: []
			};

			// Run this set 'a' number of times
			dice = diceset[s].match(_this.MatchDice);
			for(a=0; a<dice[1]; a++){

				// Roll them bones
				var currentresult = WORKSPACE.Helpers.Roll(1,dice[2]);
				thisroll.Rolls.push(currentresult);

				// Subtract negative sets
				if(diceset[s][0] == "-"){
					currentresult *= -1;
				}

				// Sum
				result += currentresult;
			}
			_this.ResultBreakdown.push(thisroll);
			rollStr = rollStr.replace(diceset[s],"");
		}

		// Find remaining modifiers
		_this.MatchMod.lastIndex = 0;
		if(_this.MatchMod.test(rollStr) !== false) {
			mod = rollStr.match(_this.MatchMod);

			// Sum
			while(mod.length){
				modtotal += parseFloat(mod.shift());
			}

			_this.ResultBreakdown.push({
				String: "Mod",
				Rolls: [modtotal]
			});
		}

		// Set the total
		_this.Result(result+modtotal);

		// Save history
		_this.AddRoll(_this.RollString());
	};
	
	_this.AddRoll = function(str) {
		if(_this.RollList().indexOf(str) === -1)
			_this.RollList.push(str);
	};
	
	_this.RemoveRoll = function(str) {
		_this.RollList.remove(str);
	};
	
	_this.Load = function(data) {
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});
		_this.IsMinimized(data.IsMinimized);
		_this.RollString(data.RollString || "");
		_this.Result(data.Result || "");
		_this.RollList(data.RollList || []);
		/*
		var tmpList = [];
		if(data.RollList.length > 0){
			for(i=0; i<data.RollList.length; i++){
				var tmp = new RollModel();
				tmp.Load(data.RollList[i]);
				tmpList.push(tmp);
			}
			
			_this.RollList(tmpList);
		}*/
	};
};