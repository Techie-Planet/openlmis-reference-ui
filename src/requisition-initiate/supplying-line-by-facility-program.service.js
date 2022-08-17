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
        .service('supplyLineByFaciltyProgram', service);

    service.$inject = [
        'facilityService', 'SupervisoryNodeResource', 'SupplyLineResource'
    ];

    function service(facilityService, SupervisoryNodeResource, SupplyLineResource) {

        var supervisoryNodeResource = new SupervisoryNodeResource();
        var supplyLineResource = new SupplyLineResource();

        this.get = get;
        this.create = create;
        this.update = update;
        this.send = send;
        this.getSupplyLineData = getSupplyLineData;

        function getSupplyLineData(selectedProgram, selectedRequestingFacility, setSupplyingFacilityOptions) {
            if (selectedProgram && selectedRequestingFacility) {
                supervisoryNodeResource.query({
                    programId: selectedProgram,
                    facilityId: selectedRequestingFacility
                })
                    .then((page) => {
                        const nodes = page.content;
    
                        if (nodes.length > 0) {
                            Promise.all(nodes.map((node) => (
                                supplyLineResource.query({
                                    programId: selectedProgram,
                                    supervisoryNodeId: node.id
                                })
                            )))
                                .then((results) => {
                                    const supplyLines = _.flatten(results.map((it) => (it.content)));
                                    const facilityIds = _.uniq(supplyLines.map((it) => (it.supplyingFacility.id)));
                                    const facSNMap = {}
                                    supplyLines.forEach(it => {
                                        facSNMap[it.supplyingFacility.id] = it.supervisoryNode.id;
                                    });
    
                                    if (facilityIds.length > 0) {
                                        facilityService.query({
                                            id: facilityIds
                                        })
                                            .then((resp) => {
                                                const facilities = resp.content;
                                                setSupplyingFacilityOptions(_.map(facilities, facility => ({ name: facility.name, value: facility.id, sNId: facSNMap[facility.id] })));
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
