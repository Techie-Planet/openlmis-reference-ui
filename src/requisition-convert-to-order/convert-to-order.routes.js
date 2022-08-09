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

    angular
        .module('requisition-convert-to-order')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.requisitions.convertToOrder', {
            showInNavigation: true,
            label: 'requisitionConvertToOrder.convertToOrder.label',
            url: '/convertToOrder?programId&facilityId&sort&page&size&storageKey',
            controller: 'ConvertToOrderController',
            controllerAs: 'vm',
            templateUrl: 'requisition-convert-to-order/convert-to-order.html',
            accessRights: [FULFILLMENT_RIGHTS.ORDERS_EDIT],
            resolve: {
                programs: function(programService) {
                    return programService.getAll();
                },
                facilities: function(facilityService) {
                    return facilityService.getAllMinimal();
                },
                requisitions: function(paginationService, requisitionService, $stateParams) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        return requisitionService.forConvert(stateParams);
                    });
                }
            }
        });
    }

})();
