angular.module("authApp", [])

    // =========================================================================
    // Main Controllers ============================================================
    // =========================================================================
    .controller("AuthenticationCtrl", function ($scope, $window, AuthenticationService) {

        $scope.redirectUrl = window.redirectUrl || "/dashboard";

        $scope.login = function(){
            $scope.error = null;
            $scope.processing = true;
            AuthenticationService.login(
                {
                    "username": $scope.username,
                    "password": $scope.password
                },
                //success function
                function(data){
                    $scope.processing = false;
                    $window.location.href = $scope.redirectUrl;
                },
                //error function
                function(data, status){
                    $scope.processing = false;
                    $scope.error = data;
                }
            );
        };
    })

    .service('AuthenticationService', [
        '$http',
        function ($http, $location, $window) {
            return {
                login: function(loginObj, success, error){
                    var req = {
                        method: 'POST',
                        url: '/api/login',
                        data: loginObj
                    };
                    this.apiCall(req, success, error);
                },
                apiCall: function(req, success, error){
                    $http(req).success(function(data){
                        success(data);
                    }).error(function(data, status){
                        if(status == 401){
                            return $window.location.href = "/login?redirectUrl="+$location.path();
                        }
                        else{
                            error(data, status);
                        }
                    });
                }
            };
        }
    ]);
