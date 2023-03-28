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
     * @name admin-organization-list.controller:OrganizationListController
     *
     * @description
     * Controller for managing organization list screen.
     */
    angular
        .module('admin-organization-list')
        .controller('OrganizationListController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'organizations', 'geographicZones'
    ];

    function controller($state, $stateParams, organizations, geographicZones) {

        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.goToAddOrganizationPage = goToAddOrganizationPage;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-list.controller:OrganizationListController
         * @name organizations
         * @type {Array}
         *
         * @description
         * Contains filtered organizations.
         */
        vm.organizations = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-list.controller:OrganizationListController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-list.controller:OrganizationListController
         * @name facilityName
         * @type {String}
         *
         * @description
         * Contains name param for searching organizations.
         */
        vm.facilityName = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-list.controller:OrganizationListController
         * @name geographicZone
         * @type {String}
         *
         * @description
         * Contains geographic zone UUID param for searching organizations.
         */
        vm.geographicZone = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-organization-list.controller:OrganizationListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating OrganizationListController.
         */
        function onInit() {
            vm.organizations = organizations;
            vm.organizationName = $stateParams.name;
        }

        /**
         * @ngdoc method
         * @methodOf admin-organization-list.controller:OrganizationListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.name = vm.organizationName;

            $state.go('openlmis.administration.organizations', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-organization-list.controller:OrganizationListController
         * @name goToAddOrganizationPage
         *
         * @description
         * Takes the user to the add organization page.
         */
        function goToAddOrganizationPage() {
            $state.go('openlmis.administration.organizations.organization.add');
        }
    }

})();
