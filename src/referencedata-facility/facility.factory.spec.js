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

describe('facilityFactory', function() {

    beforeEach(function() {
        module('referencedata-facility');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.facilityFactory = $injector.get('facilityFactory');
            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            this.facilityService = $injector.get('facilityService');
            this.programService = $injector.get('programService');
            this.authorizationService = $injector.get('authorizationService');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.currentUserService = $injector.get('currentUserService');
        });

        this.facility1 = new this.FacilityDataBuilder()
            .withId('1')
            .withName('facility1')
            .build();
        this.facility2 = new this.FacilityDataBuilder()
            .withId('2')
            .withName('facility2')
            .build();

        spyOn(this.facilityService, 'getUserFacilitiesForRight');
        spyOn(this.facilityService, 'get');
        spyOn(this.programService, 'getUserPrograms');
        spyOn(this.authorizationService, 'getRightByName');
    });

    describe('getSupplyingFacilities', function() {

        beforeEach(inject(function() {
            this.userId = 'user-id';

            this.ordersViewFacilities = [
                new this.FacilityDataBuilder().build(),
                new this.FacilityDataBuilder().build()
            ];

            this.podsManageFacilities = [
                this.ordersViewFacilities[1],
                new this.FacilityDataBuilder().build()
            ];

            var context = this;
            this.facilityService.getUserFacilitiesForRight.andCallFake(function(userId, right) {
                if (right === context.FULFILLMENT_RIGHTS.ORDERS_VIEW) {
                    return context.$q.when(context.ordersViewFacilities);
                }
                if (right === context.FULFILLMENT_RIGHTS.PODS_MANAGE) {
                    return context.$q.when(context.podsManageFacilities);
                }
            });

            this.programService.getUserPrograms.andReturn(this.$q.when([]));
        }));

        it('should fetch facilities for ORDERS_VIEW right', function() {
            this.facilityFactory.getSupplyingFacilities(this.userId);

            expect(this.facilityService.getUserFacilitiesForRight)
                .toHaveBeenCalledWith(this.userId, this.FULFILLMENT_RIGHTS.ORDERS_VIEW);
        });

        it('should fetch facilities for PODS_MANAGE right', function() {
            this.facilityFactory.getSupplyingFacilities(this.userId);

            expect(this.facilityService.getUserFacilitiesForRight)
                .toHaveBeenCalledWith(this.userId, this.FULFILLMENT_RIGHTS.PODS_MANAGE);
        });

        it('should fetch programs for current user', function() {
            this.facilityFactory.getSupplyingFacilities(this.userId);

            expect(this.programService.getUserPrograms).toHaveBeenCalledWith(this.userId);
        });

        it('should resolve to set of facilities', function() {
            var result;

            this.facilityFactory.getSupplyingFacilities(this.userId).then(function(facilities) {
                result = facilities;
            });
            this.$rootScope.$apply();

            expect(result.length).toBe(3);
            expect(result[0]).toEqual(this.ordersViewFacilities[0]);
            expect(result[1]).toEqual(this.podsManageFacilities[0]);
            expect(result[2]).toEqual(this.podsManageFacilities[1]);
        });

    });

    describe('getUserHomeFacility', function() {

        beforeEach(function() {
            this.homeFacility = new this.FacilityDataBuilder().build();
            this.user = new this.UserDataBuilder()
                .withHomeFacilityId(this.homeFacility.id)
                .buildReferenceDataUserJson();

            spyOn(this.currentUserService, 'getUserInfo').andReturn(this.$q.resolve(this.user));
        });

        it('should fetch home facility for the current user', function() {
            this.facilityService.get.andReturn(this.$q.resolve(this.homeFacility));

            var result;
            this.facilityFactory.getUserHomeFacility().then(function(homeFacility) {
                result = homeFacility;
            });
            this.$rootScope.$apply();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(this.facilityService.get).toHaveBeenCalledWith(this.homeFacility.id);
            expect(result).toEqual(this.homeFacility);
        });
    });

    describe('getAllMinimalFacilities', function() {

        beforeEach(function() {
            this.minimalFacilities = [
                new this.MinimalFacilityDataBuilder().build(),
                new this.MinimalFacilityDataBuilder().build()
            ];
            spyOn(this.facilityService, 'getAllMinimal').andReturn(this.$q.when(this.minimalFacilities));
        });

        it('should fetch active minimal facilities', function() {
            var result;
            this.facilityFactory.getAllMinimalFacilities()
                .then(function(minimalFacilities) {
                    result = minimalFacilities;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.minimalFacilities);
        });
    });

    describe('getRequestingFacilities', function() {

        beforeEach(function() {
            this.userId = 'user-id';

            this.requisitionCreateFacilities = [
                new this.FacilityDataBuilder().build(),
                new this.FacilityDataBuilder().build()
            ];

            this.requisitionAuthorizeFacilities = [
                this.requisitionCreateFacilities[1],
                new this.FacilityDataBuilder().build()
            ];

            var context = this;
            this.facilityService.getUserFacilitiesForRight.andCallFake(function(userId, rightName) {
                if (rightName === context.REQUISITION_RIGHTS.REQUISITION_CREATE) {
                    return context.$q.when(context.requisitionCreateFacilities);
                }
                if (rightName === context.REQUISITION_RIGHTS.REQUISITION_AUTHORIZE) {
                    return context.$q.when(context.requisitionAuthorizeFacilities);
                }
            });
        });

        it('should fetch facilities for REQUISITION_CREATE right', function() {
            this.facilityFactory.getRequestingFacilities(this.userId);

            expect(this.facilityService.getUserFacilitiesForRight)
                .toHaveBeenCalledWith(this.userId, this.REQUISITION_RIGHTS.REQUISITION_CREATE);
        });

        it('should fetch facilities for REQUISITION_AUTHORIZE right', function() {
            this.facilityFactory.getRequestingFacilities(this.userId);

            expect(this.facilityService.getUserFacilitiesForRight)
                .toHaveBeenCalledWith(this.userId, this.REQUISITION_RIGHTS.REQUISITION_AUTHORIZE);
        });

        it('should resolve to set of facilities', function() {
            var result;

            this.facilityFactory.getRequestingFacilities(this.userId).then(function(facilities) {
                result = facilities;
            });
            this.$rootScope.$apply();

            expect(result).toEqual([
                this.requisitionCreateFacilities[0],
                this.requisitionAuthorizeFacilities[0],
                this.requisitionAuthorizeFacilities[1]
            ]);
        });

    });

    describe('getAllUserFacilities', function() {

        beforeEach(inject(function() {
            this.userId = 'user-id';

            this.program = new this.ProgramDataBuilder().build();

            this.facilities = [
                new this.FacilityDataBuilder()
                    .withSupportedPrograms([this.program])
                    .build(),
                new this.FacilityDataBuilder().build()
            ];

            this.facilityService.getUserFacilitiesForRight.andReturn(this.$q.resolve(this.facilities));

            this.programService.getUserPrograms.andReturn(this.$q.resolve([this.program]));

        }));

        it('should get list of facilities for REQUISITION_VIEW right', function() {
            this.facilityFactory.getAllUserFacilities(this.userId);

            expect(this.facilityService.getUserFacilitiesForRight)
                .toHaveBeenCalledWith(this.userId, this.REQUISITION_RIGHTS.REQUISITION_VIEW);
        });

        it('should resolve to set of facilities', function() {
            var returnedFacilities;

            this.facilityFactory.getAllUserFacilities(this.userId)
                .then(function(facilities) {
                    returnedFacilities = facilities;
                });

            this.$rootScope.$apply();

            expect(returnedFacilities).toEqual(this.facilities);
        });

        it('will resolve facilities with full supported programs', function() {
            var returnedFacilities;

            this.facilityFactory.getAllUserFacilities(this.userId)
                .then(function(facilities) {
                    returnedFacilities = facilities;
                });

            this.$rootScope.$apply();

            expect(returnedFacilities[0].supportedPrograms).toEqual([this.program]);
        });
    });

    describe('searchAndOrderFacilities', function() {

        it('should order by name', function() {
            var result = this.facilityFactory.searchAndOrderFacilities([this.facility2, this.facility1], null, 'name');

            expect(result).toEqual([
                this.facility1,
                this.facility2
            ]);
        });

        it('should filter name by given value', function() {
            var result = this.facilityFactory.searchAndOrderFacilities([this.facility2, this.facility1], '1', 'name');

            expect(result).toEqual([
                this.facility1
            ]);
        });
    });

});
