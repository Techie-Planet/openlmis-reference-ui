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
     * @name admin-organization-view.controller:OrganizationViewController
     *
     * @description
     * Controller for managing organization view screen.
     */
    angular
        .module('admin-organization-view')
        .controller('OrganizationViewController', controller);

    controller.$inject = [
        '$q', '$state', 'organization', 'OrganizationRepository', 'loadingModalService', 'notificationService'
    ];

    function controller($q, $state, organization,  OrganizationRepository, loadingModalService, 
        notificationService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.goToOrganizationList = goToOrganizationList;
        vm.saveOrganizationDetails = saveOrganizationDetails;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-view.controller:OrganizationViewController
         * @name organization
         * @type {Object}
         *
         * @description
         * Contains organization object.
         */
        vm.organization = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-organization-view.controller:OrganizationViewController
         * @name selectedTab
         * @type {String}
         *
         * @description
         * Contains currently selected tab.
         */
        vm.selectedTab = undefined;

        
        /**
         * @ngdoc method
         * @propertyOf admin-organization-view.controller:OrganizationViewController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating OrganizationViewController.
         */
        function onInit() {
            vm.originalOrganizationName = organization.name;
            vm.organization = angular.copy(organization);

        }

        /**
         * @ngdoc method
         * @methodOf admin-organization-view.controller:OrganizationViewController
         * @name goToOrganizationList
         *
         * @description
         * Redirects to organization list screen.
         */
        function goToOrganizationList() {
            $state.go('openlmis.administration.organizations', {}, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-organization-view.controller:OrganizationViewController
         * @name saveOrganizationDetails
         *
         * @description
         * Saves organiztion details and redirects to organiztion list screen.
         */
        function saveOrganizationDetails() {
            doSave(vm.organization,
                'adminOrganizationView.saveOrganization.success',
                'adminOrganizationView.saveOrganization.fail');
        }

        function doSave(organization, successMessage, errorMessage) {
            loadingModalService.open();
            return new OrganizationRepository().update(organization)
                .then(function(organization) {
                    notificationService.success(successMessage);
                    goToOrganizationList();
                    return $q.resolve(organization);
                })
                .catch(function() {
                    notificationService.error(errorMessage);
                    loadingModalService.close();
                    return $q.reject();
                });
        }
    }
})();
