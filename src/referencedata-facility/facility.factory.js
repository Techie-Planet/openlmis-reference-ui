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
     * @name referencedata-facility.facilityFactory
     *
     * @description
     * Allows the user to retrieve facilities.
     */
    angular
        .module('referencedata-facility')
        .factory('facilityFactory', factory);

    factory.$inject = [
        'openlmisUrlFactory', '$q', '$filter', 'programService', 'authorizationService',
        'currentUserService', 'facilityService', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'
    ];

    function factory(openlmisUrlFactory, $q, $filter, programService, authorizationService,
                     currentUserService, facilityService, REQUISITION_RIGHTS, FULFILLMENT_RIGHTS) {

        return {
            getSupplyingFacilities: getSupplyingFacilities,
            getRequestingFacilities: getRequestingFacilities,
            getUserHomeFacility: getUserHomeFacility,
            getAllUserFacilities: getAllUserFacilities,
            searchAndOrderFacilities: searchAndOrderFacilities,
            getAllMinimalFacilities: getAllMinimalFacilities
        };

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
             * @name getSupplyingFacilities
             *
             * @description
             * Returns a set of all supplying facilities available to the user.
             *
             * @param  {String} userId the ID of the user
             * @return {Array}         the set of all supplying facilities
             */
        function getSupplyingFacilities(userId) {
            var deferred = $q.defer();

            $q.all([
                getAllUserFacilitiesForRightWithProgram(userId, FULFILLMENT_RIGHTS.ORDERS_VIEW),
                getAllUserFacilitiesForRightWithProgram(userId, FULFILLMENT_RIGHTS.PODS_MANAGE)
            ])
                .then(function(results) {
                    var combinedResults = $filter('unique')(results[0].concat(results[1]), 'id');
                    deferred.resolve(combinedResults);
                })
                .catch(function() {
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
             * @name getRequestingFacilities
             *
             * @description
             * Returns a set of all requesting facilities available to the user.
             *
             * @param  {String} userId the ID of the user to fetch the facilities for
             * @return {Array}         the set of all requesting facilities
             */
        function getRequestingFacilities(userId) {
            var deferred = $q.defer();

            $q.all([
                facilityService.getUserFacilitiesForRight(userId, REQUISITION_RIGHTS.REQUISITION_CREATE),
                facilityService.getUserFacilitiesForRight(userId, REQUISITION_RIGHTS.REQUISITION_AUTHORIZE)
            ]).then(function(results) {
                deferred.resolve($filter('unique')(results[0].concat(results[1]), 'id'));
            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        }

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
             * @name getUserHomeFacility
             *
             * @description
             * Returns home facility for the user.
             *
             * @param  {String} userId the ID of the user to fetch the home facility for
             * @return {Object}        home facility
             */
        function getUserHomeFacility() {
            var deferred = $q.defer();

            currentUserService.getUserInfo().then(function(response) {
                if (response.homeFacilityId) {
                    return facilityService.get(response.homeFacilityId);
                }
                return $q.reject();

            })
                .then(function(homeFacility) {
                    deferred.resolve(homeFacility);
                })
                .catch(function() {
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
             * @name getAllUserFacilities
             *
             * @description
             * Returns all facilities associated with the requisition view right,
             * and the supported programs for those facilities.
             *
             * @param  {String} userId the ID of the user to get supervised facilities
             * @return {Array}         the set of all facilities for the user
             */
        function getAllUserFacilities(userId) {
            return getAllUserFacilitiesForRightWithProgram(userId, REQUISITION_RIGHTS.REQUISITION_VIEW);
        }

        function getAllUserFacilitiesForRightWithProgram(userId, right) {
            return $q.all({
                facilities: facilityService.getUserFacilitiesForRight(userId, right),
                programs: programService.getUserPrograms(userId)
            })
                .then(function(results) {
                    var facilities = results.facilities,
                        programs = results.programs,
                        programsHash = {};

                    programs.forEach(function(program) {
                        programsHash[program.id] = program;
                    });

                    facilities.forEach(function(facility) {
                        facility.supportedPrograms.forEach(function(program) {
                            if (programsHash[program.id]) {
                                _.extend(program, programsHash[program.id]);
                            }
                        });
                    });

                    return facilities;
                });
        }

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
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

        /**
             * @ngdoc method
             * @methodOf referencedata-facility.facilityFactory
             * @name getAllMinimalFacilities
             *
             * @description
             * Returns minimal representation of all facilities in the system.
             *
             * @return {Promise}         the page of facilities
             */
        function getAllMinimalFacilities() {
            return facilityService.getAllMinimal();
        }
    }

})();
