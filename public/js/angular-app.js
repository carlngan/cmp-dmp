// public/js/angular-app.js
angular.module("cmpApp",
    [
        "ui.router",
        "oc.lazyLoad",
        "ui.bootstrap",
        "ngFileUpload",
        "angular-loading-bar"
    ])
    .config(function ($stateProvider, $locationProvider, $httpProvider) {

        // Set Global HTTP Headers
        // Initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        // Disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // Extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

        $stateProvider

            .state('/', {
                url: "/",
                controller: function($state){
                    $state.go('claims');
                }
            })
            // Claims
            .state('claims', {
                url: "/claims",
                templateUrl: "/templates/claims",
                controller: "ClaimsAllCtrl",
                resolve: {
                    claims: function ($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: "claims",
                                files: ["/pub/claims/ClaimsCtrl.js"]
                            }
                        );
                    }
                }
            })
            .state('logout', {
                url: "/logout",
                controller: function(){
                    window.location = "/logout"
                }
            });

        $locationProvider.html5Mode(true);

    })

    .controller("AppCtrl", function ($scope) {

        //do something

    });
