angular.module('calendarApp', ['ionic', 'ngAnimate', 'angular-momentjs', 'ui.rCalendar'])
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
            .state('tabs.schedulenew', {
                url: '/schedulenew',
                views: {
                    'patients-tab': {
                        templateUrl: 'templates/scheduleNew.html',
                        controller: 'ScheduleNewCtrl'
                    }
                }
            })
            .state('tabs.editpatient', {
                url: '/editpatient',
                views: {
                    'patients-tab': {
                        templateUrl: 'templates/editPatient.html',
                        controller: 'EditPatientCtrl'
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

        // $urlRouterProvider.otherwise('/');            //uncomment after debugging
    })

    .config(function($ionicConfigProvider) {
      $ionicConfigProvider.views.maxCache(0);
      $ionicConfigProvider.backButton.text('Go Back').icon('ion-chevron-left');
    })

    .config(function($momentProvider){
      $momentProvider
        .asyncLoading(false)
        .scriptUrl('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min.js');
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
        if (!$scope.data.Username || !$scope.data.Password || !$scope.data.FullName) {
          $scope.userMessage = 'Please fill out all fields'
        } else if ($scope.data.Password.length < 8) {
          $scope.userMessage = 'Password must be at least 8 characters'
        } else {
          $scope.userMessage = undefined
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
        }
      }
    })

    .controller('CalendarCtrl', function ($scope, $rootScope, $http, $moment) {
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
        $scope.calendar.eventSource = []
        $http.post('https://therassist.herokuapp.com/api/appointment/get/all', { ClinicianId: $rootScope.ClinicianId })
        .then(
          (appointment) => {
            let events = []
            for (var i = 0; i < appointment.data.length; i++) {
              let nextEvent = {
                title: appointment.data[i].Title,
                startTime: $moment(appointment.data[i].TimeStart).subtract(1, 'hour').format(),  //works but check on .subtract()
                endTime: $moment(appointment.data[i].TimeEnd).subtract(1, 'hour').format(),      // look at formatting 2016-11-01T13:00:00-05:00 see if get am/pm http://momentjs.com/docs/#/displaying/format/
                allDay: false
              }
              console.log(nextEvent);
              events.push(nextEvent)
            }
            $scope.calendar.eventSource = events
          },(error) => {
            console.log(error);
          });
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
        $scope.viewPatient = function(PatientId) {
          $rootScope.currentPatient = PatientId
          console.log($rootScope.currentPatient);
          $location.path('/tab/viewpatient')
        }
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
        if ($scope.data.Name && $scope.data.PrimaryContact && $scope.data.Phone && $scope.data.Location && $scope.data.DateOfBirth && $scope.data.Diagnosis && $scope.data.LastEvaluation && $scope.data.EvaluationFrequency && $scope.data.SessionTime && $scope.data.SessionFrequency) {
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

    .controller('EditPatientCtrl', function($scope, $http, $location, $rootScope, $ionicHistory) {
      console.log('EditPatientCtrl FIRED');
      $http.post('https://therassist.herokuapp.com/api/patient/get/one', { PatientId: $rootScope.currentPatient})
      .then(
        (response) => {
          response.data.DateOfBirth = new Date(response.data.DateOfBirth.substring(0, 10).replace(/-/, '/'))
          response.data.LastEvaluation = new Date(response.data.LastEvaluation.substring(0, 10).replace(/-/, '/'))
          console.log('response',response.data);
          $scope.data = response.data
        },(error) => {
          console.log(error);
        });
        $scope.goBack = function() {
        console.log('Going back');
        $ionicHistory.backView().go();
        };
      $scope.confirmEdit = function() {
        console.log($scope.data);
        if ($scope.data.Name && $scope.data.PrimaryContact && $scope.data.Phone && $scope.data.Location && $scope.data.DateOfBirth && $scope.data.Diagnosis && $scope.data.LastEvaluation && $scope.data.EvaluationFrequency && $scope.data.SessionTime && $scope.data.SessionFrequency) {
          $http.post('https://therassist.herokuapp.com/api/patient/edit', $scope.data)
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

    .controller('ViewPatientCtrl', function($scope, $http, $location, $rootScope, $moment, $ionicPopup) {
      console.log('ViewPatientCtrl FIRED');
      $http.post('https://therassist.herokuapp.com/api/patient/get/one', { PatientId: $rootScope.currentPatient})
      .then(
        (response) => {
          console.log('response',response.data);
          $scope.dataClean(response.data)
        },(error) => {
          console.log(error);
        });
      $scope.dataClean = function(patientData) {   //convert this to momentjs
        patientData.DateOfBirth = patientData.DateOfBirth.split('-')
        patientData.DateOfBirth[2] = patientData.DateOfBirth[2].substring(0,2)
        patientData.DisplayDOB = `${patientData.DateOfBirth[1]}/${patientData.DateOfBirth[2]}/${patientData.DateOfBirth[0]}`
        patientData.DisplayAge = $scope.getAge(patientData.DisplayDOB)

        patientData.LastEvaluation = patientData.LastEvaluation.split('-')
        patientData.LastEvaluation[2] = patientData.LastEvaluation[2].substring(0,2)
        patientData.DisplayLastEval = `${patientData.LastEvaluation[1]}/${patientData.LastEvaluation[2]}/${patientData.LastEvaluation[0]}`
        patientData.DisplayNextEval = $moment(patientData.LastEvaluation).add(Number(patientData.EvaluationFrequency.split(' ')[0] - 1), 'months').calendar()

        $scope.patient = patientData
      }
      $scope.goToEditPatient = function() {
        $location.path('/tab/editpatient')
      }
      $scope.startNavigation = function() {
        $ionicPopup.confirm({
           title: 'Would you like to log a new trip?',
           template: 'This will log a new trip from your current location to this address'
         })
         .then(function(res) {
           if(res) {
             console.log('Beginning Navigation');
             navigator.geolocation.getCurrentPosition($scope.navigate, (err) => console.log(err))
           } else {
             console.log('Cancelling Navigation');
           }
         });
      }
      $scope.navigate = (data) => {
        let tripData = {
          TripId: Date.now(),
          ClinicianId: $rootScope.ClinicianId,
          Date: $moment.utc().format(),
          lat: data.coords.latitude,
          long: data.coords.longitude,
          dest: $scope.patient.Location
        }
        console.log(tripData);
        $http.post('https://therassist.herokuapp.com/api/mileage/new', tripData)
        .then(
          (response) => {
            console.log(response.data);
          },(error) => {
            console.log(error);
          });
      }
      $scope.schedulePatient = function() {
        $location.path('/tab/schedulenew')
      }
      $scope.getAge = function(dateString) {    //dateString should be in format MM/DD/YYYY    //function from stackoverflow; link: http://stackoverflow.com/questions/12251325/javascript-date-to-calculate-age-work-by-the-day-months-years
        var now = new Date();
        var today = new Date(now.getYear(),now.getMonth(),now.getDate());
        var yearNow = now.getYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();
        var dob = new Date(dateString.substring(6,10),
                           dateString.substring(0,2)-1,
                           dateString.substring(3,5)
                           );
        var yearDob = dob.getYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {};
        var ageString = "";
        var yearString = "";
        var monthString = "";
        var dayString = "";
        yearAge = yearNow - yearDob;
        if (monthNow >= monthDob)
          var monthAge = monthNow - monthDob;
        else {
          yearAge--;
          var monthAge = 12 + monthNow -monthDob;
        }
        if (dateNow >= dateDob)
          var dateAge = dateNow - dateDob;
        else {
          monthAge--;
          var dateAge = 31 + dateNow - dateDob;
          if (monthAge < 0) {
            monthAge = 11;
            yearAge--;
          }
        }
        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
            };
        if ( age.years > 1 ) yearString = " years";
        else yearString = " year";
        if ( age.months> 1 ) monthString = " months";
        else monthString = " month";
        if ( age.days > 1 ) dayString = " days";
        else dayString = " day";
        if ( (age.years > 0) && (age.months > 0) && (age.days > 0) )
          ageString = age.years + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + " old.";
        else if ( (age.years == 0) && (age.months == 0) && (age.days > 0) )
          ageString = "Only " + age.days + dayString + " old!";
        else if ( (age.years > 0) && (age.months == 0) && (age.days == 0) )
          ageString = age.years + yearString + " old today.";
        else if ( (age.years > 0) && (age.months > 0) && (age.days == 0) )
          ageString = age.years + yearString + " and " + age.months + monthString + " old.";
        else if ( (age.years == 0) && (age.months > 0) && (age.days > 0) )
          ageString = age.months + monthString + " and " + age.days + dayString + " old.";
        else if ( (age.years > 0) && (age.months == 0) && (age.days > 0) )
          ageString = age.years + yearString + " and " + age.days + dayString + " old.";
        else if ( (age.years == 0) && (age.months > 0) && (age.days == 0) )
          ageString = age.months + monthString + " old.";
        else ageString = "Oops! Could not calculate age!";
        return ageString;
      }
    })

    .controller('ScheduleNewCtrl', function($scope, $http, $location, $rootScope, $moment, $ionicHistory) {
      console.log('ScheduleNewCtrl FIRED');

      $rootScope.calendarEvents = []
      $http.post('https://therassist.herokuapp.com/api/patient/get/one', {PatientId: $rootScope.currentPatient})
      .then(
        (response) => {
          console.log(response.data);
          $scope.patient = response.data
        },(error) => {
          console.log(error);
        });

        $scope.data = {
          PatientId: $rootScope.currentPatient,
          ClinicianId: $rootScope.ClinicianId
        }
      $scope.addAppointment = function() {
        $scope.data.Title = $scope.patient.Name
        $scope.data.AppointmentId = Date.now()

        if ($scope.patient.SessionTime === '1 hour') {
          $scope.patient.SessionTime = '60 minutes'
        } else if ($scope.patient.SessionTime === '1.5 hours') {
          $scope.patient.SessionTime = '90 minutes'
        } else if ($scope.patient.SessionTime === '2 hours') {
          $scope.patient.SessionTime = '120 minutes'
        }
        $scope.goBack = function() {
          console.log('Going back');
          $ionicHistory.backView().go();
        };
        let startStringUTC = $moment.utc($scope.data.Date).format('YYYY-MM-DD') + 'T' + $moment.utc($scope.data.apptTime).format('HH:mm:ss') + '+00:00'
        console.log('startStringUTC', startStringUTC);
        $scope.data.TimeStart = $moment.utc(startStringUTC).format()
        console.log($scope.data.TimeStart);
        $scope.data.TimeEnd = $moment.utc($scope.data.TimeStart).add(Number($scope.patient.SessionTime.split(' ')[0]), 'minutes').format()
        console.log($scope.data.TimeEnd);
        $http.post('https://therassist.herokuapp.com/api/appointment/add', $scope.data)
        .then(
          (response) => {
            console.log(response.data);
            $scope.goBack()
          },(error) => {
            console.log(error);
          });
      }
    })

    .controller('MileageCtrl', function($scope, $http, $location, $rootScope, $moment) {
      console.log('MileageCtrl FIRED');
      $scope.addManually = function() {
        // $location.path('/tab/addmileage')
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
      $scope.trips = []
      $http.post('https://therassist.herokuapp.com/api/mileage/get', {ClinicianId: $rootScope.ClinicianId})
      .then(
        (response) => {
          console.log(response.data);
          for (var i = 0; i < response.data.length; i++) {
            response.data[i].Date = $moment(response.data[i].Date).format('ddd, MMM Do YYYY, h:mm a')
          }
          $scope.trips = response.data.sort(sort_by('Date', false))
        },(error) => {
          console.log(error);
        });
    })

    .controller('SettingsCtrl', function($scope, $http, $location, $rootScope) {
      console.log('SettingsCtrl FIRED');
      $scope.logout = function() {
        $location.path('/')
      }
    })
