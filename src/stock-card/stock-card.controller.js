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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function () {

    'use strict';

    /**
     * @ngdoc controller
     * @name stock-card.controller:StockCardController
     *
     * @description
     * Controller in charge of displaying one single stock card.
     */
    angular
        .module('stock-card')
        .controller('StockCardController', controller);

    controller.$inject = ['stockCard', '$state', 'stockCardService', 'REASON_TYPES', 'messageService'];

    function controller(stockCard, $state, stockCardService, REASON_TYPES, messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getReason = getReason;
        vm.stockCard = [];
        vm.displayedLineItems = [];
        vm.getLineItemVVMStatus = getLineItemVVMStatus;
        vm.getProductVVM = getProductVVM;

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name print
         *
         * @description
         * Print specific stock card.
         *
         */
        vm.print = function () {
            stockCardService.print(vm.stockCard.id);
        };

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name getProductVVM
         *
         * @description
         * Get and display the first lineItem from stock card
         * and return its VVM value
         *
         * @param {object} stockCard to get lineItem from
         * @return {string} VVM status in roman numeral
         */
        function getProductVVM(stockCard) {
            return stockCard.extraData && stockCard.extraData.vvmStatus
                ? convertVVMStatusToRoman(stockCard.extraData.vvmStatus)
                : '';
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name getLineItemVVMStatus
         *
         * @description
         * Get and display line Item VVM value from line extraData.
         *
         * @param {object} lineItem to get extraData.vvmStatus from
         * @return {string} VVM status in roman numeral
         */
        function getLineItemVVMStatus(lineItem) {
            return lineItem && lineItem.extraData && lineItem.extraData.vvmStatus
                ? convertVVMStatusToRoman(lineItem.extraData.vvmStatus)
                : '';
        }

        function convertVVMStatusToRoman(vvmStatus) {
            if (!vvmStatus) return '';
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

        function onInit() {
            $state.current.label = stockCard.orderable.fullProductName;

            var items = [];
            var previousSoh;
            angular.forEach(stockCard.lineItems, function (lineItem) {
                if (lineItem.stockAdjustments.length > 0) {
                    angular.forEach(lineItem.stockAdjustments.slice().reverse(), function (adjustment, i) {
                        var lineValue = angular.copy(lineItem);
                        if (i !== 0) {
                            lineValue.stockOnHand = previousSoh;
                        }
                        lineValue.reason = adjustment.reason;
                        lineValue.quantity = adjustment.quantity;
                        lineValue.stockAdjustments = [];
                        items.push(lineValue);
                        previousSoh = lineValue.stockOnHand - getSignedQuantity(adjustment);
                    });
                } else {
                    items.push(lineItem);
                }
            });

            vm.stockCard = stockCard;
            vm.stockCard.lineItems = items;
        }

        function getSignedQuantity(adjustment) {
            if (adjustment.reason.reasonType === REASON_TYPES.DEBIT) {
                return -adjustment.quantity;
            }
            return adjustment.quantity;

        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name getReason
         *
         * @description
         * Get Reason column value.
         *
         * @param {object} lineItem to get reason from
         * @return {object} message for reason
         */
        function getReason(lineItem) {
            if (lineItem.reasonFreeText) {
                return messageService.get('stockCard.reasonAndFreeText', {
                    name: lineItem.reason.name,
                    freeText: lineItem.reasonFreeText
                });
            }
            return lineItem.reason.isPhysicalReason()
                ? messageService.get('stockCard.physicalInventory')
                : lineItem.reason.name;
        }

    }
})();