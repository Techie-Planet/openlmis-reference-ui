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
     * @name stock-constants.VVM_STATUS
     *
     * @description
     * This is constant for VVM statuses.
     */
    angular
        .module('stock-constants')
        .constant('VVM_STATUS', status());

    function status() {
        var VVM_STATUS = {
            STAGE_1: 'STAGE_1',
            STAGE_2: 'STAGE_2',
            STAGE_3: 'STAGE_3',
            STAGE_4: 'STAGE_4',
            $getDisplayName: getDisplayName
        };
        return VVM_STATUS;

        /**
         * @ngdoc method
         * @methodOf stock-constants.VVM_STATUS
         * @name getDisplayName
         *
         * @description
         * Returns display name key for given VVM status.
         *
         * @param  {String} status VVM status
         * @return {String}        VVM status display name message key
         */
        function getDisplayName(status) {
            var displayName;
            if (status === VVM_STATUS.STAGE_1) {
                displayName = 'stockConstants.stage1';
            } else if (status === VVM_STATUS.STAGE_2) {
                displayName = 'stockConstants.stage2';
            } else if (status === VVM_STATUS.STAGE_3) {
                displayName = 'stockConstants.stage3';
            } else if (status === VVM_STATUS.STAGE_4) {
                displayName = 'stockConstants.stage4';
            }

            return displayName;
        }
    }
})();