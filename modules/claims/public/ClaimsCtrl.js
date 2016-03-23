angular.module("claims", [])

    // =========================================================================
    // Claims Controllers ============================================================
    // =========================================================================
    .controller("ClaimsAllCtrl",[ "$scope", "ClaimsService", "$uibModal",
        function ($scope, ClaimsService, $uibModal) {

        $scope.err = null;
        $scope.pending = {msg : "Loading page..."};
        $scope.success = null;

        //initial settings
        $scope.claims = [];
        $scope.claimsCount = 0;

        //pagination settings
        $scope.page = 1;
        $scope.perPage = 20;
        $scope.paginate = true;
        $scope.sort = 1;
        $scope.sortBy = "lossDate";
        $scope.search = "";
        $scope.activeRequest = null;

        $scope.getClaims = function(data){
            $scope.queryObj = {
                include: "claimNumber,claimantFirstName,claimantLastName,lossDate,status",
                page:$scope.page,
                perPage:$scope.perPage,
                paginate:$scope.paginate,
                sortBy:$scope.sortBy,
                sort: Number($scope.sort) == Number(1)?1:-1
            };
            if ($scope.search) {
                $scope.queryObj.search = $scope.search;
            }
            if($scope.rangeStartR && $scope.rangeEndR){
                $scope.queryObj.rangeStart = $scope.rangeStartR;
                $scope.queryObj.rangeEnd = $scope.rangeEndR;
            }
            async.series([
                    function(callback){
                        ClaimsService.getClaims(
                            $scope.queryObj,
                            //success function
                            function(data) {
                                $scope.claims = data;
                                callback(null);
                            },
                            //error function
                            function(data, status) {
                                callback(data);
                            }
                        );
                    },
                    function(callback){
                        ClaimsService.getCount(
                            $scope.queryObj,
                            //success function
                            function(data) {
                                $scope.claimsCount = data.count;
                                callback(null);
                            },
                            //error function
                            function(data, status) {
                                callback(data);
                            }
                        );
                    }
                ],
                function(err, results){
                    $scope.clearMessages();
                    if(err){
                        $scope.err = err;
                    }
                    else if(data){
                        $scope.success = data.success;
                    }
                });
        };

        $scope.getClaims();

        /*jQuery('#rangeStart').datetimepicker({
            sideBySide: true
        });
        jQuery('#rangeEnd').datetimepicker({
            onSelect: function(dateText) {
                if(dateText){
                    $scope.rangeEnd = dateText;
                }
            }
        });*/

        $scope.setPerPage = function(perPage) {
            $scope.paginate = perPage!=-1;
            $scope.perPage = perPage;
            $scope.refresh();
        };

        $scope.searchClaims = function(str) {
            $scope.search = str;
            $scope.refresh();
        };

        $scope.selectSort = function(sortBy, sort) {
            $scope.sortBy = sortBy;
            $scope.sort = Number(sort);
            $scope.refresh();
        };

        $scope.changePage = function(page) {
            $scope.page = page;
            $scope.refresh();
        };

        $scope.resetFilters = function() {
            $scope.page = 1;
            $scope.perPage = 20;
            $scope.paginate = true;
            $scope.sort = 1;
            $scope.sortBy = "lossDate";
            $scope.search = "";
            $scope.rangeStart = null;
            $scope.rangeEnd = null;
            $scope.rangeStartR = null;
            $scope.rangeEndR = null;
            $scope.refresh();
        };
        $scope.updateRange = function(){
            console.log($scope.rangeStart, $scope.rangeEnd);
            if($scope.rangeStart && $scope.rangeEnd){
                $scope.rangeStartR = moment($scope.rangeStart).toISOString();
                $scope.rangeEndR = moment($scope.rangeEnd).toISOString();
                $scope.refresh();
            }
        };

        $scope.refresh = function(data) {
            clearTimeout($scope.activeRequest);
            $scope.activeRequest = setTimeout(function() {
                $scope.getClaims(data);
            }, 400);
        };

        $scope.isEmpty = function(obj) {
            for(var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        };

        /**** Claims Modals ****/
        // Create Claims modal
        $scope.create = function() {
            $scope.clearMessages();

            var modalInstance = $uibModal.open({
                templateUrl: '/templates/claims/create',
                controller: 'ClaimsCreateCtrl',
                size: "md"
            });

            modalInstance.result.then(function (data) {
                if (data.err) {
                    $scope.err = data.err;
                }
                else {
                    $scope.refresh(data);
                }
            });
        }; // end $scope.createClaims
        // Update Claims modal
        $scope.update = function(claim) {
            $scope.clearMessages();

            var modalInstance = $uibModal.open({
                templateUrl: '/templates/claims/update',
                controller: 'ClaimsUpdateCtrl',
                size: "md",
                resolve: {
                    claim: function () {
                        return claim;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                if (data.err) {
                    $scope.err = data.err;
                }
                else {
                    $scope.refresh(data);
                }
            });
        }; // end $scope.updateClaims
        // Delete Claims modal
        $scope.delete = function(claim) {
            $scope.clearMessages();

            var modalInstance = $uibModal.open({
                templateUrl: '/templates/claims/delete',
                controller: 'ClaimsDeleteCtrl',
                size: "md",
                resolve: {
                    claim: function () {
                        return claim;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                if (data.err)
                {
                    $scope.err = data.err;
                }
                else
                {
                    $scope.refresh(data);
                }
            });
        }; // end $scope.deleteClaims

        $scope.clearMessages = function(){
            $scope.err = null;
            $scope.pending = null;
            $scope.success = null;
        }
    }])

    .controller("ClaimsCreateCtrl", ["$scope", "$uibModalInstance", "ClaimsService",
        function ($scope, $uibModalInstance, ClaimsService) {

        $scope.err = null;
        $scope.pending =  null;
        $scope.success = null;

        $scope.method = "xml";
        $scope.validated = false;

        $scope.statusOpts = ["OPEN", "CLOSED"];

        $scope.showContent = function($fileContent){
            $scope.xmlContent = $fileContent;
        };

        $scope.validate = function(){
            $scope.pending = {msg:"Validating XML..."};
            if(!$scope.xmlContent){
                $scope.clearMessages();
                return $scope.err = {code:"CLAIMS", msg:"XML Content is required -- either upload an xml file or copy and paste it's content."}
            }
            ClaimsService.validateClaim(
                {
                    xmlContent: $scope.xmlContent
                },
                //success function
                function(data) {
                    $scope.clearMessages();
                    if(data!=""){
                        $scope.err = {code: "CLAIMS", msg:data+ " - You can continue to create for this demo purpose, but it is highly recommended to fix the xml and re-validate."}
                    }
                    else{
                        $scope.success = {msg: "XML is well-formed and validated!"};
                        $scope.validate = true;
                    }
                },
                //error function
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                })
        };

        $scope.createCheck = function() {
            $scope.clearMessages();

            if ($scope.method != "xml") {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please use the XML upload or paste xml into XML content instead -- this is a coming soon feature!"
                };
                return;
            }
            else if (!$scope.validated) {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please validate your XML before trying to create -- you can force create anyway for the purpose of this demo."
                };
                if($scope.xmlContent){
                    $scope.showCreateAnyway = true;
                }
                return;
            }
            else {
                $scope.create();
            }
        };
        $scope.create = function() {
            $scope.clearMessages();

            if ($scope.method != "xml") {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please use the XML upload or paste xml into XML content instead -- this is a coming soon feature!"
                };
                return;
            }

            var xmlObj = $.xml2json($scope.xmlContent);

            var claimsObj = {
                "claimNumber": xmlObj.ClaimNumber,
                "claimantFirstName": xmlObj.ClaimantFirstName,
                "claimantLastName": xmlObj.ClaimantLastName,
                "status": xmlObj.Status,
                "lossDate": xmlObj.LossDate?moment(xmlObj.LossDate).toISOString():undefined,
                "assignedAdjusterID": xmlObj.AssignedAdjusterID
            };

            if(xmlObj.LossInfo){
                claimsObj.lossInfo = {
                    "causeOfLoss": xmlObj.LossInfo.CauseOfLoss,
                    "lossDescription": xmlObj.LossInfo.LossDescription?moment(xmlObj.LossInfo.LossDescription).toISOString():undefined,
                    "reportedDate": xmlObj.LossInfo.ReportedDate
                };
            }
            if(xmlObj.Vehicles && xmlObj.Vehicles.VehicleDetails){
                claimsObj.vehicles = [];
                if(xmlObj.Vehicles.VehicleDetails.isArray){
                    for(var i=0; i < xmlObj.Vehicles.VehicleDetails.length; i++){
                        claimsObj.vehicles.push({
                            "modelYear": xmlObj.Vehicles.VehicleDetails[i].ModelYear,
                            "makeDescription": xmlObj.Vehicles.VehicleDetails[i].MakeDescription,
                            "modelDescription": xmlObj.Vehicles.VehicleDetails[i].ModelDescription,
                            "engineDescription": xmlObj.Vehicles.VehicleDetails[i].EngineDescription,
                            "exteriorColor": xmlObj.Vehicles.VehicleDetails[i].ExteriorColor,
                            "vin": xmlObj.Vehicles.VehicleDetails[i].Vin,
                            "licPlate": xmlObj.Vehicles.VehicleDetails[i].LicPlate,
                            "licPlateState": xmlObj.Vehicles.VehicleDetails[i].LicPlateState,
                            "licPlateExpDate": xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate?moment(xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate).toISOString():undefined,
                            "damageDescription": xmlObj.Vehicles.VehicleDetails[i].DamageDescription,
                            "mileage": xmlObj.Vehicles.VehicleDetails[i].Mileage
                        });
                    }
                }
                else{
                    claimsObj.vehicles.push({
                        "modelYear": xmlObj.Vehicles.VehicleDetails.ModelYear,
                        "makeDescription": xmlObj.Vehicles.VehicleDetails.MakeDescription,
                        "modelDescription": xmlObj.Vehicles.VehicleDetails.ModelDescription,
                        "engineDescription": xmlObj.Vehicles.VehicleDetails.EngineDescription,
                        "exteriorColor": xmlObj.Vehicles.VehicleDetails.ExteriorColor,
                        "vin": xmlObj.Vehicles.VehicleDetails.Vin,
                        "licPlate": xmlObj.Vehicles.VehicleDetails.LicPlate,
                        "licPlateState": xmlObj.Vehicles.VehicleDetails.LicPlateState,
                        "licPlateExpDate": xmlObj.Vehicles.VehicleDetails.LicPlateExpDate,
                        "damageDescription": xmlObj.Vehicles.VehicleDetails.DamageDescription,
                        "mileage": xmlObj.Vehicles.VehicleDetails.Mileage
                    });
                }

            }
            $scope.pending = {msg:"Creating Claims..."};
            ClaimsService.create(
                claimsObj,
                //success function
                function(data) {
                    $uibModalInstance.close({
                        success: {msg:"Claims successfully created!"},
                        data: data
                    });
                },
                //error function
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                }
            );
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.clearMessages = function(){
            $scope.err = null;
            $scope.pending = null;
            $scope.success = null;
            $scope.showCreateAnyway = false;
        }
    }])

    .controller("ClaimsUpdateCtrl", ["$scope", "$uibModalInstance", "claim","ClaimsService",
        function ($scope, $uibModalInstance, claim, ClaimsService) {

        $scope.err = null;
        $scope.pending = {msg:"Getting claim details..."};
        $scope.success = null;

        $scope.method = "xml";
        $scope.validated = false;

        $scope.statusOpts = ["OPEN", "CLOSED"];

        $scope.showContent = function($fileContent){
            $scope.xmlContent = $fileContent;
        };

        $scope.validate = function(){
            $scope.pending = {msg:"Validating XML..."};
            if(!$scope.xmlContent){
                $scope.clearMessages();
                return $scope.err = {code:"CLAIMS", msg:"XML Content is required -- either upload an xml file or copy and paste it's content."}
            }
            ClaimsService.validateClaim(
                {
                    xmlContent: $scope.xmlContent
                },
                //success function
                function(data) {
                    $scope.clearMessages();
                    if(data!=""){
                        $scope.err = {code: "CLAIMS", msg:data+ " - You can continue to create for this demo purpose, but it is highly recommended to fix the xml and re-validate."}
                    }
                    else{
                        $scope.success = {msg: "XML is well-formed and validated!"};
                        $scope.validate = true;
                    }
                },
                //error function
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                })
        };

        ClaimsService.getClaims(
            {
                id: claim.id
            },
            //success function
            function(data) {
                $scope.claim = data;
                if(data.claimNumber){
                    $scope.claimNumber = data.claimNumber;
                }
                if(data.claimantFirstName){
                    $scope.claimantFirstName = data.claimantFirstName;
                }
                if(data.claimantLastName){
                    $scope.claimantLastName = data.claimantLastName;
                }
                if(data.status){
                    $scope.status = data.status;
                }
                if(data.lossDate){
                    $scope.lossDate = data.lossDate;
                }
                if(data.lossInfo){
                    $scope.lossInfo = data.lossInfo;
                }
                if(data.assignedAdjusterID){
                    $scope.assignedAdjusterID = data.assignedAdjusterID;
                }
                if(data.vehicles){
                    $scope.vehicles = data.vehicles;
                }
                $scope.clearMessages();

            },
            //error function
            function(data, status) {
                $scope.clearMessages();
                $scope.err = data;
            }
        );

        $scope.updateCheck = function() {
            $scope.clearMessages();

            if ($scope.method != "xml") {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please use the XML upload or paste xml into XML content instead -- this is a coming soon feature!"
                };
                return;
            }
            else if (!$scope.validated) {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please validate your XML before trying to create -- you can force create anyway for the purpose of this demo."
                };
                if($scope.xmlContent){
                    $scope.showUpdateAnyway = true;
                }
                return;
            }
            else {
                $scope.create();
            }
        };

        $scope.update = function() {
            $scope.clearMessages();

            if ($scope.method != "xml") {
                $scope.err = {
                    code: "CLAIMS",
                    msg: "Please use the XML upload or paste xml into XML content instead -- this is a coming soon feature!"
                };
                return;
            }

            var xmlObj = $.xml2json($scope.xmlContent);

            if(xmlObj.ClaimNumber){
                $scope.claimNumber = xmlObj.ClaimNumber;
            }
            if(xmlObj.ClaimantFirstName){
                $scope.claimantFirstName = xmlObj.ClaimantFirstName;
            }
            if(xmlObj.ClaimantLastName){
                $scope.claimantLastName = xmlObj.ClaimantLastName;
            }
            if(xmlObj.Status){
                $scope.status = xmlObj.Status;
            }
            if(xmlObj.LossDate){
                $scope.lossDate = moment(xmlObj.LossDate).toISOString();
            }
            if(xmlObj.AssignedAdjusterID){
                $scope.assignedAdjusterID = xmlObj.AssignedAdjusterID;
            }
            var claimsObj = {
                "claimNumber": $scope.claimNumber,
                "claimantFirstName": $scope.claimantFirstName,
                "claimantLastName": $scope.claimantLastName,
                "status": $scope.status,
                "lossDate": $scope.lossDate,
                "assignedAdjusterID": $scope.assignedAdjusterID
            };

            if(xmlObj.LossInfo){
                if(xmlObj.LossInfo.CauseOfLoss){
                    $scope.lossInfo.causeOfLoss = xmlObj.LossInfo.CauseOfLoss;
                }
                if(xmlObj.LossInfo.LossDescription){
                    $scope.lossInfo.lossDescription = xmlObj.LossInfo.LossDescription;
                }
                if(xmlObj.LossInfo.ReportedDate){
                    $scope.lossInfo.reportedDate = xmlObj.LossInfo.ReportedDate;
                }
                claimsObj.lossInfo = {
                    "causeOfLoss": xmlObj.LossInfo.CauseOfLoss,
                    "lossDescription": xmlObj.LossInfo.LossDescription,
                    "reportedDate": moment(xmlObj.LossInfo.ReportedDate).toISOString()
                };
            }
            if(xmlObj.Vehicles && xmlObj.Vehicles.VehicleDetails){
                if(!claimsObj.vehicles){
                    claimsObj.vehicles = [];
                }
                if(xmlObj.Vehicles.VehicleDetails.isArray){
                    for(var i=0; i < xmlObj.Vehicles.VehicleDetails.length; i++){
                        var updatedVehicleObj = {};
                        if(xmlObj.Vehicles.VehicleDetails[i].ModelYear) {
                            updatedVehicleObj.modelYear = xmlObj.Vehicles.VehicleDetails[i].ModelYear;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].MakeDescription) {
                            updatedVehicleObj.makeDescription = xmlObj.Vehicles.VehicleDetails[i].MakeDescription;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].ModelDescription) {
                            updatedVehicleObj.modelDescription = xmlObj.Vehicles.VehicleDetails[i].ModelDescription;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].EngineDescription) {
                            updatedVehicleObj.engineDescription = xmlObj.Vehicles.VehicleDetails[i].EngineDescription;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].ExteriorColor) {
                            updatedVehicleObj.exteriorColor = xmlObj.Vehicles.VehicleDetails[i].ExteriorColor;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].Vin) {
                            updatedVehicleObj.vin = xmlObj.Vehicles.VehicleDetails[i].Vin;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].LicPlate) {
                            updatedVehicleObj.licPlate = xmlObj.Vehicles.VehicleDetails[i].LicPlate;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].LicPlateState) {
                            updatedVehicleObj.licPlateState = xmlObj.Vehicles.VehicleDetails[i].LicPlateState;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate) {
                            if(!moment(xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate).isValid()){
                                var lastIndex = xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate.lastIndexOf("-");
                                if(lastIndex > 0){
                                    xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate = $scope.setCharAt(xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate, lastIndex, " ");
                                }
                            }
                            updatedVehicleObj.licPlateExpDate = moment(xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate).toISOString();
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].DamageDescription) {
                            updatedVehicleObj.damageDescription = xmlObj.Vehicles.VehicleDetails[i].DamageDescription;
                        }
                        if(xmlObj.Vehicles.VehicleDetails[i].LicPlate) {
                            updatedVehicleObj.mileage = xmlObj.Vehicles.VehicleDetails[i].Mileage;
                        }
                        //find if this vehicle exists, if not create it and push it
                        var existingVehiclesPos = claimsObj.vehicles.map(function(e) { return e.vin; }).indexOf(xmlObj.Vehicles.VehicleDetails[i].Vin);
                        if (existingVehiclesPos >=0 ) {
                            claimsObj.vehicles[existingVehiclesPos] = updatedVehicleObj;
                        }
                        else{
                            claimsObj.vehicles.push(updatedVehicleObj);
                        }
                    }
                }
                else{
                    var updatedVehicleObj = {};
                    if(xmlObj.Vehicles.VehicleDetails.ModelYear) {
                        updatedVehicleObj.modelYear = xmlObj.Vehicles.VehicleDetails.ModelYear;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.MakeDescription) {
                        updatedVehicleObj.makeDescription = xmlObj.Vehicles.VehicleDetails.MakeDescription;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.ModelDescription) {
                        updatedVehicleObj.modelDescription = xmlObj.Vehicles.VehicleDetails.ModelDescription;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.EngineDescription) {
                        updatedVehicleObj.engineDescription = xmlObj.Vehicles.VehicleDetails.EngineDescription;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.ExteriorColor) {
                        updatedVehicleObj.exteriorColor = xmlObj.Vehicles.VehicleDetails.ExteriorColor;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.Vin) {
                        updatedVehicleObj.vin = xmlObj.Vehicles.VehicleDetails.Vin;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.LicPlate) {
                        updatedVehicleObj.licPlate = xmlObj.Vehicles.VehicleDetails.LicPlate;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.LicPlateState) {
                        updatedVehicleObj.licPlateState = xmlObj.Vehicles.VehicleDetails.LicPlateState;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.LicPlateExpDate) {
                        if(!moment(xmlObj.Vehicles.VehicleDetails.LicPlateExpDate).isValid()){
                            var lastIndex = xmlObj.Vehicles.VehicleDetails.LicPlateExpDate.lastIndexOf("-");
                            if(lastIndex > 0){
                                xmlObj.Vehicles.VehicleDetails.LicPlateExpDate = $scope.setCharAt(xmlObj.Vehicles.VehicleDetails.LicPlateExpDate, lastIndex, " ");
                            }
                        }
                        updatedVehicleObj.licPlateExpDate = moment(xmlObj.Vehicles.VehicleDetails.LicPlateExpDate).toISOString();
                    }
                    if(xmlObj.Vehicles.VehicleDetails.DamageDescription) {
                        updatedVehicleObj.damageDescription = xmlObj.Vehicles.VehicleDetails.DamageDescription;
                    }
                    if(xmlObj.Vehicles.VehicleDetails.Mileage) {
                        updatedVehicleObj.mileage = xmlObj.Vehicles.VehicleDetails.Mileage;
                    }
                    //find if this vehicle exists, if not create it and push it
                    var existingVehiclesPos = claimsObj.vehicles.map(function(e) { return e.vin; }).indexOf(xmlObj.Vehicles.VehicleDetails.Vin);
                    if (existingVehiclesPos >=0 ) {
                        claimsObj.vehicles[existingVehiclesPos] = updatedVehicleObj;
                    }
                    else{
                        claimsObj.vehicles.push(updatedVehicleObj);
                    }
                }

            }
            $scope.pending = {msg:"Updating Claim..."};
            ClaimsService.update(
                $scope.claim.id,
                claimsObj,
                function(data) {
                    $uibModalInstance.close({
                        success: {msg:"Claim has been successfully updated!"},
                        data: data
                    });
                },
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                }
            );

        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.clearMessages = function(){
            $scope.err = null;
            $scope.pending = null;
            $scope.success = null;
        };
        //credits: http://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
        $scope.setCharAt = function(str,index,chr){
            if(index > str.length-1) return str;
            return str.substr(0,index) + chr + str.substr(index+1);
        }
    }])

    .controller("ClaimsDeleteCtrl", ["$scope", "$uibModalInstance", "claim", "ClaimsService",
        function ($scope, $uibModalInstance, claim, ClaimsService) {

        $scope.deleteClaim = claim;

        $scope.delete = function () {

            ClaimsService.delete(
                $scope.deleteClaim.id,
                //success function
                function(data) {
                    $uibModalInstance.close({
                        success: {msg:"Claim has been successfully deleted!"},
                        data: data
                    });

                },
                //error function
                function(data, status) {
                    $uibModalInstance.close({
                        err: data
                    });
                }
            );
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }])

    //credits to: http://jsfiddle.net/alexsuch/6aG4x/
    .directive('onReadFile', function ($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);

                element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {$fileContent:onLoadEvent.target.result});
                        });
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    })

    .service('ClaimsService', [
        '$http',
        function ($http, $rootScope, $window) {
            return {
                getClaims: function(params, success, error) {
                    var req = {
                        method: 'GET',
                        url: '/claims',
                        params: params
                    };
                    this.apiCall(req, success, error);
                },
                getCount: function(params, success, error) {
                    var req = {
                        method: 'GET',
                        url: '/claims/count',
                        params: params
                    };
                    this.apiCall(req, success, error);
                },
                validateClaim: function(claimsXml, success, error) {
                    var req = {
                        method: 'POST',
                        url: '/claims/validate',
                        data: claimsXml
                    };
                    this.apiCall(req, success, error);
                },
                create: function(claimsObj, success, error) {
                    var req = {
                        method: 'POST',
                        url: '/claims',
                        data: claimsObj
                    };
                    this.apiCall(req, success, error);
                },
                update: function(claimId, updateObj, success, error) {
                    var req = {
                        method: 'PUT',
                        url: '/claims/'+claimId,
                        data: updateObj
                    };
                    this.apiCall(req, success, error);
                },
                delete: function(claimId, success, error) {
                    var req = {
                        method: 'DELETE',
                        url: '/claims/' + claimId
                    };
                    this.apiCall(req, success, error);
                },

                getClaimsSettings: function(success, error) {
                    var req = {
                        method: 'GET',
                        url: '/claims/settings'
                    };
                    this.apiCall(req, success, error);
                },
                apiCall: function(req, success, error) {
                    req.headers = {url: req.url};
                    req.url = "/api";
                    $http(req).success(function(data) {
                        success(data);
                    }).error(function(data, status) {
                        error(data, status);
                    });
                }
            };
        }
    ]);
