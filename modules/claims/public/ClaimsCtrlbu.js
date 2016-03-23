angular.module("claims", [])
    // =========================================================================
    // Claims Controllers ===================================================
    // =========================================================================
    .controller("ClaimsAllCtrl",[ "$scope", "ClaimsService", "$uibModal",
        function ($scope, ClaimsService, $uibModal) {

            $scope.getClaims = function(passBack){
                ClaimsService.getClaims(
                    {},
                    //success function
                    function(data) {
                        $scope.claims = data;
                        if(passBack){
                            $scope.success = passBack.success;
                        }
                    },
                    //error function
                    function (data, status) {
                        $scope.clearMessages();
                        $scope.err = data;
                    }
                );
            };

            $scope.getClaims();

            $scope.refresh = function(data) {
                clearTimeout($scope.activeRequest);
                $scope.activeRequest = setTimeout(function() {
                    $scope.getClaims(data);
                }, 400);
            };

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
            };

            $scope.update = function(updateObj) {
                $scope.clearMessages();

                var modalInstance = $uibModal.open({
                    templateUrl: '/templates/claims/update',
                    controller: 'ClaimsUpdateCtrl',
                    size: "md",
                    resolve: {
                        updateObj: function() {
                            return updateObj;
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
            };

            $scope.updatePassword = function(updateObj) {
                $scope.clearMessages();

                var modalInstance = $uibModal.open({
                    templateUrl: '/templates/claims/update/password',
                    controller: 'ClaimsUpdatePasswordCtrl',
                    size: "md",
                    resolve: {
                        updateObj: function() {
                            return updateObj;
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
            };

            $scope.delete = function(delObj) {
                $scope.clearMessages();

                var modalInstance = $uibModal.open({
                    templateUrl: '/templates/claims/delete',
                    controller: 'ClaimsDeleteCtrl',
                    size: "md",
                    resolve: {
                        delObj: function () {
                            return delObj;
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
            };



            $scope.setIdToRemove = function(q) {
                $scope.indexToRemove = q;
            };

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

            $scope.create = function() {
                $scope.clearMessages();

                var obj = {
                    "name": {
                        "first": $scope.fname,
                        "last": $scope.lname
                    },
                    "email": $scope.email,
                    "password": $scope.password,
                    "phone": {
                        "type": "Business",
                        "number": $scope.phone
                    },
                    "title": $scope.title
                };

                $scope.pending = {_msg:"Creating Employee..."};
                ClaimsService.createEmployee(
                    obj,
                    //success function
                    function(data) {
                        $uibModalInstance.close({
                            success: {_msg:"Employee successfully created!"},
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
            }
        }])

    .controller("ClaimsUpdateCtrl", ["$scope", "$uibModalInstance", "updateObj", "ClaimsService",
        function ($scope, $uibModalInstance, updateObj, ClaimsService) {

            $scope.err = null;
            $scope.pending = {_msg:"Getting claim details..."};
            $scope.success = null;

            ClaimsService.getClaims(
                {
                    id: updateObj._id
                },
                //success function
                function(data) {
                    $scope.clearMessages();
                    if(data._name && data._name._first){
                        $scope.fname = data._name._first;
                    }
                    if(data._name && data._name._last){
                        $scope.lname = data._name._last;
                    }
                    if(data._email){
                        $scope.email = data._email;
                    }
                    if(data._phone && data._phone._number){
                        $scope.phone = data._phone._number;
                    }
                    if(data._title){
                        $scope.title = data._title;
                    }
                },
                //error function
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                }
            );

            $scope.update = function() {

                $scope.clearMessages();

                var obj = {
                    "name": {
                        "first": $scope.fname,
                        "last": $scope.lname
                    },
                    "email": $scope.email,
                    "phone": {
                        "type": "Business",
                        "number": $scope.phone
                    },
                    "title": $scope.title
                };

                $scope.pending = {_msg:"Updating Employee..."};
                ClaimsService.updateEmployee(
                    updateObj._id,
                    obj,
                    //success function
                    function(data) {
                        $uibModalInstance.close({
                            success: {_msg:"Employee successfully updated!"},
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
            }
        }])

    .controller("ClaimsUpdatePasswordCtrl", ["$scope", "$uibModalInstance", "updateObj", "ClaimsService",
        function ($scope, $uibModalInstance, updateObj, ClaimsService) {

            $scope.err = null;
            $scope.pending = {_msg:"Getting claim details..."};
            $scope.success = null;

            ClaimsService.getClaims(
                {
                    id: updateObj._id
                },
                //success function
                function(data) {
                    $scope.clearMessages();
                },
                //error function
                function(data, status) {
                    $scope.clearMessages();
                    $scope.err = data;
                }
            );

            $scope.update = function() {

                $scope.clearMessages();

                var obj = {
                    "password": $scope.password
                };

                $scope.pending = {_msg:"Updating Employee..."};
                ClaimsService.updateEmployeePassword(
                    updateObj._id,
                    obj,
                    //success function
                    function(data) {
                        $uibModalInstance.close({
                            success: {_msg:"Employee successfully updated!"},
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
            }
        }])

    .controller("ClaimsDeleteCtrl", ["$scope", "$uibModalInstance", "delObj", "ClaimsService",
        function ($scope, $uibModalInstance, delObj, ClaimsService) {

            $scope.delObj = delObj;

            $scope.delete = function () {

                ClaimsService.deleteEmployee(
                    $scope.delObj._id,
                    //success function
                    function(data) {
                        $uibModalInstance.close({
                            success: {_msg:"Employee has been successfully deleted!"},
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
                createEmployee: function(obj, success, error) {
                    var req = {
                        method: 'POST',
                        url: '/claims',
                        data: obj
                    };
                    this.apiCall(req, success, error);
                },
                updateEmployee: function(objId, obj, success, error) {
                    var req = {
                        method: 'PUT',
                        url: '/claims/'+objId+"/profile",
                        data: obj
                    };
                    this.apiCall(req, success, error);
                },
                updateEmployeePassword: function(objId, obj, success, error) {
                    var req = {
                        method: 'PUT',
                        url: '/claims/'+objId+"/password",
                        data: obj
                    };
                    this.apiCall(req, success, error);
                },
                deleteEmployee: function(delId, success, error) {
                    var req = {
                        method: 'DELETE',
                        url: '/claims/'+delId
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


