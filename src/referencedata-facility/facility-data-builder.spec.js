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
        .module('referencedata-facility')
        .factory('FacilityDataBuilder', FacilityDataBuilder);

    FacilityDataBuilder.$inject = ['Facility', 'GeographicZoneDataBuilder', 'FacilityTypeDataBuilder',
        'FacilityOperatorDataBuilder'];

    function FacilityDataBuilder(Facility, GeographicZoneDataBuilder, FacilityTypeDataBuilder,
                                 FacilityOperatorDataBuilder) {

        FacilityDataBuilder.prototype.build = build;
        FacilityDataBuilder.prototype.buildJson = buildJson;
        FacilityDataBuilder.prototype.withCode = withCode;
        FacilityDataBuilder.prototype.withName = withName;
        FacilityDataBuilder.prototype.withId = withId;
        FacilityDataBuilder.prototype.withSupportedPrograms = withSupportedPrograms;
        FacilityDataBuilder.prototype.withFacilityType = withFacilityType;
        FacilityDataBuilder.prototype.withoutId = withoutId;
        FacilityDataBuilder.prototype.withoutExtraData = withoutExtraData;
        FacilityDataBuilder.prototype.managedExternally = managedExternally;
        FacilityDataBuilder.prototype.withExtraData = withExtraData;

        return FacilityDataBuilder;

        function FacilityDataBuilder() {
            FacilityDataBuilder.instanceNumber = (FacilityDataBuilder.instanceNumber || 0) + 1;

            this.id = 'facility-id-' + FacilityDataBuilder.instanceNumber;
            this.code = 'FA' + FacilityDataBuilder.instanceNumber;
            this.name = 'Assumane, Lichinga Cidade';
            this.description = 'description';
            this.geographicZone = new GeographicZoneDataBuilder().build();
            this.type = new FacilityTypeDataBuilder().build();
            this.operator = new FacilityOperatorDataBuilder().build();
            this.active = true;
            this.goLiveDate = '2010-09-01';
            this.goDownDate = '2020-09-01';
            this.comment = 'comment';
            this.enabled = true;
            this.openLmisAccessible = true;
            this.location = 'POINT(35.23962 -13.30037)';
            this.extraData = {};
            this.supportedPrograms = [];
        }

        function withCode(newCode) {
            this.code = newCode;
            return this;
        }

        function withName(newName) {
            this.name = newName;
            return this;
        }

        function withId(newId) {
            this.id = newId;
            return this;
        }

        function withoutId() {
            this.id = undefined;
            return this;
        }

        function withFacilityType(newType) {
            this.type = newType;
            return this;
        }

        function withSupportedPrograms(supportedPrograms) {
            this.supportedPrograms = supportedPrograms;
            return this;
        }

        function build() {
            return new Facility(this.buildJson());
        }

        function withExtraData(extraData) {
            this.extraData = extraData;
            return this;
        }

        function withoutExtraData() {
            return this.withExtraData();
        }

        function managedExternally() {
            this.extraData.isManagedExternally = true;
            return this;
        }

        function buildJson() {
            return {
                id: this.id,
                name: this.name,
                code: this.code,
                description: this.description,
                type: this.type,
                operator: this.operator,
                active: this.active,
                goLiveDate: this.goLiveDate,
                goDownDate: this.goDownDate,
                comment: this.comment,
                enabled: this.enabled,
                openlmisAccessible: this.openLmisAccessible,
                location: this.location,
                extraData: this.extraData,
                supportedPrograms: this.supportedPrograms
            };
        }
    }
})();
