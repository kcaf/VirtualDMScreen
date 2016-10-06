(function () {
    // Private function
    function getColumnsForScaffolding(data) {
        if ((typeof data.length !== 'number') || data.length === 0) {
            return [];
        }
        var columns = [];
        for (var propertyName in data[0]) {
            columns.push({ headerText: propertyName, rowText: propertyName });
        }
        return columns;
    }

    ko.simpleGrid = {
        // Defines a view model class you can use to populate a grid
        viewModel: function (configuration) {
            this.data = configuration.data;
            this.currentPageIndex = ko.observable(0);
            this.pageSize = configuration.pageSize || 5;
            this.type = configuration.type;
            this.padding = 3;

            // If you don't specify columns configuration, we'll use scaffolding
            this.columns = configuration.columns || getColumnsForScaffolding(ko.unwrap(this.data));

            this.itemsOnCurrentPage = ko.computed(function () {
                var startIndex = this.pageSize * this.currentPageIndex();
                return ko.unwrap(this.data).slice(startIndex, startIndex + this.pageSize);
            }, this);

            this.maxPageIndex = ko.computed(function () {
                return Math.ceil(ko.unwrap(this.data).length / this.pageSize) - 1;
            }, this);
            
            this.isMin = ko.computed(function(){
            	return this.currentPageIndex() <= 0;
            }, this);
            
            this.isMax = ko.computed(function(){
            	return this.currentPageIndex() >= this.maxPageIndex();
            }, this);
        }
    };

    // The "simpleGrid" binding
    ko.bindingHandlers.simpleGrid = {
        init: function() {
            return { 'controlsDescendantBindings': true };
        },
        // This method is called to initialize the node, and will also be called again if you change what the grid is bound to
        update: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();

            // Empty the element
            while(element.firstChild)
                ko.removeNode(element.firstChild);

            // Allow the default templates to be overridden
            var gridTemplateName      = allBindings.get('simpleGridTemplate') || "ko_simpleGrid_grid",
                pageLinksTemplateName = allBindings.get('simpleGridPagerTemplate') || "ko_simpleGrid_pageLinks";

            // Render the main grid
            var gridContainer = element.appendChild(document.createElement("DIV"));
            switch (viewModelAccessor().type) {
            	case "spells":
            		ko.renderTemplate("ko_spellsgrid_template", viewModel, {  }, gridContainer, "replaceNode");
            		break;
                case "npcs":
                    ko.renderTemplate("ko_npcsgrid_template", viewModel, {  }, gridContainer, "replaceNode");
                    break;
                case "lootsearch":
                    ko.renderTemplate("ko_lootgrid_template", viewModel, {  }, gridContainer, "replaceNode");
                    break;
                case "lootgen":
                    ko.renderTemplate("ko_lootgengrid_template", viewModel, {  }, gridContainer, "replaceNode");
                    break;
            	default:
					ko.renderTemplate(gridTemplateName, viewModel, {  }, gridContainer, "replaceNode");
			}

            // Render the page links
            var pageLinksContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(pageLinksTemplateName, viewModel, {  }, pageLinksContainer, "replaceNode");
        }
    };
})();
