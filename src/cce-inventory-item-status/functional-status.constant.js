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
     * @ngdoc object
     * @name cce-inventory-item-status.FUNCTIONAL_STATUS
     *
     * @description
     * Contains all possible functional statuses.
     */
    angular
        .module('cce-inventory-item-status')
        .constant('FUNCTIONAL_STATUS', statuses());

    function statuses() {
        var FUNCTIONAL_STATUS = {
                FUNCTIONING: 'FUNCTIONING',
                AWAITING_REPAIR: 'AWAITING_REPAIR',
                UNSERVICEABLE: 'UNSERVICEABLE',
                INSTALLED: 'INSTALLED',
                AWAITING_INSTALLATION: 'AWAITING_INSTALLATION',
                NON_FUNCTIONAL: 'NON_FUNCTIONAL',
                OBSOLETE: 'OBSOLETE',
                REPLACE: 'REPLACE',
                getLabel: getLabel,
                getStatuses: getStatuses,
                getClass: getClass
            },
            labels = {
                FUNCTIONING: 'cceInventoryItemStatus.functioning',
                AWAITING_REPAIR: 'cceInventoryItemStatus.awaitingRepair',
                UNSERVICEABLE: 'cceInventoryItemStatus.unserviceable',
                INSTALLED: 'cceInventoryItemStatus.installed',
                AWAITING_INSTALLATION: 'cceInventoryItemStatus.awaitingInstallation',
                NON_FUNCTIONAL: 'cceInventoryItemStatus.nonFunctional',
                OBSOLETE: 'cceInventoryItemStatus.obsolete',
                REPLACE: 'cceInventoryItemStatus.replace'
            };

        return FUNCTIONAL_STATUS;

        /**
         * @ngdoc method
         * @methodOf cce-inventory-item-status.FUNCTIONAL_STATUS
         * @name getLabel
         *
         * @description
         * Returns the label for the given status.
         *
         * @param   {String}    status  the status to get the label for
         * @return  {String}            the label for the given status
         */
        function getLabel(status) {
            var label = labels[status];

            if (!label) {
                throw 'Invalid status';
            }

            return label;
        }

        /**
         * @ngdoc method
         * @methodOf cce-inventory-item-status.FUNCTIONAL_STATUS
         * @name getStatuses
         *
         * @description
         * Returns all the functional statuses as a list.
         *
         * @return  {Array} the list of all statuses
         */
        function getStatuses() {
            return [
                FUNCTIONAL_STATUS.FUNCTIONING,
                FUNCTIONAL_STATUS.AWAITING_REPAIR,
                FUNCTIONAL_STATUS.UNSERVICEABLE,
                FUNCTIONAL_STATUS.INSTALLED,
                FUNCTIONAL_STATUS.AWAITING_INSTALLATION,
                FUNCTIONAL_STATUS.NON_FUNCTIONAL,
                FUNCTIONAL_STATUS.OBSOLETE,
                FUNCTIONAL_STATUS.REPLACE 
            ];
        }

        /**
         * @ngdoc method
         * @methodOf cce-inventory-item-status.FUNCTIONAL_STATUS
         * @name getClass
         *
         * @description
         * Returns a CSS class name defining the state of the status.
         *
         * @param   {String}    status  the status to get the class for
         * @return  {String}            the CSS class defining the state of the status
         */
        function getClass(status) {
            var statusClass;

            switch (status) {
            case FUNCTIONAL_STATUS.FUNCTIONING:
                statusClass = 'is-functioning';
                break;
            case FUNCTIONAL_STATUS.AWAITING_REPAIR:
                statusClass = 'is-awaiting-repair';
                break;
            case FUNCTIONAL_STATUS.UNSERVICEABLE:
                statusClass = 'is-unserviceable';
                break;
            case FUNCTIONAL_STATUS.INSTALLED:
                statusClass = 'is-installed';
                break;
            case FUNCTIONAL_STATUS.AWAITING_INSTALLATION:
                statusClass = 'is-awaiting-installation';
                break;
            case FUNCTIONAL_STATUS.NON_FUNCTIONAL:
                statusClass = 'is-non-functional';
                break;
            case FUNCTIONAL_STATUS.OBSOLETE:
                statusClass = 'is-obsolete';
                break;
            case FUNCTIONAL_STATUS.REPLACE:
                statusClass = 'is-replace';
                break;
            default:
                throw 'Invalid status';
            }

            return statusClass;
        }
    }

})();
