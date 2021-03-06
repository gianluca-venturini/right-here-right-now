/**
 * Created by Luca on 06/11/2014.
 */
/**
 * Class for access data relative a desired area from the 311 database
 * @param modelName  Name of the class
 * @param databaseMainUrl  main url of the database
 * @param notification : notification invoked when the data are updated
 * @param interval delay between updates
 * @param jsonNameDateAttribute name of the date attribute of the json returned
 * @param numWeekFilter default 1, set to 2 only for crimes
 * @returns {*} a dataModel
 * @constructor
 */
var Data311Model = function(modelName,databaseMainUrl,notification,interval,jsonNameDateAttribute,numWeek) {
    //////////////////////////  DEBUG ///////////////////////////
    var debug = false;
    //////////////////////////  PRIVATE ATTRIBUTES ///////////////////////////
    var self = DataModel();
    var name = modelName;
    var fromTime;
    var rectangles = [];
    var mainUrl = databaseMainUrl;
    var tmpData = [];
    var nameDateAttribute = jsonNameDateAttribute;
    var incrementalID = 0;
    var numWeek = numWeek || 1;
    var numWaitingQueries = 0;
    var prefixQuery = self._proxyURL;
    var charAfterUrl = "&";
    var sqlWhere = [];
    //////////////////////////  PUBLIC ATTRIBUTES ///////////////////////////

    self._notification = notification;
    self.interval = interval;
    self.potholeSelected=null;
    self.vehicleSelected=null;
    self.lightSelected=null;


    ////////////////////////// PRIVATE METHODS //////////////////////////

    //Function that perform a single query to the database on a single rectangle,
    //the query is filtered on time and on position
    var singleQuery = function(topLeftCord,botRightCord){
        var queryString = charAfterUrl + "$where=" + nameDateAttribute + ">'"+ fromTime  + "' AND latitude<" +
            topLeftCord[0] + " AND longitude>" + topLeftCord[1] + " AND latitude>" + botRightCord[0] + " AND longitude<" + botRightCord[1];
        for (var i = 0; i < sqlWhere.length; i++){
            if (i === 0){
                queryString += " AND ";
            }
            queryString += sqlWhere[i];
            if (i !== sqlWhere.length - 1) {
                queryString += " AND ";
            }
        }
        queryString += "&$limit=10000";
        d3.json(prefixQuery + mainUrl + queryString, createCallBackData(incrementalID));
    };

    //Create a Callback function invoked when the data are returned from SODA
    //@param id : identifier used for diversify different sets of queries.
    var createCallBackData = function (id) {
        var myId = id;
        return function(error, json) {
            var i = 0;
            if (error) {
                console.log("Error downloading the data of " + name + ":" + mainUrl );
                tmpData = [];
                incrementalID += 1;
                return;
            }
            if (myId === incrementalID) {
                //query for the right selections
                numWaitingQueries -= 1;
                for (i = 0; i < json.length; i++){
                    if (selectionModel.pointInside([json[i].latitude,json[i].longitude])){
                        tmpData.push(json[i]);
                    }
                }
                if (numWaitingQueries === 0) {
                    //last query has arrived update state
                    if (debug){
                        console.log(name + " request ID: " + myId);
                        console.log(tmpData);
                    }
                    self.callback(tmpData);
                }
            }
        }

    };

    //Callback invoked when the selections areas are changed
    var callBackChangeAreas = function() {
        //TODO check this implementation
        //rectangles = selectionModel.getSelection();
        rectangles = selectionModel.getCircumscribedSelection();
        self.dataChanged();
    };

    //Callback function invoked when the time filter is changed
    var callBackChangeTimeFilter = function() {
        if (timeIntervalModel.timeInterval === TimeInterval.LAST_MONTH) {
            fromTime = moment().subtract(1, 'months').format('YYYY-MM-DD');
        } else if (timeIntervalModel.timeInterval === TimeInterval.LAST_WEEK){
            fromTime = moment().subtract(numWeek, 'weeks').format('YYYY-MM-DD');
        } else {
            console.log("Illegal state time interval");
        }
        self.dataChanged();
    };

    callBackChangeTimeFilter();

    ////////////////////////// PUBLIC METHODS //////////////////////////

    self.fetchData = function() {
        var topLeft = "";
        var botRight = "";
        numWaitingQueries = 0;
        incrementalID += 1;
        tmpData = [];
        for (var i = 0; i < rectangles.length; i++){
            numWaitingQueries +=1;
            topLeft = [rectangles[i].circumscribed().points[3][0], rectangles[i].circumscribed().points[3][1]];
            botRight = [rectangles[i].circumscribed().points[1][0],rectangles[i].circumscribed().points[1][1]];
            singleQuery(topLeft,botRight);
        }
    };

    //Change the the query depending if the php proxy is active or not
    self.proxyPhpQueries = function (val) {
        if (val){
            prefixQuery = self._proxyURL;
            charAfterUrl = "&";
        } else {
            prefixQuery = "";
            charAfterUrl = "?";
        }
    };

    self.getSubTypes = function(attribute) {
        if (!self.data){
            return false;
        }
        var outputTypes = [];
        var attr = attribute || "status";
        var addValue = function(type) {
            var found = false;
            for (var i = 0; i < outputTypes.length; i++){
                if (outputTypes[i].name === type ){
                    outputTypes[i].total += 1;
                    found = true;
                }
            }
            if (!found) {
                outputTypes.push({
                    name: type,
                    total: 1
                })
            }
        };

        for (var i = 0; i < self.data.length; i++){
            addValue(self.data[i][attr]);
        }

        return outputTypes;
    }

    self.addSqlWhere = function (str){
        sqlWhere.push(str);
        return self;
    }

    self.potholeClicked = function(pothole) {
        if(self.potholeSelected!==null && self.potholeSelected.service_request_number === pothole.service_request_number){
            self.potholeSelected=null;
        }else
            self.potholeSelected = pothole;
        self.dispatch(Notifications.data.POTHOLE_SELECTION_CHANGED);
    };

    self.vehicleClicked = function(vehicle) {
        if(self.vehicleSelected!==null && self.vehicleSelected.service_request_number === vehicle.service_request_number){
            self.vehicleSelected=null;
        }else
            self.vehicleSelected = vehicle;
        self.dispatch(Notifications.data.ABANDONED_VEHICLES_SELECTION_CHANGED);
    };

    self.lightClicked = function(light,category) {
        self.lightSelected = light;
        Data311Model.lightPopup=category;
        notificationCenter.dispatch(Notifications.data.LIGHT_SELECTION_CHANGED);
    };

    ////////////////////////// SUBSCRIBES //////////////////////////

    notificationCenter.subscribe(Notifications.timeInterval.TIME_INTERVAL_CHANGED,callBackChangeTimeFilter);
    notificationCenter.subscribe(Notifications.selection.SELECTION_CHANGED,callBackChangeAreas);

    return self;
};

