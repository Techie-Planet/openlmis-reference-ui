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
     * @name referencedata-facility.organizationService
     *
     * @description
     * Responsible for retrieving all facility information from server.
     */
    angular
        .module('referencedata-facility')
        .service('organizationService', service);

    service.$inject = [
        '$q', '$resource', 'referencedataUrlFactory', 'offlineService',
        'localStorageFactory', 'permissionService', 'OrganizationResource', 'localStorageService'
    ];

    function service($q, $resource, referencedataUrlFactory, offlineService,
                     localStorageFactory, permissionService, OrganizationResource, localStorageService) {

        var organizationsOffline = localStorageFactory('organizations'),
            organizationsPromise,
            resource = $resource(referencedataUrlFactory('/api/organizations/:id'), {}, {
                query: {
                    url: referencedataUrlFactory('/api/organizations/'),
                    method: 'GET'
                },
                search: {
                    url: referencedataUrlFactory('/api/organizations/search'),
                    method: 'POST'
                },
                update: {
                    method: 'PUT'
                }
            });

        this.get = get;
        this.query = query;
        this.search = search;
        this.clearOrganizationsCache = clearOrganizationsCache;

        /**
         * @ngdoc method
         * @methodOf referencedata-facility.organizationService
         * @name get
         *
         * @description
         * Retrieves organization by id. When user is offline it gets organization from offline storage.
         * If user is online it stores organization into offline storage.
         *
         * @param  {String}  organizationId Organization UUID
         * @return {Promise}            organization promise
         */
        function get(organizationId) {
            var cachedOrganization = organizationsOffline.getBy('id', organizationId);

            if (cachedOrganization) {
                organizationPromise = $q.resolve(angular.fromJson(cachedOrganization));
            } else {
                organizationPromise = new OrganizationResource().get(organizationId)
                    .then(function(facility) {
                        facilitiesOffline.put(facility);
                        return $q.resolve(facility);
                    });
            }

            return organizationPromise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-organization.organizationService
         * @name query
         *
         * @description
         * Retrieves all organizations that match given params or all organizations when no params provided.
         * When user is offline it gets organizations from offline storage.
         * If user is online it stores all organizations into offline storage.
         *
         * @param  {String}  queryParams      the pagination parameters
         * @param  {String}  queryParams      the search parameters
         * @return {Promise} Array of organizations
         */
        function query(paginationParams, queryParams) {
            if (offlineService.isOffline()) {
                return $q.resolve(organizationsOffline.getAll());
            }
            return resource.query(_.extend({}, queryParams, paginationParams)).$promise
                .then(function(page) {
                    page.content.forEach(function(organization) {
                        organizationsOffline.put(organization);
                    });
                    return page;
                });
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-organization.organizationService
         * @name search
         *
         * @description
         * Searches organizations using given parameters.
         *
         * @param  {Object}  paginationParams the pagination parameters
         * @param  {Object}  queryParams      the search parameters
         * @return {Promise}                  the requested page of filtered organizations.
         */
        function search(paginationParams, queryParams) {
            return resource.search(paginationParams, queryParams).$promise;
        }
        
        /**
         * @ngdoc method
         * @methodOf referencedata-organization.organizationService
         * @name clearOrganizationsCache
         *
         * @description
         * Deletes organizations stored in the browser cache.
         */
        function clearOrganizationsCache() {
            organizationsPromise = undefined;
            localStorageService.remove('organizations');
        }
    }
})();
