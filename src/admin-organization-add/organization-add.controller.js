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
     * @name admin-organization-add.controller:OrganizationAddController
     *
     * @description
     * Provides methods for Add Organization modal. Allows returning to previous states and saving
     * organization.
     */
    angular
        .module('admin-organization-add')
        .controller('OrganizationAddController', OrganizationAddController);

    OrganizationAddController.$inject = [
        'organization', 'confirmService',
        'OrganizationRepository', 'stateTrackerService', '$state', 'loadingModalService',
        'notificationService', 'messageService'
    ];

    function OrganizationAddController(organization,
                                   confirmService, OrganizationRepository, stateTrackerService,
                                   $state, loadingModalService, notificationService,
                                   messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.save = save;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;

        /**
         * @ngdoc method
         * @methodOf admin-organization-add.controller:OrganizationAddController
         * @name $onInit
         *
         * @description
         * Initialization method of the OrganizationAddController.
         */
        function onInit() {
            vm.organization = angular.copy(organization);
        }

        /**
         * @ngdoc method
         * @methodOf admin-organization-add.controller:OrganizationAddController
         * @name save
         *
         * @description
         * Saves the organization and takes user back to the previous state.
         */
        function save() {
            return doSave().then(function(response) {
                $state.go('openlmis.administration.organizations.organization.programs', {
                    organization: response
                });
            });
        }

        function doSave() {
            loadingModalService.open();
            return new OrganizationRepository().create(vm.organization)
                .then(function(organization) {
                    notificationService.success('adminOrganizationAdd.organizationHasBeenSaved');
                    stateTrackerService.goToPreviousState();
                    return organization;
                })
                .catch(function() {
                    notificationService.error('adminOrganizationAdd.failedToSaveOrganization');
                    loadingModalService.close();
                });
        }
    }

})();
