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
        .module('requisition-initiate')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($stateProvider, REQUISITION_RIGHTS) {

        $stateProvider.state('openlmis.requisitions.initRnr', {
            url: '/initiate?supervised&program&facility&emergency',
            showInNavigation: true,
            priority: 11,
            label: 'requisitionInitiate.createAuthorize',
            controller: 'RequisitionInitiateController',
            controllerAs: 'vm',
            templateUrl: 'requisition-initiate/requisition-initiate.html',
            accessRights: [
                REQUISITION_RIGHTS.REQUISITION_CREATE,
                REQUISITION_RIGHTS.REQUISITION_DELETE,
                REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
            ],
            resolve: {
                periods: function(periodFactory, $stateParams) {
                    if ($stateParams.program && $stateParams.facility) {
                        return periodFactory.get(
                            $stateParams.program,
                            $stateParams.facility,
                            $stateParams.emergency === 'true'
                        );
                    }
                    return undefined;
                },
                canInitiateRnr: function(requisitionInitiateFactory, $stateParams) {
                    if ($stateParams.program && $stateParams.facility) {
                        return requisitionInitiateFactory.canInitiate(
                            $stateParams.program, $stateParams.facility
                        );
                    }
                    return false;
                },
                supplyingFacilities: function(supplyLineByFaciltyProgramService, $stateParams) {
                    if ($stateParams.program && $stateParams.facility && supplyLineByFaciltyProgramService) {
                        return supplyLineByFaciltyProgramService.getSupplyLineData(
                            $stateParams.program,
                            $stateParams.facility
                        );
                    }
                    return undefined;
                }
            }
        });
    }

})();
