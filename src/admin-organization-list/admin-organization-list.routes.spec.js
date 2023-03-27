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

describe('openlmis.administration.facilities state', function() {

    'use strict';

    beforeEach(function() {
        module('admin-facility-list');

        inject(function($injector) {
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.geographicZoneService = $injector.get('geographicZoneService');
            this.facilityService = $injector.get('facilityService');
            this.$q = $injector.get('$q');
            this.$templateCache = $injector.get('$templateCache');
            this.GeographicZoneDataBuilder = $injector.get('GeographicZoneDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
        });

        this.geographicZones = [
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build()
        ];

        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        spyOn(this.geographicZoneService, 'getAll').andReturn(this.$q.when(
            new this.PageDataBuilder()
                .withContent(this.geographicZones)
                .build()
        ));

        spyOn(this.facilityService, 'search').andReturn(this.$q.when(
            new this.PageDataBuilder()
                .withContent(this.facilities)
                .build()
        ));

        this.$state.go('openlmis');
        this.$rootScope.$apply();

        this.goToUrl = function(url) {
            this.$location.url(url);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };
    });

    it('should be available under /administration/facilities URL', function() {
        expect(this.$state.current.name).not.toEqual('openlmis.administration.facilities');

        this.goToUrl('/administration/facilities');

        expect(this.$state.current.name).toEqual('openlmis.administration.facilities');
    });

    it('should resolve geographicZones', function() {
        this.geographicZoneService.getAll.andReturn(this.$q.when({
            content: this.geographicZones
        }));

        this.goToUrl('/administration/facilities');

        expect(this.$state.current.name).toEqual('openlmis.administration.facilities');
        expect(this.getResolvedValue('geographicZones')).toEqual(this.geographicZones);
    });

    it('should resolve facilities', function() {
        this.facilityService.search.andReturn(this.$q.when({
            content: this.facilities
        }));

        this.goToUrl('/administration/facilities?name=Facility&page=1&size=2&zoneId=zone-one&sort=name,asc');

        expect(this.$state.current.name).toEqual('openlmis.administration.facilities');
        expect(this.getResolvedValue('facilities')).toEqual(this.facilities);
        expect(this.facilityService.search).toHaveBeenCalledWith({
            page: '1',
            size: '2',
            sort: 'name,asc'
        }, {
            name: 'Facility',
            zoneId: 'zone-one'
        });
    });

    it('should use template', function() {
        spyOn(this.$templateCache, 'get').andCallThrough();

        this.goToUrl('/administration/facilities');

        expect(this.$templateCache.get).toHaveBeenCalledWith('admin-facility-list/facility-list.html');
    });

});
