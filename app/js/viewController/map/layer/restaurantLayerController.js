function RestaurantLayerController() {
    var self = MapLayerController();

    self.z_index=2;

    /////////////////////////// PRIVATE ATTRIBUTES ////////////////////////////

    var _restaurantData=[];
    var _svgRestaurants=[];
    var _popup=null;


    /////////////////////////// PRIVATE METHODS ////////////////////////////


    var drawRestaurant = function(){
        self.hideRestaurants();
        _restaurantData.forEach(function(d){
            var restaurantIcon = self.createIcon(d.location.coordinate.latitude, d.location.coordinate.longitude,"resource/sublayer/icon/restaurant.svg");
            _svgRestaurants.push(restaurantIcon);

            if(d.food_inspection !== undefined) {
                self.addWarning(d.location.coordinate.latitude, d.location.coordinate.longitude,self.defaultIconSize*self.defaultCircleRatio*1.6);
            }

            restaurantIcon.view.onClick(function(){
                if(dataRestaurantModel.restaurantSelected!==null)
                    _popup.dispose();
                dataRestaurantModel.restaurantClicked(d);
            });
        })
    };

    var onRestaurantData = function(){
        _restaurantData=dataRestaurantModel.data;
        drawRestaurant();
    };

    self.hideRestaurants = function(){
        _svgRestaurants.forEach(function(d){
            d.dispose();
        });
        self.clear();
        if(_popup!==null){
            _popup.dispose();
        }
        _svgRestaurants=[];
    };

    var onRestaurantSelected = function() {
        if(_popup!==null)
            _popup.dispose();
        if(dataRestaurantModel.restaurantSelected!==null && dataRestaurantModel.restaurantSelected.food_inspection === undefined) {
            _popup = popupLayerController.openPopup(dataRestaurantModel.restaurantSelected.location.coordinate.latitude, dataRestaurantModel.restaurantSelected.location.coordinate.longitude, MapPopupType.POPUP_SIMPLE);
            _popup.view.title.text(dataRestaurantModel.restaurantSelected.name);
            _popup.view.subtitle.text(dataRestaurantModel.restaurantSelected.location.display_address[0]);
        }else if(dataRestaurantModel.restaurantSelected!==null && dataRestaurantModel.restaurantSelected.food_inspection !== undefined){
            _popup = popupLayerController.openPopup(dataRestaurantModel.restaurantSelected.location.coordinate.latitude, dataRestaurantModel.restaurantSelected.location.coordinate.longitude, MapPopupType.POPUP_INSPECTION);
            _popup.view.title.text(dataRestaurantModel.restaurantSelected.name);
            _popup.view.description.text(" food inspection failed");
            var inspectionDate=new Date(dataRestaurantModel.restaurantSelected.food_inspection.inspection_date);
            _popup.view.subtitle.text(parseFloat(inspectionDate.getMonth()+1)+"/"+parseFloat(inspectionDate.getDate()+1)+"/"+inspectionDate.getFullYear());
            _popup.view.address.text(dataRestaurantModel.restaurantSelected.location.display_address[0]);
        }
    };

    self.super_dispose = self.dispose;
    self.dispose = function() {
        self.hideRestaurants();
        self.super_dispose();
        dataRestaurantModel.unsubscribe(Notifications.data.FOOD_CHANGED, onRestaurantData);
        dataRestaurantModel.unsubscribe(Notifications.data.FOOD_SELECTION_CHANGED, onRestaurantSelected);
    };

    var init = function() {
        dataRestaurantModel.subscribe(Notifications.data.FOOD_CHANGED, onRestaurantData);
        dataRestaurantModel.subscribe(Notifications.data.FOOD_SELECTION_CHANGED, onRestaurantSelected);
    }();

    return self;
}