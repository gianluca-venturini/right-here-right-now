var GraphsViewController = function() {
    var self = SvgViewController();

    var _layerButtons = [];
    var _sublayerIconViewController;
    var _graphsTitle;

    var buttonWidth = 20,
        sublayerIconWidth = 6,
        sublayerIconMargin = 3,
        sublayerIconMarginTop = 20;



    self.onLayerSelectionChanged = function() {
        _layerButtons.forEach(function(button){
            button.viewController.selected = button.layerName == graphsModel.layerSelected;
        });

        drawSublayerButtons();
    };


    self.onSublayerSelectionChanged = function() {


        drawSublayerButtons();
    };

    /**
     * @override
     * Called every time it is necessary to update the view layout
     */
    self.super_updateView = self.updateView;
    self.updateView = function() {
        self.super_updateView();

        var current = 0;
        for(var i = 0; i < _layerButtons.length; i++){
            var button = _layerButtons[i].viewController;
            button.view.x = (i*buttonWidth) + "%";
            button.view.width = buttonWidth + "%";
        }

    };


    var drawSublayerButtons = function() {
        _sublayerIconViewController.view.html("");
        var layer = model.getLayerWithName(graphsModel.layerSelected);
        if(layer) {
            var iconsCount = 0;
            layer.sublayers.forEach(function(sublayer){
                var icon = ExternalSvgViewController(sublayer.icon);
                icon.view.background.remove();
                var button = UIBackgroundView();
                button.attr("opacity", 0);
                icon.view.append(button);
                if(sublayer.name == graphsModel.sublayerSelected){
                    icon.view.selectAll("path").style("fill", Colors.components.WHITE_SELECTED);
                    _graphsTitle.view.title.text(sublayer.name);
                } else {
                    icon.view.selectAll("path").style("fill", Colors.components.GREY_DESELECTED);
                }

                icon.view.x = 0;
                icon.view.y = (iconsCount * (sublayerIconWidth + 3) + sublayerIconMarginTop) + "%";
                _sublayerIconViewController.view.append(icon);

                button.onClick(function(){
                    graphsModel.sublayerSelected = sublayer.name;
                });

                iconsCount++;
            });
        }
    };


    var init = function() {
        self.view.append(UIBackgroundView());

        //Time Buttons
        var translateCoordinateSystemGroup =
            UISvgView()
                .setFrame(0,0,"100%","100%")
                .setAspectRatioOptions("xMinYMax meet");

        self.view.append(translateCoordinateSystemGroup);


        //TITLE
        _graphsTitle = ExternalSvgViewController("resource/view/graphs-title.svg");
        _graphsTitle.view.title = "prova";
        _graphsTitle.view.x = "3.5%";
        _graphsTitle.view.y = "2.2%";
        _graphsTitle.view.width = "40%";
        self.view.append(_graphsTitle);
        //BUTTON

        var buttonCount = 0;

        model.layers.forEach(function(layer){
            if(layer.hasRelatedGraphs){
                buttonCount += 1;
                var button = ButtonViewController();
                button.view.background.hide();
                button.view.title.text(layer.name);
                button.selected = layer.name == graphsModel.layerSelected;
                translateCoordinateSystemGroup.append(button);

                button.onClick(function(){
                   graphsModel.layerSelected = layer.name;
                });

                _layerButtons.push({viewController:button, layerName:layer.name});
            }

        });

        translateCoordinateSystemGroup.setViewBox(0,0,260 * buttonCount,46);

        _sublayerIconViewController = SvgViewController();
        _sublayerIconViewController.view.classed("sublayer-icon-view-controller", true);
        _sublayerIconViewController.view.width = sublayerIconWidth + "%";
        _sublayerIconViewController.view.height = "100%";
        _sublayerIconViewController.view.x = (100 - sublayerIconWidth - sublayerIconMargin) + "%";
        _sublayerIconViewController.view.y = "0%";

        self.view.append(_sublayerIconViewController);

        drawSublayerButtons();

        notificationCenter.subscribe(Notifications.graphs.GRAPH_LAYER_SELECTED_CHANGED, self.onLayerSelectionChanged);
        notificationCenter.subscribe(Notifications.graphs.GRAPH_SUBLAYER_SELECTED_CHANGED, self.onSublayerSelectionChanged);
    }();

    return self;
};

