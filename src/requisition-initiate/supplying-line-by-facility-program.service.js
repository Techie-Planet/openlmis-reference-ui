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
     * @ngdoc service
     * @name requisition-initiate.supplyLineByFaciltyProgram
     *
     * @description
     * Communicates with the /api/orders endpoint of the OpenLMIS server.
     */
    angular
        .module('requisition-initiate')
        .service('supplyLineByFaciltyProgramService', service);

    service.$inject = [
        '$q', 'facilityService', 'SupervisoryNodeResource', 'SupplyLineResource'
    ];

    function service($q, facilityService, SupervisoryNodeResource, SupplyLineResource) {

        var supervisoryNodeResource = new SupervisoryNodeResource();
        var supplyLineResource = new SupplyLineResource();
        this.getSupplyLineData = getSupplyLineData;

        function getSupplyLineData(selectedProgram, selectedRequestingFacility, setSupplyingFacilityOptions) {
            if (selectedProgram && selectedRequestingFacility) {
                supervisoryNodeResource.query({
                    programId: selectedProgram,
                    facilityId: selectedRequestingFacility
                })
                    .then(function(page) {
                        var nodes = page.content;

                        if (nodes.length > 0) {
                            $q.all(nodes.map(function(node) {
                                supplyLineResource.query({
                                    programId: selectedProgram,
                                    supervisoryNodeId: node.id
                                });
                            }))
                                .then(function(results) {
                                    var supplyLines = _.flatten(results.map(function(it) {
                                        return it.content;
                                    }));

                                    var facilityIds = _.uniq(supplyLines.map(function(it) {
                                        return it.supplyingFacility.id;
                                    }));

                                    var facSNMap = {};
                                    angular.forEach(supplyLines, function(it) {
                                        facSNMap[it.supplyingFacility.id] = it.supervisoryNode.id;
                                    });

                                    if (facilityIds.length > 0) {
                                        facilityService.query({
                                            id: facilityIds
                                        })
                                            .then(function(resp) {
                                                var facilities = resp.content;
                                                setSupplyingFacilityOptions(_.map(facilities, function(facility) {
                                                    return {
                                                        name: facility.name,
                                                        value: facility.id,
                                                        sNId: facSNMap[facility.id]
                                                    };
                                                }));
                                            });
                                    } else {
                                        setSupplyingFacilityOptions([]);
                                    }
                                });
                        } else {
                            setSupplyingFacilityOptions([]);
                        }
                    });
            } else {
                setSupplyingFacilityOptions([]);
            }
        }
    }
})();