Data311Model.lightPopup=null;

var dataPotholeModel = Data311Model("Potholes","http://data.cityofchicago.org/resource/7as2-ds3y.json",Notifications.data.POTHOLE_CHANGED,30000,"creation_date");
dataPotholeModel.addSqlWhere("status!='Completed - Dup'");
dataPotholeModel.addSqlWhere("status!='Open - Dup'");

var dataVehiclesModel = Data311Model("Abandoned Vehicles","http://data.cityofchicago.org/resource/3c9v-pnva.json",Notifications.data.ABANDONED_VEHICLES_CHANGED,30000,"creation_date");
dataVehiclesModel.addSqlWhere("status!='Completed - Dup'");
dataVehiclesModel.addSqlWhere("status!='Open - Dup'");

var dataLightsAllModel = Data311Model("All lights out","http://data.cityofchicago.org/resource/zuxi-7xem.json",Notifications.data.LIGHT_OUT_ALL_CHANGED,30000,"creation_date");
dataLightsAllModel.addSqlWhere("status!='Completed - Dup'");
dataLightsAllModel.addSqlWhere("status!='Open - Dup'");

var dataLight1Model = Data311Model("One light out","http://data.cityofchicago.org/resource/3aav-uy2v.json",Notifications.data.LIGHT_OUT_SINGLE_CHANGED,30000,"creation_date");
dataLight1Model.addSqlWhere("status!='Completed - Dup'");
dataLight1Model.addSqlWhere("status!='Open - Dup'");

var dataFoodInspection = Data311Model("Food inspections","http://data.cityofchicago.org/resource/4ijn-s7e5.json",Notifications.data.FOOD_INSPECTION_CHANGED,30000,"inspection_date");
var dataRodentBites = Data311Model("Rodent Bites","http://data.cityofchicago.org/resource/97t6-zrhs.json",Notifications.data.RAT_BITES_CHANGED,30000,"creation_date");

////////////////////////// STATUS //////////////////////////
dataPotholeModel.status = {
    POTHOLE_OPEN: "Open",
    POTHOLE_OPEN_DUP: "Open - Dup",
    POTHOLE_COMPLETED: "Completed"
};

dataVehiclesModel.status = {
    VEHICLE_OPEN: "Open",
    VEHICLE_OPEN_DUP: "Open - Dup",
    VEHICLE_COMPLETED: "Completed",
    VEHICLE_COMPLETED_DUP: "Completed - Dup"
};

dataLight1Model.status = {
    LIGHT_ONE_OPEN: "Open",
    LIGHT_ONE_OPEN_DUP: "Open - Dup",
    LIGHT_ONE_COMPLETED: "Completed",
    LIGHT_ONE_COMPLETED_DUP: "Completed - Dup"
};

dataLight1Model.name= "lightOne";

dataLightsAllModel.status = {
    LIGHT_ALL_OPEN: "Open",
    LIGHT_ALL_OPEN_DUP: "Open - Dup",
    LIGHT_ALL_COMPLETED: "Completed",
    LIGHT_ALL_COMPLETED_DUP: "Completed - Dup"
};

dataLightsAllModel.name= "lightsAll";