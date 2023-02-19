/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name stock-card-summary-list.controller:StockCardSummaryListController
     *
     * @description
     * Controller responsible displaying Stock Card Summaries.
     */
    angular
        .module('stock-card-summary-list')
        .controller('StockCardSummaryListController', controller);

    controller.$inject = [
        'loadingModalService', '$state', '$stateParams', 'StockCardSummaryRepositoryImpl', 'stockCardSummaries', 'productList',
        'offlineService', '$scope', 'STOCKCARD_STATUS', 'VVM_STATUS', 'messageService', 'paginationService'
    ];

    function controller(loadingModalService, $state, $stateParams, StockCardSummaryRepositoryImpl, stockCardSummaries, productList,
                        offlineService, $scope, STOCKCARD_STATUS, VVM_STATUS, messageService, paginationService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.loadStockCardSummaries = loadStockCardSummaries;
        vm.viewSingleCard = viewSingleCard;
        vm.print = print;
        vm.search = search;
        vm.offline = offlineService.isOffline;
        vm.goToPendingOfflineEventsPage = goToPendingOfflineEventsPage;
        vm.convertVVMStatusToRoman = convertVVMStatusToRoman;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name productCode
         * @type {String}
         *
         */
        vm.productCode = $stateParams.productCode;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name productName
         * @type {String}
         *
         */
        vm.productName = $stateParams.productName;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name lotCode
         * @type {String}
         *
         */
        vm.lotCode = $stateParams.lotCode;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name vvmStatus
         * @type {String}
         *
         */
        vm.vvmStatus = $stateParams.vvmStatus;

        /**
         * @ngdoc property
         * @propertyOf stock-summary-list.controller:StockCardSummaryListController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
         vm.vvmStatuses = VVM_STATUS;


        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardSummaries
         * @type {Array}
         *
         * @description
         * List of Stock Card Summaries.
         */
        vm.stockCardSummaries = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name displayStockCardSummaries
         * @type {Array}
         *
         * @description
         *  Holds current display list of Stock Card Summaries.
         */
        vm.displayStockCardSummaries = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-summary-list.controller:StockCardSummaryListController
         * @name productList
         * @type {Array}
         *
         * @description
         * Holds list of Products.
         */
        vm.productList = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name includeInactive
         * @type {Boolean}
         *
         * @description
         * When true shows inactive items
         */
        vm.includeInactive = $stateParams.includeInactive;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name hideZeroItems
         * @type {Boolean}
         *
         * @description
         * When true, hides stock items with zero values
         */
         vm.hideZeroItems = $stateParams.hideZeroItems;

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name getStockSummaries
         *
         * @description
         * Initialization method for StockCardSummaryListController.
         */
        function onInit() {
            vm.productList = productList;
            vm.stockCardSummaries = stockCardSummaries;
            vm.displayStockCardSummaries = angular.copy(stockCardSummaries);
            checkCanFulFillIsEmpty();
            paginationService.registerList(null, $stateParams, function() {
                return vm.displayStockCardSummaries;
            }, {
                paginationId: 'stockCardSummaries'
            });
            $scope.$watchCollection(function() {
                return vm.pagedList;
            }, function(newList) {
                if (vm.offline()) {
                    vm.displayStockCardSummaries = newList;
                }
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name loadStockCardSummaries
         *
         * @description
         * Responsible for retrieving Stock Card Summaries based on selected program and facility.
         */
        function loadStockCardSummaries() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility.id;
            stateParams.program = vm.program.id;
            stateParams.active = STOCKCARD_STATUS.ACTIVE;
            stateParams.supervised = vm.isSupervised;
            stateParams.productCode = vm.productCode;
            stateParams.productName = vm.productName;
            stateParams.lotCode = vm.lotCode;
            stateParams.vvmStatus = vm.vvmStatus;

            $state.go('openlmis.stockmanagement.stockCardSummaries', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name viewSingleCard
         *
         * @description
         * Go to the clicked stock card's page to view its details.
         *
         * @param {String} stockCardId the Stock Card UUID
         */
        function viewSingleCard(stockCardId) {
            $state.go('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: stockCardId
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name print
         *
         * @description
         * Print SOH summary of current selected program and facility.
         */
        function print() {
            new StockCardSummaryRepositoryImpl().print(vm.program.id, vm.facility.id);
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name search
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility.id;
            stateParams.program = vm.program.id;
            stateParams.supervised = vm.isSupervised;
            stateParams.includeInactive = vm.includeInactive;
            stateParams.hideZeroItems = vm.hideZeroItems;
            stateParams.productCode = vm.productCode;
            stateParams.productName = vm.productName;
            stateParams.lotCode = vm.lotCode;
            stateParams.vvmStatus = vm.vvmStatus;
            
            stateParams.page = 0;
            stateParams.size = 10;

            $state.go('openlmis.stockmanagement.stockCardSummaries', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name goToPendingOfflineEventsPage
         *
         * @description
         * Takes the user to the pending offline events page.
         */
        function goToPendingOfflineEventsPage() {
            $state.go('openlmis.pendingOfflineEvents');
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name checkCanFulFillIsEmpty
         *
         * @description
         * Filters only not empty displayStockCardSummaries.
         */
        function checkCanFulFillIsEmpty() {
            vm.displayStockCardSummaries = vm.displayStockCardSummaries.filter(function(summary) {
                if (summary.canFulfillForMe.length !== 0) {
                    return summary;
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-summary-list.controller:StockCardSummaryListController
         * @name getStatusDisplay
         *
         * @description
         * Returns VVM status display.
         *
         * @param  {String} status VVM status
         * @return {String}        VVM status display name
         */
         vm.getStatusDisplay = function(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        };

        /**
         * @ngdoc method
         * @methodOf stock-summary-list.controller:StockCardSummaryListController
         * @name getProductName
         *
         * @description
         * Returns the product name from a stockcardSummary.
         *
         * @param  {Object} summary stock card summary
         * @return {String}        Product Name
         */
        vm.getProductName = function(summary) {
            debugger;
            return summary.orderable.fullProductName;
        };

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name convertVVMStatusToRoman
         *
         * @description
         * Convert the number part of vvmStatus value to roman numeral
         *
         * @param {string} vvmStatus format: stage_number
         * @return {string} VVM status in roman numeral
         */
        function convertVVMStatusToRoman(vvmStatus) {
            if (!vvmStatus) {
                return '';
            }

            var stageArr = vvmStatus.split('_');
            var stageInt = Number.parseInt(stageArr[1]);
            var romanNumeral = convertToRoman(stageInt);
            return romanNumeral;
        }

        function convertToRoman(num) {
            if (num < 1) {
                return '';
            }
            if (num >= 100) {
                return 'C' + convertToRoman(num - 100);
            }
            if (num >= 90) {
                return 'XC' + convertToRoman(num - 90);
            }
            if (num >= 80) {
                return 'LXXX' + convertToRoman(num - 80);
            }
            if (num >= 70) {
                return 'LXX' + convertToRoman(num - 70);
            }
            if (num >= 60) {
                return 'LX' + convertToRoman(num - 60);
            }
            if (num >= 50) {
                return 'L' + convertToRoman(num - 50);
            }
            if (num >= 40) {
                return 'XL' + convertToRoman(num - 40);
            }
            if (num >= 10) {
                return 'X' + convertToRoman(num - 10);
            }
            if (num >= 9) {
                return 'IX' + convertToRoman(num - 9);
            }
            if (num >= 5) {
                return 'V' + convertToRoman(num - 5);
            }
            if (num >= 4) {
                return 'IV' + convertToRoman(num - 4);
            }
            if (num >= 1) {
                return 'I' + convertToRoman(num - 1);
            }
        }
    }
})();
