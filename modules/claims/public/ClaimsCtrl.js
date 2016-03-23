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
                $scope.rangeStartR = moment($scope.rangeStart);
                $scope.rangeEndR = moment($scope.rangeEnd);
                $scope.refresh();
            }
        };

        /*$scope.$watch('rangeStart', function() {
            $scope.updateRange();
        });

        $scope.$watch('rangeEnd', function() {
            $scope.updateRange();
        });*/

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

            if (!$scope.validated) {
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

            var xmlObj = $.xml2json($scope.xmlContent);

            var claimsObj = {
                "claimNumber": xmlObj.ClaimNumber,
                "claimantFirstName": xmlObj.ClaimantFirstName,
                "claimantLastName": xmlObj.ClaimantLastName,
                "status": xmlObj.Status,
                "lossDate": xmlObj.LossDate,
                "assignedAdjusterID": xmlObj.AssignedAdjusterID
            };

            if(xmlObj.LossInfo){
                claimsObj.lossInfo = {
                    "causeOfLoss": xmlObj.LossInfo.CauseOfLoss,
                    "lossDescription": xmlObj.LossInfo.LossDescription,
                    "reportedDate": xmlObj.LossInfo.ReportedDate
                };
            }
            if(xmlObj.Vehicles && xmlObj.Vehicles.VehicleDetails){
                claimsObj.vehicles = [];
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
                        "licPlateExpDate": xmlObj.Vehicles.VehicleDetails[i].LicPlateExpDate,
                        "damageDescription": xmlObj.Vehicles.VehicleDetails[i].DamageDescription,
                        "mileage": xmlObj.Vehicles.VehicleDetails[i].Mileage
                    });
                }
            }
            $scope.pending = {_msg:"Creating Claims..."};
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
        $scope.pending = {_msg:"Getting claims details..."};
        $scope.success = null;

        // STAFF FIELDS
        $scope.name = {};
        $scope.groups = groups;
        $scope.selectedGroups = [];
        $scope.address = [];
        $scope.phone = [];
        $scope.dob = {};
        $scope.phone.type = "Mobile";
        $scope.randomPassword = true;
        $scope.sendEmailVerification = true;
        $scope.sendWelcomeEmail = false;
        $scope.isCollapsedClaimsAddress = true;

        // DOBOPTS

        $scope.dobOpts = {};
        $scope.dobOpts.months = [
            {value: '01', name: 'January'},
            {value: '02', name: 'February'},
            {value: '03', name: 'March'},
            {value: '04', name: 'April'},
            {value: '05', name: 'May'},
            {value: '06', name: 'June'},
            {value: '07', name: 'July'},
            {value: '08', name: 'August'},
            {value: '09', name: 'September'},
            {value: '10', name: 'October'},
            {value: '11', name: 'November'},
            {value: '12', name: 'December'}
        ];

        $scope.dobOpts.days = [];
        for(var i = 1; i <= 31; i++) {
            if (i < 10) {
                $scope.dobOpts.days.push('0' + i);
            }
            else{
                $scope.dobOpts.days.push(i);
            }
        }

        $scope.dobOpts.years = [];
        var currentYear = moment().format("YYYY");
        for(i = currentYear; i > currentYear - 100; i--) {
            $scope.dobOpts.years.push(String(i));
        }

        // GROUP SELECTION
        $scope.selectGroup = function(groupId) {
            var pos = $scope.selectedGroups.indexOf(groupId);
            if (pos == -1) {
                $scope.selectedGroups.push(groupId);
            }
            else{
                $scope.selectedGroups.splice(pos, 1);
            }
        };

        ClaimsService.getClaims(
            {
                id: claims._id
            },
            //success function
            function(data) {
                $scope.claims = data;
                if(data._name && data._name._first){
                    $scope.name.first = data._name._first;
                }
                if(data._name && data._name._last){
                    $scope.name.last = data._name._last;
                }
                if(data._email && data._email._value){
                    $scope.email = data._email._value;
                }
                if(data._gender){
                    $scope.gender = data._gender;
                }
                if(data._dob){
                    $scope.dob.year = moment(data._dob._birthday).format('YYYY');
                    $scope.dob.month = moment(data._dob._birthday).format('MM');
                    $scope.dob.day = moment(data._dob._birthday).format('DD');
                }

                //@todo come back to array of phone and addresses when we have time
                // PHONE
                /*if (data._phone) {
                    $scope.phone = data._phone;
                    /*for (var i = 0; i < $scope.contact.phone.length; i = i + 1) {
                        if ($scope.contact.phone[i].type == 'Business')
                            $scope.company.phone = $scope.contact.phone[i].number;
                        else
                            $scope.phone = $scope.contact.phone[i];
                    }*/
                /*}

                if (data._address) {
                    $scope.address = data._address;
                }

                if (data._profileImage) {
                    $scope.profileImage = data._profileImage;
                }*/
                if(data._groups){
                    $scope.selectedGroups = data._groups.map(function(g){return g._id;});
                }
                $scope.clearMessages();

            },
            //error function
            function(data, status) {
                $scope.clearMessages();
                $scope.err = data;
            }
        );

        $scope.updateFormProcess = function() {

            $scope.clearMessages();

            var dob = null;
            var phoneObj = [];
            var addressObj = [];

            //make sure all dob fields are filled in if any is filled
            if ($scope.dob.year || $scope.dob.month || $scope.dob.day) {
                if (!($scope.dob.year && $scope.dob.month && $scope.dob.day)) {
                    return $scope.err = {_code:"ANG000", _msg:"Either all parts or no parts of DOB should be filled in."};
                }
                dob = moment($scope.dob.year + '-' + $scope.dob.month + '-' + $scope.dob.day);
            }
            //if password is filled in, make sure it matches with confirm
            if ($scope.password&&($scope.password!==$scope.passwordConfirm)) {
                return $scope.err = {_code:"ANG000", _msg:"Passwords do not match!"};
            }
            /*
            //constructing phoneObj
            if ($scope.phone.number && $scope.phone.type) {
                phoneObj.push({
                    type: $scope.phone.type,
                    number: $scope.phone.number
                });
            }

            // Constructing addressObj
            if ($scope.address) {
                addressObj = [{
                    "type": "Residential",
                    "street": $scope.address.street,
                    "city": $scope.address.city,
                    "state": $scope.address.state,
                    "zip": $scope.address.zip
                }];
            }*/

            var claimsObj = {
                "name": {
                    "first": $scope.name.first,
                    "last": $scope.name.last
                },
                "gender": $scope.gender,
                "dob": dob,
                "email": {
                    "value": $scope.email
                },
                "groups": $scope.selectedGroups
            };

            $scope.pending = {_msg:"Updating Claims..."};
            ClaimsService.updateClaimsProfile(
                $scope.claims._id,
                claimsObj,
                function(data) {
                    $uibModalInstance.close({
                        success: {_msg:"Claims has been successfully updated!"},
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
