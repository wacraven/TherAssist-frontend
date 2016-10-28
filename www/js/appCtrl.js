angular.module('calendarApp', ['ionic', 'ngAnimate', 'ui.rCalendar'])
    .run(function ($ionicPlatform, $animate) {
        'use strict';
        $animate.enabled(false);
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('login', {
              url: '/',
              templateUrl: 'templates/login.html',
              controller: 'LoginCtrl'
            })
            .state('register', {
              url: '/register',
              templateUrl: 'templates/register.html',
              controller: 'RegisterCtrl'
            })
            .state('tabs', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tabs.calendar', {
                url: '/calendar',
                views: {
                    'calendar-tab': {
                        templateUrl: 'templates/calendar.html',
                        controller: 'CalendarCtrl'
                    }
                }
            })
            .state('tabs.patients', {
                url: '/patients',
                views: {
                    'patients-tab': {
                        templateUrl: 'templates/patients.html'
                    }
                }
            })
            .state('tabs.addPatient', {
                url: '/addPatient',
                views: {
                    'addPatient-tab': {
                        templateUrl: 'templates/addPatient.html'
                    }
                }
            })
            .state('tabs.mileage', {
                url: '/mileage',
                views: {
                    'mileage-tab': {
                        templateUrl: 'templates/mileage.html'
                    }
                }
            })
            .state('tabs.settings', {
                url: '/settings',
                views: {
                    'settings-tab': {
                        templateUrl: 'templates/settings.html'
                    }
                }
            });

        // $urlRouterProvider.otherwise('/');            //uncomment after debugging
    })

    .controller('CalendarCtrl', function ($scope) {
        'use strict';
        $scope.calendar = {};
        $scope.changeMode = function (mode) {
            $scope.calendar.mode = mode;
        };

        $scope.LOADBUTTON = function () {                     // come back to this
            $scope.calendar.eventSource = FUNCTIONTOEXECUTE();
        };

        $scope.onEventSelected = function (event) {
            console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
        };

        $scope.onViewTitleChanged = function (title) {
            $scope.viewTitle = title;
        };

        $scope.today = function () {
            $scope.calendar.currentDate = new Date();
        };

        $scope.isToday = function () {
            var today = new Date(),
                currentCalendarDate = new Date($scope.calendar.currentDate);

            today.setHours(0, 0, 0, 0);
            currentCalendarDate.setHours(0, 0, 0, 0);
            return today.getTime() === currentCalendarDate.getTime();
        };

        $scope.onTimeSelected = function (selectedTime, events) {
            console.log('Selected time: ' + selectedTime + ', hasEvents: ' + (events !== undefined && events.length !== 0));
        };

    })

    .controller('LoginCtrl', function($scope, $http, $location) {
      $scope.data = {};

      $scope.login = function() {
        console.log("LOGIN user: " + $scope.data.Username + " - PW: " + $scope.data.Password);
        $http.post('https://therassist.herokuapp.com/api/login', $scope.data)
        .then(
          (response) => {
            if (response.data.status === 'OK') {
              console.log('redirect to calendar');
              $location.path('/tab/calendar')
              // $scope.$apply()
            } else {
              $scope.userMessage = 'Username or Password does not match'
            }
            console.log(response.data);
        },(error) => {
          console.log(error);
          $scope.userMessage = 'There was an error, please try again'
        });
      }
    })

    .controller('RegisterCtrl', function($scope, $http) {
      $scope.data = {};

      $scope.register = function() {
        if ($scope.data.Username && $scope.data.Password && $scope.data.FullName) {
          console.log("REGISTER user: " + $scope.data.Username + " - PW: " + $scope.data.Password + " - Name: " + $scope.data.FullName );
          $http.post('https://therassist.herokuapp.com/api/REGISTER', $scope.data)
          .then(
            (response) => {
              console.log(response.data);
              $location.path('/tab/calendar')
            },(error) => {
              console.log(error);
              $scope.userMessage = 'There was an error, please try again'
            });
        } else if ($scope.data.Password.length < 8) {
          $scope.userMessage = 'Password must be at least 8 characters'
        } else {
          $scope.userMessage = 'Please fill out all fields'
        }
      }
    })
