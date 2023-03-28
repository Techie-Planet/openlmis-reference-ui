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
     * @name referencedata-organization.organizationFactory
     *
     * @description
     * Allows the user to retrieve organizations.
     */
    angular
        .module('referencedata-organization')
        .factory('organizationFactory', factory);

    factory.$inject = [
        'openlmisUrlFactory', '$q', '$filter', 'programService', 'authorizationService',
        'currentUserService', 'organizationService', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'
    ];

    function factory(openlmisUrlFactory, $q, $filter, programService, authorizationService,
                     currentUserService, organizationService, REQUISITION_RIGHTS, FULFILLMENT_RIGHTS) {

        return {
            searchAndOrderFacilities: searchAndOrderFacilities,
        };

    

        /**
             * @ngdoc method
             * @methodOf referencedata-organization.organizationFactory
             * @name searchAndOrderFacilities
             *
             * @description
             * Returns ordered list of facilities filtered with given value.
             *
             * @param  {Array}  facilities  the list of facilities to be filtered
             * @param  {String} filterValue the filter value for name field
             * @param  {String} orderBy     the filed name for ordering
             * @return {Array}              the set of facilities
             */
        function searchAndOrderFacilities(facilities, filterValue, orderBy) {
            var result;

            if (filterValue) {
                result = $filter('filter')(facilities, {
                    name: filterValue
                }, false);
            } else {
                result = facilities;
            }
            return $filter('orderBy')(result, orderBy);
        }

    }

})();
