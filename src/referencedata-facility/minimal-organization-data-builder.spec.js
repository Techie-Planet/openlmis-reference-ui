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
        .module('referencedata-organization')
        .factory('MinimalOrganizationDataBuilder', MinimalOrganizationDataBuilder);

    MinimalOrganizationDataBuilder.$inject = ['Organization'];

    function MinimalOrganizationDataBuilder(Organization) {

        MinimalOrganizationDataBuilder.prototype.build = build;
        MinimalOrganizationDataBuilder.prototype.buildJson = buildJson;
        MinimalOrganizationDataBuilder.prototype.withName = withName;
        MinimalOrganizationDataBuilder.prototype.withId = withId;

        return MinimalOrganizationDataBuilder;

        function MinimalOrganizationDataBuilder() {
            MinimalOrganizationDataBuilder.instanceNumber = (MinimalOrganizationDataBuilder.instanceNumber || 0) + 1;

            this.id = 'organization-id-' + MinimalOrganizationDataBuilder.instanceNumber;
            this.name = 'organization ' + MinimalOrganizationDataBuilder.instanceNumber;
        }

        function withName(newName) {
            this.name = newName;
            return this;
        }

        function withId(newId) {
            this.id = newId;
            return this;
        }

        function build() {
            return new Organization(this.buildJson());
        }

        function buildJson() {
            return {
                id: this.id,
                name: this.name
            };
        }
    }
})();
