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
     * @ngdoc service
     * @name openlmis-facility-program-select.component:openlmisFacilityProgramSelect
     *
     * @description
     * Component responsible for selecting facility, facility type and program. This component will
     * look for supervised, facility and program parameters in the state parameters to set the
     * initial values, module parameter is for recognizing module where this component is used.

     * @example
     * ```
     * <openlmis-facility-program-select
     *      is-supervised="vm.supervisedFlag"
     *      program="vm.programObject"
     *      facility="vm.facilityObject"
     *      module="'openlmis-some-module-name'">
     * </openlmis-facility-program-select>
     * ```
     */
    angular
        .module('openlmis-facility-program-select')
        .component('openlmisFacilityProgramSelect', {
            bindings: {
                isSupervised: '=',
                program: '=',
                facility: '=',
                module: '=?'
            },
            controller: 'OpenlmisFacilityProgramSelectController',
            controllerAs: 'vm',
            templateUrl: 'openlmis-facility-program-select/openlmis-facility-program-select.html'
        });

})();
