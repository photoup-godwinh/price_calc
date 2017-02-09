var app = angular.module('CalcApp', ['angularMoment', 'ngMaterial']);

app.factory('_', ['$window', function($window) {
  return $window._; 
}]);

app.controller('CalcController', ['$scope', 'moment', function($scope, moment) {
	var vm = this; 

	vm.type = "term";
	vm.plans = [
		{
			name: 'Portfolio', 
			price: {
				monthly: 15,
				quarterly: 36,
				annual: 108
			}
		},
		{
			name: 'Pro',
			price: {
				monthly: 25, 
				quarterly: 66,
				annual: 228
			}
		}
	];
	vm.terms = ['Monthly', 'Quarterly', 'Annual'];

	vm.getNewTermsGTE = function(term) {
		var new_terms = [];
		var index = vm.terms.indexOf(term);

		return vm.terms.slice(index);
	};

	vm.getNewHigherTerms = function(term) {
		var new_terms = [];
		var index = vm.terms.indexOf(term);

		return vm.terms.slice(index+1);
	};

	vm.getTermModifier = function(term) {
		return (term == "Monthly" ? 1 : (term == "Quarterly" ? 3 : 12));
	};

	vm.getEndDate = function(start_date, term) {
		var month 	= start_date.getMonth();
		var date 	= start_date.getDate();
		var year 	= start_date.getFullYear();
		var modifier = vm.getTermModifier(term);
		var new_end_date; 

		return moment([year, month, date]).add(modifier, 'months').toDate();
	};

	vm.getNewStartDate = function(plan_change_date) {
		return start_date = moment(plan_change_date).format('M/D/YYYY');
	};

	vm.getNewEndDate = function(plan_change_date, new_term) {
		var end_date = null; 
		var modifier;

		modifier  = vm.getTermModifier(new_term);
		end_date = moment(plan_change_date).add(modifier, 'months').format('M/D/YYYY');

		return end_date;
	};

	vm.getDeduction = function(start_date, end_date, plan_change_date, plan, term) {
		var deduction = 0;

		var m_start_date = moment(start_date);
		var m_end_date = moment(end_date);
		var m_new_start_date = moment(plan_change_date);

		var old_plan_cost = plan.price[term.toLowerCase()];
		var subscription_days = m_new_start_date.diff(m_start_date, 'days');
		var plan_duration_days = m_end_date.diff(m_start_date, 'days');

		return old_plan_cost - (old_plan_cost / plan_duration_days * subscription_days);
	};

	vm.getPayable = function(start_date, end_date, plan_change_date, plan, term) {
		var deduction = vm.getDeduction(start_date, end_date, plan_change_date, plan, term); 

		return plan.price[term.toLowerCase()] - deduction;
	};

}]);

app.controller('TermController', ['$scope', '_', 'moment', function($scope, _, moment) {
	var vm = this; 

	var init = function() {
		vm.plan = _.first($scope.calcCtrl.plans);
		vm.term = "Monthly";
		vm.new_term = "Quarterly";
		vm.start_date = moment([2017, 0, 1]).toDate();
		vm.end_date = moment([2017, 1, 1]).toDate();
	};

	/*
	vm.getDeduction = function() {
		var deduction = 0;

		var m_start_date = moment(vm.start_date);
		var m_end_date = moment(vm.end_date);
		var m_new_start_date = moment(vm.plan_change_date);

		var old_plan_cost = vm.plan.price[vm.term.toLowerCase()];
		var subscription_days = m_new_start_date.diff(m_start_date, 'days');
		var plan_duration_days = m_end_date.diff(m_start_date, 'days');

		return old_plan_cost - (old_plan_cost / plan_duration_days * subscription_days);
	};

	vm.getPayable = function() {
		var deduction = vm.getDeduction(); 

		return vm.plan.price[vm.new_term.toLowerCase()] - deduction;
	}; */

	vm.getDeduction = function() {
		return $scope.calcCtrl.getDeduction(vm.start_date, vm.end_date, vm.plan_change_date, vm.plan, vm.term);
	};

	vm.getPayable = function() {
		var deduction = vm.getDeduction();

		return vm.plan.price[vm.new_term.toLowerCase()] - deduction;
	};

	vm.getNewStartDate = function() {
		var start_date = null; 

		// if(vm.plan_change_date) {
		start_date = moment(vm.plan_change_date).format('M/D/YYYY');
		// }

		return start_date;
	};

	vm.getNewEndDate = function() {
		var end_date = null; 
		var modifier;

		// if(vm.plan_change_date) {
		modifier  = vm.getTermModifier(vm.new_term);
		end_date = moment(vm.plan_change_date).add(modifier, 'months').format('M/D/YYYY');
		// }

		return end_date;
	};

	vm.getTermModifier = function(term) {
		return (term == "Monthly" ? 1 : (term == "Quarterly" ? 3 : 12));
	};

	vm.setEndDate = function() {
		var month 	= vm.start_date.getMonth();
		var date 	= vm.start_date.getDate();
		var year 	= vm.start_date.getFullYear();
		var modifier = vm.getTermModifier(vm.term);
		// vm.term == "Monthly" ? 1 : (vm.term == "Quarterly" ? 3 : 12);

		vm.end_date = moment([year, month, date]).add(modifier, 'months').toDate();
	};

	$scope.$watch(function() {
		return vm.term;
	}, function(new_val) {
		vm.setEndDate();

		var new_terms = $scope.calcCtrl.getNewHigherTerms(new_val);

		vm.new_term = _.first(new_terms);
	});

	$scope.$watch(function() {
		return vm.start_date;
	}, function() {
		vm.setEndDate();
	});

	init();
}]);


app.controller('UpgradeController', ['$scope', function($scope) {
	var vm = this; 

	var init = function() {
		vm.plan = $scope.calcCtrl.plans[0];
		vm.new_plan = $scope.calcCtrl.plans[1];
		vm.term = "Monthly";
		vm.start_date = moment([2017, 0, 1]).toDate();
		vm.end_date = moment([2017, 1, 1]).toDate();
	};

	vm.getDeduction = function() {
		return $scope.calcCtrl.getDeduction(vm.start_date, vm.end_date, vm.plan_change_date, vm.plan, vm.term);
	};

	vm.getPayable = function() {
		var deduction = vm.getDeduction();

		return vm.plan.price[vm.new_term.toLowerCase()] - deduction;
	};

	$scope.$watch(function() {
		return vm.term;
	}, function(new_val) {
		var new_terms = $scope.calcCtrl.getNewTermsGTE(new_val);

		vm.end_date = $scope.calcCtrl.getEndDate(vm.start_date, new_val);
		vm.new_term = _.first(new_terms);
	});

	$scope.$watch(function() {
		return vm.start_date;
	}, function(new_val) {
		vm.end_date = $scope.calcCtrl.getEndDate(new_val, vm.term);
	});

	init();
}]);