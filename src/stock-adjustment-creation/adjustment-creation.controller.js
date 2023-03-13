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
     * @name stock-adjustment-creation.controller:StockAdjustmentCreationController
     *
     * @description
     * Controller for managing stock adjustment creation.
     */
    angular
        .module('stock-adjustment-creation')
        .controller('StockAdjustmentCreationController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
        'orderableGroups', 'reasons', 'confirmService', 'messageService', 'user', 'adjustmentType',
        'srcDstAssignments', 'stockAdjustmentCreationService', 'notificationService', 'offlineService',
        'orderableGroupService', 'MAX_INTEGER_VALUE', 'VVM_STATUS', 'loadingModalService', 'alertService',
        'dateUtils', 'displayItems',  'accessTokenFactory', 'stockmanagementUrlFactory', '$window', 'ADJUSTMENT_TYPE', 'UNPACK_REASONS', 'REASON_TYPES', 'STOCKCARD_STATUS',
        'hasPermissionToAddNewLot', 'LotResource', '$q', 'editLotModalService', 'moment'
    ];

    function controller($scope, $state, $stateParams, $filter, confirmDiscardService, program,
                        facility, orderableGroups, reasons, confirmService, messageService, user,
                        adjustmentType, srcDstAssignments, stockAdjustmentCreationService, notificationService,
                        offlineService, orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService,
                        alertService, dateUtils, displayItems, accessTokenFactory, stockmanagementUrlFactory, $window, ADJUSTMENT_TYPE, UNPACK_REASONS, REASON_TYPES,
                        STOCKCARD_STATUS, hasPermissionToAddNewLot, LotResource, $q, editLotModalService, moment) {
        var vm = this,
            previousAdded = {};

        vm.expirationDateChanged = expirationDateChanged;
        vm.newLotCodeChanged = newLotCodeChanged;
        vm.validateExpirationDate = validateExpirationDate;
        vm.lotChanged = lotChanged;
        vm.addProduct = addProduct;
        vm.hasPermissionToAddNewLot = hasPermissionToAddNewLot;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showReasonDropdown
         * @type {boolean}
         */
        vm.showReasonDropdown = true;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showReasonDropdown
         * @type {boolean}
         */
        vm.showPrintIssueDraftButton = function() {
            return adjustmentType.state === ADJUSTMENT_TYPE.ISSUE.state;
        };

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name offline
         * @type {boolean}
         *
         * @description
         * Holds information about internet connection
         */
        vm.offline = offlineService.isOffline;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + 'Creation.' + secondaryKey;
        };

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name newLot
         * @type {Object}
         *
         * @description
         * Holds new lot object.
         */
        vm.newLot = undefined;

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        vm.search = function() {
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);

            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
            $state.go($state.current.name, $stateParams, {
                reload: true,
                notify: false
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name addProduct
         *
         * @description
         * Add a product for stock adjustment.
         */
        function addProduct() {
            var selectedItem;

            if (vm.selectedOrderableGroup && vm.selectedOrderableGroup.length) {
                vm.newLot.tradeItemId = vm.selectedOrderableGroup[0].orderable.identifiers.tradeItem;
            }

            if (vm.newLot.lotCode) {
                var createdLot = angular.copy(vm.newLot);
                selectedItem = orderableGroupService
                    .findByLotInOrderableGroup(vm.selectedOrderableGroup, createdLot, true);
                selectedItem.$isNewItem = true;
            } else {
                selectedItem = orderableGroupService
                    .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);
            }

            vm.newLot.expirationDateInvalid = undefined;
            vm.newLot.lotCodeInvalid = undefined;
            validateExpirationDate();
            validateLotCode(vm.addedLineItems, selectedItem);
            validateLotCode(vm.allItems, selectedItem);
            var noErrors = !vm.newLot.expirationDateInvalid && !vm.newLot.lotCodeInvalid;

            if (noErrors) {
                vm.addedLineItems.unshift(_.extend({
                    $errors: {},
                    $previewSOH: selectedItem.stockOnHand
                },
                selectedItem, copyDefaultValue()));

                previousAdded = vm.addedLineItems[0];

                vm.search();
            }
        }

        function copyDefaultValue() {
            var defaultDate;
            if (previousAdded.occurredDate) {
                defaultDate = previousAdded.occurredDate;
            } else {
                defaultDate = dateUtils.toStringDate(new Date());
            }
            var defaultReason = previousAdded.reason;
            if (adjustmentType.state === ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                defaultReason = {
                    id: UNPACK_REASONS.KIT_UNPACK_REASON_ID
                };
            } else if (adjustmentType.state === ADJUSTMENT_TYPE.PROGRAM_TRANSFER.state) {
                defaultReason = vm.reasons.find(function(reason) {
                    return reason.tags.includes('p2p') && reason.reasonType === 'DEBIT';
                });
            }
            return {
                assignment: previousAdded.assignment,
                srcDstFreeText: previousAdded.srcDstFreeText,
                reason: defaultReason,
                reasonFreeText: previousAdded.reasonFreeText,
                occurredDate: defaultDate
            };
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name remove
         *
         * @description
         * Remove a line item from added products.
         *
         * @param {Object} lineItem line item to be removed.
         */
        vm.remove = function(lineItem) {
            var index = vm.addedLineItems.indexOf(lineItem);
            vm.addedLineItems.splice(index, 1);

            vm.search();
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name removeDisplayItems
         *
         * @description
         * Remove all displayed line items.
         */
        vm.removeDisplayItems = function() {
            confirmService.confirmDestroy(vm.key('clearAll'), vm.key('clear'))
                .then(function() {
                    vm.addedLineItems = _.difference(vm.addedLineItems, vm.displayItems);
                    vm.displayItems = [];
                });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > lineItem.$previewSOH && lineItem.reason
                    && lineItem.reason.reasonType === REASON_TYPES.DEBIT) {
                lineItem.$errors.quantityInvalid = messageService
                    .get('stockAdjustmentCreation.quantityGreaterThanStockOnHand');
            } else if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (lineItem.quantity >= 1) {
                lineItem.$errors.quantityInvalid = false;
            } else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateAssignment
         *
         * @description
         * Validate line item assignment and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateAssignment = function(lineItem) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.ADJUSTMENT.state &&
                adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state &&
                adjustmentType.state !== ADJUSTMENT_TYPE.PROGRAM_TRANSFER.state) {
                lineItem.$errors.assignmentInvalid = isEmpty(lineItem.assignment);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateReason
         *
         * @description
         * Validate line item reason and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateReason = function(lineItem) {
            if (adjustmentType.state === 'adjustment') {
                lineItem.$errors.reasonInvalid = isEmpty(lineItem.reason);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateVVMStatus
         *
         * @description
         * Validate line item VVM Status and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateVVMStatus = function(lineItem) {
            if (lineItem.orderable.extraData.useVVM === 'true') {
                lineItem.$errors.vvmStatusInvalid = isEmpty(lineItem.vvmStatus);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name lotChanged
         *
         * @description
         * Allows inputs to add missing lot to be displayed.
         */
        function lotChanged() {
            vm.canAddNewLot = vm.selectedLot
                && vm.selectedLot.lotCode === messageService.get('orderableGroupService.addMissingLot');
            initiateNewLotObject();
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateDate
         *
         * @description
         * Validate line item occurred date and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateDate = function(lineItem) {
            lineItem.$errors.occurredDateInvalid = isEmpty(lineItem.occurredDate);
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name clearFreeText
         *
         * @description
         * remove free text from given object.
         *
         * @param {Object} obj      given target to be changed.
         * @param {String} property given property to be cleared.
         */
        vm.clearFreeText = function(obj, property) {
            obj[property] = null;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        vm.submit = function() {
            $scope.$broadcast('openlmis-form-submit');
            if (validateAllAddedItems()) {
                var confirmMessage = messageService.get(vm.key('confirmInfo'), {
                    username: user.username,
                    number: vm.addedLineItems.length
                });
                confirmService.confirm(confirmMessage, vm.key('confirm')).then(confirmSubmit);
            } else {
                vm.keyword = null;
                reorderItems();
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name printIssueDraft
         *
         * @description
         * Print draft of all added items.
         */
        vm.printIssueDraft = function() {
            // $scope.$broadcast('openlmis-form-submit');
            if (validateAllAddedItems()) {
                confirmService.confirm(getPrintIssueDraftText(),
                    'stockAdjustmentCreation.printModal.yes',
                    'stockAdjustmentCreation.printModal.no').then(confirmPrint);
                
            } else {
                vm.keyword = null;
                reorderItems();
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name orderableSelectionChanged
         *
         * @description
         * Reset form status and change content inside lots drop down list.
         */
        vm.orderableSelectionChanged = function() {
            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;

            initiateNewLotObject();
            vm.canAddNewLot = false;

            //same as above
            $scope.productForm.$setUntouched();

            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();

            vm.lots = orderableGroupService.lotsOf(vm.selectedOrderableGroup, vm.hasPermissionToAddNewLot);
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
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

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                vm.validateQuantity(item);
                vm.validateDate(item);
                vm.validateAssignment(item);
                vm.validateReason(item);
                vm.validateVVMStatus(item);
            });
            return _.chain(vm.addedLineItems)
                .groupBy(function(item) {
                    return item.lot ? item.lot.id : item.orderable.id;
                })
                .values()
                .flatten()
                .all(isItemValid)
                .value();
        }

        function isItemValid(item) {
            return _.chain(item.$errors).keys()
                .all(function(key) {
                    return item.$errors[key] === false;
                })
                .value();
        }

        function reorderItems() {
            var sorted = $filter('orderBy')(vm.addedLineItems, ['orderable.productCode', '-occurredDate']);

            vm.displayItems = _.chain(sorted).groupBy(function(item) {
                return item.lot ? item.lot.id : item.orderable.id;
            })
                .sortBy(function(group) {
                    return _.every(group, function(item) {
                        return !item.$errors.quantityInvalid;
                    });
                })
                .flatten(true)
                .value();
        }

        function confirmSubmit() {
            loadingModalService.open();

            var addedLineItems = angular.copy(vm.addedLineItems);

            generateKitConstituentLineItem(addedLineItems);

            var lotPromises = [],
                errorLots = [];
            var distinctLots = [];
            var lotResource = new LotResource();
            addedLineItems.forEach(function(lineItem) {
                if (lineItem.lot && lineItem.$isNewItem && _.isUndefined(lineItem.lot.id) &&
                !listContainsTheSameLot(distinctLots, lineItem.lot)) {
                    distinctLots.push(lineItem.lot);
                }
            });
            distinctLots.forEach(function(lot) {
                lotPromises.push(lotResource.create(lot)
                    .then(function(createResponse) {
                        vm.addedLineItems.forEach(function(item) {
                            if (item.lot.lotCode === lot.lotCode) {
                                item.$isNewItem = false;
                                addItemToOrderableGroups(item);
                            }
                        });
                        return createResponse;
                    })
                    .catch(function(response) {
                        if (response.data.messageKey ===
                            'referenceData.error.lot.lotCode.mustBeUnique') {
                            errorLots.push(lot.lotCode);
                        }
                    }));
            });

            return $q.all(lotPromises)
                .then(function(responses) {
                    if (errorLots !== undefined && errorLots.length > 0) {
                        return $q.reject();
                    }
                    responses.forEach(function(lot) {
                        addedLineItems.forEach(function(lineItem) {
                            if (lineItem.lot && lineItem.lot.lotCode === lot.lotCode
                                && lineItem.lot.tradeItemId === lot.tradeItemId) {
                                lineItem.lot = lot;
                            }
                        });
                        return addedLineItems;
                    });

                    //Add p2p extra info
                    if (adjustmentType.state === ADJUSTMENT_TYPE.PROGRAM_TRANSFER.state) {
                        addedLineItems.forEach(function(lineItem) {
                            if (lineItem.extraData === null) {
                                lineItem.extraData = {};
                            }
                            lineItem.extraData.programFromId = program.id;
                            lineItem.extraData.programFromName = program.name;
                            lineItem.extraData.programToId = vm.programTo.id;
                            lineItem.extraData.programToName = vm.programTo.name;
                            lineItem.extraData.p2p = true;
                        });
                    }

                    var eventIssueId = vm.newIssueId ? vm.newIssueId : vm.issueId;
                    var adjustments = [stockAdjustmentCreationService.submitAdjustments(
                        program.id, facility.id, addedLineItems, adjustmentType, eventIssueId
                    )];

                    if (adjustmentType.state === ADJUSTMENT_TYPE.PROGRAM_TRANSFER.state && vm.programTo) {
                        var creditReason = vm.reasons.find(function(reason) {
                            return reason.tags.includes('p2p') && reason.reasonType === 'CREDIT';
                        });
                        var creditAddedLineItems = angular.copy(addedLineItems);
                        creditAddedLineItems.forEach(function(item) {
                            item.reason = creditReason;
                        });
                        adjustments.push(stockAdjustmentCreationService.submitAdjustments(
                            vm.programTo.id, facility.id, creditAddedLineItems, adjustmentType, eventIssueId
                        ));
                    }
                    $q.all(adjustments)
                        .then(function(response) {
                            if (offlineService.isOffline()) {
                                notificationService.offline(vm.key('submittedOffline'));
                            } else {
                                notificationService.success(vm.key('submitted'));
                            }
                            if (adjustmentType.state === ADJUSTMENT_TYPE.ISSUE.state 
                                || adjustmentType.state === ADJUSTMENT_TYPE.RECEIVE.state) {
                                confirmService.confirm(getPrintText(),
                                'stockAdjustmentCreation.printModal.yes',
                                'stockAdjustmentCreation.printModal.no')
                                .then(function() {
                                    $window.open(accessTokenFactory.addAccessToken(getPrintUrl(response, adjustmentType.state)),
                                        '_blank');
                                })
                            }
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                facility: facility.id,
                                program: program.id,
                                active: STOCKCARD_STATUS.ACTIVE
                            });
                        }, function(errorResponse) {
                            loadingModalService.close();
                            alertService.error(errorResponse.data.message);
                        });
                })
                
                .catch(function(errorResponse) {
                    loadingModalService.close();
                    if (errorLots) {
                        alertService.error('stockPhysicalInventoryDraft.lotCodeMustBeUnique',
                            errorLots.join(', '));
                        vm.selectedOrderableGroup = undefined;
                        vm.selectedLot = undefined;
                        vm.lotChanged();
                        return $q.reject(errorResponse.data.message);
                    }
                    alertService.error(errorResponse.data.message);
                });
        }

        function confirmPrint() {
            console.log("starting print");

            loadingModalService.open();

            var addedLineItems = angular.copy(vm.addedLineItems);
            console.log(addedLineItems);

            generateKitConstituentLineItem(addedLineItems);
            var eventIssueId = vm.newIssueId ? vm.newIssueId : vm.issueId;
            var adjustments = stockAdjustmentCreationService.printAdjustments(
                program.id, facility.id, addedLineItems, adjustmentType, eventIssueId
            );

            $q.resolve(adjustments)
                .then(function(response) {
                    console.log("creating pdf blob");
                    var blob = new Blob([response], { type: 'application/pdf' });
                    console.log("pdf data created");
                    var url = URL.createObjectURL(blob);
                    $window.open(url,
                            '_blank');
                    console.log("pdf opened");
                    loadingModalService.close();
                }, function(errorResponse) {
                    loadingModalService.close();
                    alertService.error(errorResponse.data.message);
                });

            //  PREVIOUS METHOD

            // loadingModalService.open();

            // var addedLineItems = angular.copy(vm.addedLineItems);

            // generateKitConstituentLineItem(addedLineItems);

            // var lotPromises = [],
            //     errorLots = [];
            // var distinctLots = [];
            // var lotResource = new LotResource();
            // addedLineItems.forEach(function(lineItem) {
            //     console.log("adding lot")
            //     console.log(lineItem);
            //     if (lineItem.lot && lineItem.$isNewItem && _.isUndefined(lineItem.lot.id) &&
            //     !listContainsTheSameLot(distinctLots, lineItem.lot)) {
            //         console.log("condition true")
            //         distinctLots.push(lineItem.lot);
            //     }
            // });
            // console.log("added lots to lineitems")
            // distinctLots.forEach(function(lot) {
            //     console.log("distinct lot")
            //     lotPromises.push(lotResource.create(lot)
            //         .then(function(createResponse) {
            //             console.log(createResponse)
            //             vm.addedLineItems.forEach(function(item) {
            //                 if (item.lot.lotCode === lot.lotCode) {
            //                     item.$isNewItem = false;
            //                     addItemToOrderableGroups(item);
            //                 }
            //             });
            //             return createResponse;
            //         })
            //         .catch(function(response) {
            //             console.log(response);
            //             if (response.data.messageKey ===
            //                 'referenceData.error.lot.lotCode.mustBeUnique') {
            //                 errorLots.push(lot.lotCode);
            //             }
            //         }));
            // });

            // return $q.all(lotPromises)
            //     .then(function(responses) {
            //         console.log("lots done")
            //         console.log(lotPromises)
            //         if (errorLots !== undefined && errorLots.length > 0) {
            //             return $q.reject();
            //         }
            //         responses.forEach(function(lot) {
            //             addedLineItems.forEach(function(lineItem) {
            //                 if (lineItem.lot && lineItem.lot.lotCode === lot.lotCode
            //                     && lineItem.lot.tradeItemId === lot.tradeItemId) {
            //                     lineItem.lot = lot;
            //                 }
            //             });
            //             return addedLineItems;
            //         });


            //         var eventIssueId = vm.newIssueId ? vm.newIssueId : vm.issueId;
            //         var adjustments = stockAdjustmentCreationService.printAdjustments(
            //             program.id, facility.id, addedLineItems, adjustmentType, eventIssueId
            //         );

            //         $q.all(adjustments)
            //             .then(function(response) {
            //                 $window.open(response,
            //                         '_blank');
            //             }, function(errorResponse) {
            //                 loadingModalService.close();
            //                 alertService.error(errorResponse.data.message);
            //             });
            //     })
                
            //     .catch(function(errorResponse) {
            //         loadingModalService.close();
            //         if (errorLots) {
            //             alertService.error('stockPhysicalInventoryDraft.lotCodeMustBeUnique',
            //                 errorLots.join(', '));
            //             vm.selectedOrderableGroup = undefined;
            //             vm.selectedLot = undefined;
            //             vm.lotChanged();
            //             return $q.reject(errorResponse.data.message);
            //         }
            //         alertService.error(errorResponse.data.message);
            //     });
        }

        function addItemToOrderableGroups(item) {
            vm.orderableGroups.forEach(function(array) {
                if (array[0].orderable.id === item.orderable.id) {
                    array.push(angular.copy(item));
                }
            });
        }

        function listContainsTheSameLot(list, lot) {
            var itemExistsOnList = false;
            list.forEach(function(item) {
                if (item.lotCode === lot.lotCode &&
                    item.tradeItemId === lot.tradeItemId) {
                    itemExistsOnList = true;
                }
            });
            return itemExistsOnList;
        }

        function generateKitConstituentLineItem(addedLineItems) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                return;
            }

            //CREDIT reason ID
            var creditReason = {
                id: UNPACK_REASONS.UNPACKED_FROM_KIT_REASON_ID
            };

            var constituentLineItems = [];

            addedLineItems.forEach(function(lineItem) {
                lineItem.orderable.children.forEach(function(constituent) {
                    constituent.reason = creditReason;
                    constituent.occurredDate = lineItem.occurredDate;
                    constituent.quantity = lineItem.quantity * constituent.quantity;
                    constituentLineItems.push(constituent);
                });
            });

            addedLineItems.push.apply(addedLineItems, constituentLineItems);
        }

        function onInit() {
            var copiedOrderableGroups = angular.copy(orderableGroups);
            vm.allItems = _.flatten(copiedOrderableGroups);

            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            initViewModel();
            initStateParams();

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue) {
                $scope.needToConfirm = newValue.length > 0;
                if (!vm.keyword) {
                    vm.addedLineItems = vm.displayItems;
                }
                $stateParams.addedLineItems = vm.addedLineItems;
                $stateParams.displayItems = vm.displayItems;
                $stateParams.keyword = vm.keyword;
                $state.go($state.current.name, $stateParams, {
                    reload: false,
                    notify: false
                });
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            $scope.$on('$stateChangeStart', function() {
                angular.element('.popover').popover('destroy');
            });
        }

        function initViewModel() {
            //Set the max-date of date picker to the end of the current day.
            vm.maxDate = new Date();
            vm.maxDate.setHours(23, 59, 59, 999);

            vm.program = program;
            vm.facility = facility;
            vm.reasons = reasons;
            vm.showReasonDropdown = (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state);
            vm.srcDstAssignments = srcDstAssignments;
            vm.addedLineItems = $stateParams.addedLineItems || [];
            $stateParams.displayItems = displayItems;
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;
            vm.programTo = $stateParams.programTo;

            vm.orderableGroups = orderableGroups;
            vm.hasLot = false;
            vm.orderableGroups.forEach(function(group) {
                vm.hasLot = vm.hasLot || orderableGroupService.lotsOf(group, hasPermissionToAddNewLot).length > 0;
            });
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(vm.orderableGroups);
            vm.hasPermissionToAddNewLot = hasPermissionToAddNewLot;
            vm.canAddNewLot = false;
            initiateNewLotObject();

            vm.issueId = null;
            vm.newIssueId = null;
            if (adjustmentType.state === ADJUSTMENT_TYPE.RECEIVE.state) {
                vm.isReceiveState = true;
                vm.issueIdSelectionChange = issueIdSelectionChange;
                fetchIssueIds();
            }

            if (adjustmentType.state === ADJUSTMENT_TYPE.ISSUE.state) {
                vm.newIssueId = 'A-' + Math.floor(Math.random() * (999999999 - 100000000) + 100000000);
            }
        }

        function initiateNewLotObject() {
            vm.newLot = {
                active: true
            };
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
            $stateParams.program = program;
            $stateParams.facility = facility;
            $stateParams.reasons = reasons;
            $stateParams.srcDstAssignments = srcDstAssignments;
            $stateParams.orderableGroups = orderableGroups;
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given stock adjustment.
         *
         * @return {String} the prepared URL
         */
         function getPrintUrl(id, type) {
            const url =  '/api/issueSummary'
                + '/print?stockEventId=' + id
                + '&program=' + program.id 
                + '&facility=' + facility.id
                + '&stockEventType=' + type
            return stockmanagementUrlFactory(url);
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name getPrintText
         *
         * @description
         * Returns the print modal text.
         *
         * @return {String} the prepared URL
         */
         function getPrintText() {
             if(adjustmentType.state === ADJUSTMENT_TYPE.RECEIVE.state){
                return 'stockAdjustmentCreation.printModal.label.receive';
            } else{
                return 'stockAdjustmentCreation.printModal.label.issue';
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name getPrintIssueDraftText
         *
         * @description
         * Returns the print issue draft modal text.
         *
         * @return {String} the prepared URL
         */
        function getPrintIssueDraftText() {
            return 'stockAdjustmentCreation.printModal.label.issueDraft';
       }

        

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name editLot
         *
         * @description
         * Pops up a modal for users to edit lot for selected line item.
         *
         * @param {Object} lineItem line items to be edited.
         */
        vm.editLot = function(lineItem) {
            var oldLotCode = lineItem.lot.lotCode;
            var oldLotExpirationDate = lineItem.lot.expirationDate;
            editLotModalService.show(lineItem, vm.allItems, vm.addedLineItems).then(function() {
                $stateParams.displayItems = vm.displayItems;
                if (oldLotCode === lineItem.lot.lotCode
                    && oldLotExpirationDate !== lineItem.lot.expirationDate) {
                    vm.addedLineItems.forEach(function(item) {
                        if (item.lot && item.lot.lotCode === oldLotCode &&
                            oldLotExpirationDate === item.lot.expirationDate) {
                            item.lot.expirationDate = lineItem.lot.expirationDate;
                        }
                    });
                }
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name canEditLot
         *
         * @description
         * Checks if user can edit lot.
         *
         * @param {Object} lineItem line item to edit
         */
        vm.canEditLot = function(lineItem) {
            return vm.hasPermissionToAddNewLot && lineItem.lot && lineItem.$isNewItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateExpirationDate
         *
         * @description
         * Validate if expirationDate is a future date.
         */
        function validateExpirationDate() {
            var currentDate = moment(new Date()).format('YYYY-MM-DD');

            if (vm.newLot.expirationDate && vm.newLot.expirationDate < currentDate) {
                vm.newLot.expirationDateInvalid = messageService.get('stockEditLotModal.expirationDateInvalid');
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name expirationDateChanged
         *
         * @description
         * Hides the error message if exists after changed expiration date.
         */
        function expirationDateChanged() {
            vm.newLot.expirationDateInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name newLotCodeChanged
         *
         * @description
         * Hides the error message if exists after changed new lot code.
         */
        function newLotCodeChanged() {
            vm.newLot.lotCodeInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateLotCode
         *
         * @description
         * Validate if on line item list exists the same orderable with the same lot code
         */
        function validateLotCode(listItems, selectedItem) {
            if (selectedItem && selectedItem.$isNewItem) {
                listItems.forEach(function(lineItem) {
                    if (lineItem.orderable && lineItem.lot && selectedItem.lot &&
                        lineItem.orderable.productCode === selectedItem.orderable.productCode &&
                        selectedItem.lot.lotCode === lineItem.lot.lotCode &&
                        ((!lineItem.$isNewItem) || (lineItem.$isNewItem &&
                        selectedItem.lot.expirationDate !== lineItem.lot.expirationDate))) {
                        vm.newLot.lotCodeInvalid = messageService.get('stockEditLotModal.lotCodeInvalid');
                    }
                });
            }
        }

        function issueIdSelectionChange() {
            stockAdjustmentCreationService.getFacilityIssueId(program.id,
                facility.id,
                vm.issueId).then(function(results) {
                vm.addedLineItems.length = 0;
                results.forEach(function(item) {
                    vm.orderableGroups.forEach(function(array) {
                        array.forEach(function(arrayItem) {
                            var isOrderable = arrayItem.orderable.id ===  item.orderableId;
                            var isLot = arrayItem.lot === item.lotId
                                        || (arrayItem.lot !==  null && arrayItem.lot.id === item.lotId);
                            if (isOrderable && isLot) {
                                var selectedItem  = orderableGroupService
                                    .findByLotInOrderableGroup(array, arrayItem.lot);
                                selectedItem.stockOnHand = array.stockOnHand;
                                var lineItem = _.extend({
                                    $errors: {},
                                    $previewSOH: selectedItem.stockOnHand,
                                    extraData: item.extraData
                                },
                                selectedItem, copyDefaultValue());
                                lineItem.quantity = item.quantity;
                                if (item.extraData !== null) {
                                    lineItem.vvmStatus = item.extraData.vvmStatus;
                                }
                                vm.srcDstAssignments.forEach(function(assignment) {
                                    if (assignment.node.referenceId === item.supplyingFacilityId) {
                                        lineItem.assignment = assignment;
                                    }
                                });
                                vm.reasons.forEach(function(reason) {
                                    if (reason.name === 'Transfer In') {
                                        lineItem.reason = reason;
                                    }
                                });
                                vm.addedLineItems.unshift(lineItem);
                            }
                        });
                    });
                });
            });
        }

        function fetchIssueIds() {
            $scope.$evalAsync(function() {
                stockAdjustmentCreationService.getFacilityIssueIdNumber(program.id,
                    facility.id).then(function(result) {
                    vm.issueIds = result;
                });
            });
        }

        onInit();
    }
})();
