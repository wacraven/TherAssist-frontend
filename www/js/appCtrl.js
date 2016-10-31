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
                        templateUrl: 'templates/patients.html',
                        controller: 'PatientsCtrl'
                    }
                }
            })
            .state('tabs.addpatient', {
                url: '/addpatient',
                views: {
                    'patients-tab': {
                        templateUrl: 'templates/addPatient.html',
                        controller: 'AddPatientCtrl'
                    }
                }
            })
            .state('tabs.viewpatient', {
                url: '/viewpatient',
                views: {
                    'patients-tab': {
                        templateUrl: 'templates/viewPatient.html',
                        controller: 'ViewPatientCtrl'
                    }
                }
            })
            .state('tabs.mileage', {
                url: '/mileage',
                views: {
                    'mileage-tab': {
                        templateUrl: 'templates/mileage.html',
                        controller: 'MileageCtrl'
                    }
                }
            })
            .state('tabs.settings', {
                url: '/settings',
                views: {
                    'settings-tab': {
                        templateUrl: 'templates/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');            //uncomment after debugging
    })

    .config(function($ionicConfigProvider) {
      $ionicConfigProvider.views.maxCache(0);
      $ionicConfigProvider.backButton.text('Go Back').icon('ion-chevron-left');
    })

    .controller('LoginCtrl', function($scope, $http, $location, $rootScope) {
      $scope.data = {};
      $scope.login = function() {
        console.log("LOGIN user: " + $scope.data.Username + " - PW: " + $scope.data.Password);
        $http.post('https://therassist.herokuapp.com/api/login', $scope.data)
        .then(
          (response) => {
            if (response.data.status === 'OK') {
              $rootScope.ClinicianId = response.data.ClinicianId
              console.log('redirect to calendar');
              $location.path('/tab/calendar')
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

    .controller('RegisterCtrl', function($scope, $http, $location, $rootScope) {
      $scope.data = {};
      $scope.register = function() {
        if ($scope.data.Username && $scope.data.Password && $scope.data.FullName) {
          console.log("REGISTER user: " + $scope.data.Username + " - PW: " + $scope.data.Password + " - Name: " + $scope.data.FullName );
          $http.post('https://therassist.herokuapp.com/api/register', $scope.data)
          .then(
            (response) => {
              $rootScope.ClinicianId = response.data.ClinicianId
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

    .controller('CalendarCtrl', function ($scope) {
      console.log('CalendarCtrl FIRED');
        'use strict';
        $scope.calendar = {};
        $scope.changeMode = function (mode) {
            $scope.calendar.mode = mode;
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
            let today = new Date()
            let currentCalendarDate = new Date($scope.calendar.currentDate);
            today.setHours(0, 0, 0, 0);
            currentCalendarDate.setHours(0, 0, 0, 0);
            return today.getTime() === currentCalendarDate.getTime();
        };

        $scope.onTimeSelected = function (selectedTime, events) {
            console.log('Selected time: ' + selectedTime + ', hasEvents: ' + (events !== undefined && events.length !== 0));
        };
    })

    .controller('PatientsCtrl', function($scope, $http, $location, $rootScope) {
      console.log('PatientsCtrl FIRED');
      $scope.goToAddPatient = function() {
        $location.path('/tab/addpatient')

      }

      let sort_by = (field, reverse, primer) => {     //sorting array from stackoverflow. link: http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
         var key = primer ?
             function(x) {return primer(x[field])} :
             function(x) {return x[field]};
         reverse = !reverse ? 1 : -1;
         return function (a, b) {
             return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
           }
      }

      $scope.patients = []
      $http.post('https://therassist.herokuapp.com/api/patient/get/all', {ClinicianId: $rootScope.ClinicianId})
      .then(
        (response) => {
          console.log(response.data);
          $scope.patients = response.data.sort(sort_by('Name', false))
        },(error) => {
          console.log(error);
        });

    })

    .controller('AddPatientCtrl', function($scope, $http, $location, $rootScope, $ionicHistory) {
      console.log('AddPatientCtrl FIRED');
      $scope.data = {
        ClinicianId: $rootScope.ClinicianId,
        PatientId: Date.now()
      };
      $scope.goBack = function() {
        console.log('Going back');
        $ionicHistory.backView().go();
      };
      $scope.addPatient = function() {
        console.log($scope.data);
        if ($scope.data.Name && $scope.data.PrimaryContact && $scope.data.Phone && $scope.data.Location && $scope.data.DateOfBirth && $scope.data.Diagnosis && $scope.data.LastEvaluation && $scope.data.EvaluationFrequency && $scope.data.Goal1 && $scope.data.Goal2 && $scope.data.Goal3 && $scope.data.SessionTime && $scope.data.SessionFrequency) {
          $http.post('https://therassist.herokuapp.com/api/patient/new', $scope.data)
          .then(
            (response) => {
              $scope.goBack()
              console.log('response',response.data);
            },(error) => {
              console.log('error',error);
            });
        } else {
          $scope.userMessage = 'Please fill out all fields'
        }
      }
    })

    .controller('ViewPatientCtrl', function($scope, $http, $location, $rootScope) {
      console.log('ViewPatientCtrl FIRED');
      $scope.data = {
        ClinicianId: $rootScope.ClinicianId,
        PatientId: Date.now()
      };
      $scope.addPatient = function() {
        console.log($scope.data);
        if ($scope.data.Name && $scope.data.PrimaryContact && $scope.data.Phone && $scope.data.Location && $scope.data.DateOfBirth && $scope.data.Diagnosis && $scope.data.LastEvaluation && $scope.data.EvaluationFrequency && $scope.data.Goal1 && $scope.data.Goal2 && $scope.data.Goal3 && $scope.data.SessionTime && $scope.data.SessionFrequency) {
          $http.post('https://therassist.herokuapp.com/api/patient/new', $scope.data)
          .then(
            (response) => {
              console.log('response',response.data);
            },(error) => {
              console.log(error);
            });
        } else {
          $scope.userMessage = 'Please fill out all fields'
        }
      }
    })
