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

describe('orderableGroupService', function() {

    var that = this;

    beforeEach(function() {

        that.stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        module('stock-orderable-group', function($provide) {
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return that.stockCardRepositoryMock;
                };
            });
        });

        inject(function($injector) {
            that.$q = $injector.get('$q');
            that.$rootScope = $injector.get('$rootScope');
            that.orderableGroupService = $injector.get('orderableGroupService');
            that.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            that.CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            that.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            that.LotDataBuilder = $injector.get('LotDataBuilder');
            that.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');
            that.OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        that.lot1 = {
            id: 'lot id 1',
            expirationDate: '2022-05-08'
        };
        that.lot2 = {
            id: 'lot id 2',
            expirationDate: '2019-01-20'
        };
        that.lot3 = {
            id: 'lot id 3',
            expirationDate: '2018-04-03'
        };

        that.item1 = {
            orderable: {
                id: 'a'
            },
            lot: that.lot1
        };
        that.item2 = {
            orderable: {
                id: 'a'
            }
        };
        that.item3 = {
            orderable: {
                id: 'b'
            }
        };
        that.item4 = {
            orderable: {
                id: 'a'
            },
            lot: that.lot2
        };
        that.item5 = {
            orderable: {
                id: 'a'
            },
            lot: that.lot3
        };

        that.items = [that.item1, that.item2, that.item3];

        that.kitConstituents = [
            new that.OrderableChildrenDataBuilder().withId('child_product_1_id')
                .withQuantity(30)
                .buildJson()
        ];
        that.orderable = new that.OrderableDataBuilder().withChildren(that.kitConstituents)
            .buildJson();
        that.kitOrderableGroup = new that.OrderableGroupDataBuilder().withOrderable(that.orderable)
            .build();
        that.orderableGroups = [
            new that.OrderableGroupDataBuilder().withOrderable(
                new that.OrderableDataBuilder().withChildren([])
                    .buildJson()
            )
                .build(),
            new that.OrderableGroupDataBuilder().withOrderable(that.orderable)
                .build()
        ];
    });

    describe('groupByOrderableId', function() {

        it('should group items by orderable id', function() {
            expect(that.orderableGroupService.groupByOrderableId(that.items)).toEqual([
                [that.item1, that.item2],
                [that.item3]
            ]);
        });
    });

    describe('findByLotInOrderableGroup', function() {

        it('should find item in group by lot', function() {
            expect(that.orderableGroupService.findByLotInOrderableGroup(that.items, that.lot1)).toBe(that.item1);
        });

        it('should find item in group by NULL lot', function() {
            expect(that.orderableGroupService.findByLotInOrderableGroup(that.items, null)).toBe(that.item2);
        });

        it('should find item with new lot', function() {
            var newLot = new that.LotDataBuilder().build(),
                newItem = that.item2;

            newItem.lot = newLot;
            newItem.stockOnHand = 0;

            expect(that.orderableGroupService.findByLotInOrderableGroup(that.items, newLot)).toBe(newItem);
        });
    });

    describe('lotsOf', function() {

        it('should find lots in orderable group', function() {
            var group = [that.item1, that.item2],
                lots = that.orderableGroupService.lotsOf(group);

            expect(lots[0]).toEqual({
                lotCode: 'orderableGroupService.noLotDefined'
            });

            expect(lots[1]).toEqual(that.lot1);
        });

        it('should add option to add missing lot if is allowed', function() {
            var group = [that.item1, that.item2],
                lots = that.orderableGroupService.lotsOf(group, true);

            expect(lots[0]).toEqual({
                lotCode: 'orderableGroupService.addMissingLot'
            });

            expect(lots[1]).toEqual({
                lotCode: 'orderableGroupService.noLotDefined'
            });

            expect(lots[2]).toEqual(that.lot1);
        });

        it('should not add option to add missing lot if is not allowed', function() {
            var group = [that.item1, that.item2],
                lots = that.orderableGroupService.lotsOf(group, false);

            expect(lots[0]).toEqual({
                lotCode: 'orderableGroupService.noLotDefined'
            });

            expect(lots[1]).toEqual(that.lot1);
        });

        it('should add option to add missing lot if all items has lots', function() {
            var group = [that.item1],
                lots = that.orderableGroupService.lotsOf(group, true);

            expect(lots[0]).toEqual({
                lotCode: 'orderableGroupService.addMissingLot'
            });

            expect(lots[1]).toEqual(that.lot1);
        });

        it('should sort lots by filed expirationDate', function() {
            var group = [that.item1, that.item4, that.item5],
                lots = that.orderableGroupService.lotsOf(group, true);

            expect(lots).toEqual([{
                lotCode: 'orderableGroupService.addMissingLot'
            }, that.lot3, that.lot2, that.lot1]);
        });
    });

    describe('getKitOnlyOrderablegroup', function() {

        it('should return kit only orderableGroups', function() {
            expect(that.orderableGroupService.getKitOnlyOrderablegroup(that.orderableGroups))
                .toEqual([that.orderableGroups.pop()]);
        });
    });

    describe('findAvailableProductsAndCreateOrderableGroups', function() {
        beforeEach(function() {
            prepareStockCardSummaries(
                new that.StockCardSummaryDataBuilder().build(),
                new that.StockCardSummaryDataBuilder().build()
            );

            that.lots = [
                new that.LotDataBuilder().withTradeItemId('trade-item-id-1')
                    .build(),
                new that.LotDataBuilder().withTradeItemId('trade-item-id-2')
                    .build()
            ];
        });

        it('should query stock card summaries', function() {
            that.orderableGroupService
                .findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', false);

            expect(that.stockCardRepositoryMock.query).toHaveBeenCalledWith({
                programId: 'program-id',
                facilityId: 'facility-id'
            });
        });

        it('should create orderable groups from canFulfillForMe', function() {
            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(false);

            expect(orderableGroups.length).toBe(2);
            orderableGroupElementEquals(orderableGroups[0][0], that.stockCardSummaries[0].canFulfillForMe[0]);
            orderableGroupElementEquals(orderableGroups[1][0], that.stockCardSummaries[1].canFulfillForMe[0]);
        });

        it('should create orderable groups from approved products', function() {
            var orderableOne = new that.OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-1'
                    })
                    .build(),
                orderableTwo = new that.OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-2'
                    })
                    .build();

            var stockCardSummaryOne = new that.StockCardSummaryDataBuilder()
                .withOrderable(orderableOne)
                .withCanFulfillForMe([
                    new that.CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableOne)
                        .buildJson(),
                    new that.CanFulfillForMeEntryDataBuilder()
                        .withLot(that.lots[0])
                        .withOrderable(orderableOne)
                        .buildJson()
                ])
                .build();
            var stockCardSummaryTwo = new that.StockCardSummaryDataBuilder()
                .withOrderable(orderableTwo)
                .withCanFulfillForMe([
                    new that.CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableTwo)
                        .buildJson(),
                    new that.CanFulfillForMeEntryDataBuilder()
                        .withLot(that.lots[1])
                        .withOrderable(orderableTwo)
                        .buildJson()
                ])
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(true);

            expect(orderableGroups.length).toBe(2);
            orderableGroupElementEqualsNoLot(orderableGroups[0][0], stockCardSummaryOne);
            orderableGroupElementEqualsNoLot(orderableGroups[1][0], stockCardSummaryTwo);
            orderableGroupElementEqualsWithLot(orderableGroups[0][1], stockCardSummaryOne, that.lots[0]);
            orderableGroupElementEqualsWithLot(orderableGroups[1][1], stockCardSummaryTwo, that.lots[1]);
        });

        function prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo) {
            that.stockCardSummaries = [
                stockCardSummaryOne,
                stockCardSummaryTwo
            ];
            that.stockCardRepositoryMock.query.andReturn(that.$q.when({
                content: that.stockCardSummaries
            }));
        }

        function findAvailableProductsAndCreateOrderableGroups(includeApprovedProducts) {
            var orderableGroups;
            that.orderableGroupService
                .findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', includeApprovedProducts)
                .then(function(response) {
                    orderableGroups = response;
                });
            that.$rootScope.$apply();
            return orderableGroups;
        }

        function orderableGroupElementEquals(orderableGroupElement, expected) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.lot).toEqual(expected.lot);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
        }

        function orderableGroupElementEqualsNoLot(orderableGroupElement, expected) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toBe(null);
        }

        function orderableGroupElementEqualsWithLot(orderableGroupElement, expected, lot) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toEqual(lot);
        }
    });
});