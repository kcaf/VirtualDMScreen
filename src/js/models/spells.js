var SpellModel = function(){
	var _this = this;
	_this.Id = ko.observable();
	_this.Level = ko.observable().extend({ trackChange: true });
	_this.Name = ko.observable().extend({ trackChange: true });
	_this.Type = ko.observable().extend({ trackChange: true });
	_this.Cast = ko.observable().extend({ trackChange: true });
	_this.Range = ko.observable().extend({ trackChange: true });
	_this.Components = ko.observable().extend({ trackChange: true });
	_this.Materials = ko.observable().extend({ trackChange: true });
	_this.Duration = ko.observable().extend({ trackChange: true });
	_this.Description = ko.observable().extend({ trackChange: true });
	_this.Class = ko.observable().extend({ trackChange: true });
	_this.IsRemoveVisible = ko.observable(false);
	
	_this.MaterialsValue = ko.pureComputed(function(){
		if(_this.Materials())
			return "(" + _this.Materials() + ")";
		else
			return "";
	});
	
	_this.ShowRemove = function(){
		_this.IsRemoveVisible(true);
	};
	
	_this.HideRemove = function(){
		_this.IsRemoveVisible(false);
	};
	
	
	_this.Load = function(id, spell){
		_this.Id(id);
		_this.Level(spell.Level);
		_this.Name(spell.Name);
		_this.Type(spell.Type);
		_this.Cast(spell.Cast);
		_this.Range(spell.Range);
		_this.Components(spell.Components);
		_this.Materials(spell.Materials);
		_this.Duration(spell.Duration);
		_this.Description(spell.Description);
		_this.Class(spell.Class);
	};
};

var SpellbookModel = function(title){
	var _this = this;
	_this.Spells = ko.observableArray().extend({ trackChange: true });
	_this.Title = ko.observable(title || "").extend({ rateLimit: 500, trackChange: true });
	_this.ShowSlots = ko.observable(true).extend({ trackChange: true });
	_this.SpellSlots = ko.observableArray([
		{ Slots : [0,0,0,0] },
		{ Slots : [0,0,0] },
		{ Slots : [0,0,0] },
		{ Slots : [0,0,0] },
		{ Slots : [0,0,0] },
		{ Slots : [0,0] },
		{ Slots : [0,0] },
		{ Slots : [0] },
		{ Slots : [0] },
	]);
	_this.SlotsUsed = ko.observableArray().extend({ trackChange: true });

	_this.Load = function(data){
		_this.Title(data.Title || "");
		_this.ShowSlots(data.ShowSlots || false);
		_this.SlotsUsed(data.SlotsUsed || []);
		$.each(data.Spells, function(i, v) {
			_this.AddSpell(v.Id);
		});
	};

	_this.ResetSlots = function(){
		_this.SlotsUsed([]);
	};
	
	_this.SpellsByLevel = ko.pureComputed(function() {
		var spells = _this.Spells(),
			levels = [],
			output = [];
			
		if (spells.length === 0) return spells;
		
		$.each(spells, function(i, v) {
			if ($.inArray(v.Level(), levels) === -1) levels.push(v.Level());
		});
		levels.sort();
		
		$.each(levels, function(i, v) {
			var tmp = { Key: v, Spells: [] };
			$.each(spells, function(z, x) {
				if(x.Level() == v)
					tmp.Spells.push(x);
			});
			output.push(tmp);
		});
		
		return output;
	});

	_this.ToggleSlots = function(){
		_this.ShowSlots(!_this.ShowSlots());
	};
	
	_this.AddSpell = function(id){
		var found = false;
		$.each(_this.Spells(), function(i, v){
			if(v.Id() == id) found = true;
		});
		if(!found){
			var spell = new SpellModel();
			spell.Load(id, SPELLS[id]);
			_this.Spells.push(spell);
		}
	};
	
	_this.RemoveSpell = function(spell){
		_this.Spells.remove(spell);
	};
	
	/*ko.pureComputed(function() {
		_this.ShowSlots();
		_this.SlotsUsed();
		_this.Title();
		_this.Spells();
		WORKSPACE.SaveViewModel.Run();
	});*/
};

var SpellsViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.ActiveTab = ko.observable(0).extend({ trackChange: true });
	_this.SearchList = ko.observableArray().extend({ rateLimit: 500 });
	_this.Search = ko.observable("").extend({ rateLimit: 500, trackChange: true });
	_this.Class = ko.observable("").extend({ rateLimit: 500, trackChange: true });
	_this.Level = ko.observable().extend({ rateLimit: 500, trackChange: true });
	_this.LevelList = ko.observableArray(["","Cantrip",1,2,3,4,5,6,7,8,9]);
	_this.BookList = ko.observableArray([new SpellbookModel("Book1")]).extend({ trackChange: true });
	_this.SelectedBook = ko.observable().extend({ trackChange: true });
	_this.SelectedBookAddSpell = ko.observable();
	_this.Spellbook = ko.observable();
	_this.CurrentSpellId = 0;
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });

	_this.SearchGrid = new ko.simpleGrid.viewModel({
		data: _this.SearchList,
		type: "spells",
		columns: [
			{ headerText: "Id", rowText: "Id" },
			{ headerText: "Level", rowText: "Level" },
			{ headerText: "Name", rowText: "Name" }
		],
		pageSize: 6
	});
	
	_this.AddBook = function() {
		var book = new SpellbookModel( "Book" + (_this.BookList().length+1) );
		_this.BookList.push(book);
		_this.SelectedBook(book);
	};
	
	_this.RemoveBook = function(book) {
		if(_this.BookList().length == 1){
			_this.BookList.push(new SpellbookModel("Book1"));
		}
		_this.BookList.remove(book);
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
		_this.Search(data.Search || "");
		_this.Class(data.Class || "");
		_this.Level(data.Level || "");
		//$( ".selector" ).tabs( "load", 1 );
		var tmpList = [];
		
		if(data.BookList.length > 0){
			$.each(data.BookList, function(i, v){
				var tmpbook = data.BookList[i];
				var book = new SpellbookModel();
				book.Load(tmpbook);
				if(data.SelectedBook.Title == tmpbook.Title)
					_this.SelectedBook(book);
				tmpList.push(book);
			});
			
			_this.BookList(tmpList);
		}
	};
	
	_this.RunSearch = function(){
		_this.SearchList.removeAll();
		_this.SearchGrid.currentPageIndex(0);
		var level = _this.Level() === "Cantrip" ? "0" : _this.Level();
		if(_this.Search() === "" && _this.Class() === "" && level === "")
			return;
		var Selectable = [];
		$.each(SPELLS, function(i, v) {
			if ( (_this.Class() === "" || (_this.Class() !== "" && v.Class.toLowerCase().indexOf(_this.Class().toLowerCase()) !== -1)) && 
				(_this.Search() === "" || (_this.Search() !== "" && v.Name.toLowerCase().indexOf(_this.Search().toLowerCase()) !== -1)) && 
				(level === "" || (level !== "" && v.Level == level)) ) {
				_this.SearchList.push({
						Id: i,
						Level: SPELLS[i].Level,
						Name: SPELLS[i].Name,
						Data: SPELLS[i]
				});
			}
		});
		_this.SearchList.sort(function(a, b) {
			if(a.Level < b.Level)
				return -1;
			else if(a.Level > b.Level)
				return 1;
			else if(a.Level == b.Level)
				return (a.Name < b.Name) ? -1 : 1;
		});
	};
	
	_this.Search.subscribe(function(newValue) {
		_this.RunSearch();
	}, this);
	
	_this.Class.subscribe(function(newValue) {
		_this.RunSearch();
	}, this);
	
	_this.Level.subscribe(function(newValue) {
		_this.RunSearch();
	}, this);
	
	/*ko.pureComputed(function() {
		_this.Position();
		_this.SearchList();
		_this.BookList();
		_this.SelectedBook();
		_this.IsMinimized();
		WORKSPACE.SaveViewModel.Run();
	});*/
	/*_this.isDirty = ko.pureComputed(function () {
		for (key in _this) {
			if (_this.hasOwnProperty(key) && ko.isObservable(_this[key]) && typeof _this[key].isDirty === 'function' && _this[key].isDirty()) {
				return true;
			}
		}
	});*/
};