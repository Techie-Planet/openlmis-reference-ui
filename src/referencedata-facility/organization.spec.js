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

describe('Organization', function() {

    var OrganizationDataBuilder;

    beforeEach(function() {
        module('referencedata-organization');

        inject(function($injector) {
            OrganizationDataBuilder = $injector.get('OrganizationDataBuilder');
        });
    });

    describe('isExternallyManaged', function() {

        it('should return true for true', function() {
            this.organization = new OrganizationDataBuilder()
                .managedExternally()
                .build();

            expect(this.organization.isManagedExternally()).toBe(true);
        });

        it('should return true for \'true\'', function() {
            this.organization = new OrganizationDataBuilder()
                .withExtraData({
                    isManagedExternally: 'true'
                })
                .build();

            expect(this.organization.isManagedExternally()).toBe(true);
        });

        it('should return false for undefined extra data', function() {
            this.organization = new OrganizationDataBuilder()
                .withoutExtraData()
                .build();

            expect(this.organization.isManagedExternally()).toBe(false);
        });

        it('should return false for missing flag', function() {
            this.organization = new OrganizationDataBuilder().build();

            expect(this.organization.isManagedExternally()).toBe(false);
        });

        it('should return false for false', function() {
            this.organization = new OrganizationDataBuilder()
                .withExtraData({
                    isManagedExternally: false
                })
                .build();

            expect(this.organization.isManagedExternally()).toBe(false);
        });

        it('should return false for \'false\'', function() {
            this.organization = new OrganizationDataBuilder()
                .withExtraData({
                    isManagedExternally: 'false'
                })
                .build();

            expect(this.organization.isManagedExternally()).toBe(false);
        });

    });

});