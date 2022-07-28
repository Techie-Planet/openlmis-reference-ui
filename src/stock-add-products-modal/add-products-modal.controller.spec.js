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

describe('AddProductsModalController', function() {
    // COV-149: Added lot-management feature
    var that = this;

    beforeEach(function() {

        module('stock-add-products-modal');

        inject(function($injector) {
            that.$controller = $injector.get('$controller');
            that.$rootScope = $injector.get('$rootScope');
            that.$q = $injector.get('$q');
            that.LotDataBuilder = $injector.get('LotDataBuilder');
            that.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            that.orderableGroupService = $injector.get('orderableGroupService');
        });

        that.deferred = that.$q.defer();
        that.scope = that.$rootScope.$new();

        spyOn(that.scope, '$broadcast').andCallThrough();

        that.orderable = new that.OrderableDataBuilder()
            .withIdentifiers({
                tradeItem: 'trade-item-id-1'
            })
            .build();
        that.lot = new that.LotDataBuilder().build();
        that.lot2 = new that.LotDataBuilder()
            .withCode('1234')
            .build();

        that.item1 = {
            orderable: that.orderable,
            lot: that.lot
        };

        that.item2 = {
            isAdded: true,
            orderable: that.orderable,
            lot: that.lot2
        };

        spyOn(that.orderableGroupService, 'lotsOf').andReturn([that.lot]);

        that.scope.productForm = jasmine.createSpyObj('productForm', ['$setUntouched', '$setPristine']);

        that.selectedItems = [that.item1, that.item2];

        that.vm = that.$controller('AddProductsModalController', {
            availableItems: [that.item1],
            hasLot: true,
            modalDeferred: that.deferred,
            $scope: that.scope,
            hasPermissionToAddNewLot: true,
            selectedItems: that.selectedItems
        });
        that.vm.$onInit();
    });

    describe('addOneProduct', function() {

        it('should NOT add if select box is empty', function() {
            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([]);
        });

        it('should NOT add twice if selected item already added', function() {
            that.vm.selectedOrderableGroup = [that.item1];
            that.vm.selectedLot = that.item1.lot;

            that.vm.addedItems = [that.item1];
            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([that.item1]);
        });

        it('should NOT add if expirationDate is invalid', function() {
            that.item1.lot.expirationDate = '2019-09-09';
            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([]);
        });

        it('should NOT add if the same lot code has already been added', function() {
            that.vm.selectedOrderableGroup = [that.item1];
            that.vm.selectedLot = that.item1.lot;
            that.vm.selectedLot.lotCode = '1234';
            that.vm.addedItems = [];

            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([]);
        });

        it('should add when new lot code no added yet', function() {
            that.vm.selectedOrderableGroup = [that.item1];
            that.vm.selectedLot = that.item1.lot;
            that.vm.selectedLot.lotCode = '2233';
            that.vm.addedItems = [];
            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([that.item1]);
        });

        it('should add if selected item not added yet', function() {
            that.vm.selectedOrderableGroup = [that.item1];
            that.vm.selectedLot = that.item1.lot;
            that.vm.addedItems = [];

            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([that.item1]);
        });

        it('should add if missing lot provided', function() {
            that.vm.selectedOrderableGroup = [that.item1];
            that.vm.newLot.lotCode = 'NewLot001';

            that.vm.addedItems = [];

            var newLot = {
                lotCode: that.vm.newLot.lotCode,
                expirationDate: that.vm.newLot.expirationDate,
                tradeItemId: that.vm.selectedOrderableGroup[0].orderable.identifiers.tradeItem,
                active: true
            };

            that.vm.addOneProduct();

            expect(that.vm.addedItems).toEqual([{
                orderable: that.vm.selectedOrderableGroup[0].orderable,
                lot: newLot,
                id: undefined,
                displayLotMessage: 'NewLot001',
                stockOnHand: 0,
                $isNewItem: true
            }]);
        });
    });

    describe('removeAddedProduct', function() {

        it('should remove added product and reset its quantity value', function() {
            var item = {
                quantity: 123
            };
            that.vm.addedItems = [item];

            that.vm.removeAddedProduct(item);

            expect(item.quantity).not.toBeDefined();
            expect(that.vm.addedItems).toEqual([]);
        });
    });

    describe('modal close', function() {

        it('should reset all item quantities and error messages when cancel', function() {
            var item1 = {
                quantity: 123,
                quantityInvalid: 'blah'
            };
            var item2 = {
                quantity: 456
            };
            that.vm.addedItems = [item1, item2];

            that.deferred.reject();
            that.$rootScope.$apply();

            expect(item1.quantity).not.toBeDefined();
            expect(item1.quantityInvalid).not.toBeDefined();
            expect(item2.quantity).not.toBeDefined();
        });
    });

    describe('validate', function() {

        it('should assign error message when quantity missing', function() {
            var item1 = {
                quantity: undefined
            };

            that.vm.validate(item1);

            expect(item1.quantityInvalid).toBeDefined();
        });

        it('should remove error message when quantity filled in', function() {
            var item1 = {
                quantityInvalid: 'blah'
            };

            item1.quantity = 123;
            that.vm.validate(item1);

            expect(item1.quantityInvalid).not.toBeDefined();
        });
    });

    describe('confirm', function() {

        it('should broadcast form submit when confirming', function() {
            that.vm.confirm();

            expect(that.scope.$broadcast).toHaveBeenCalledWith('openlmis-form-submit');
        });

        it('should confirm add products if all items have quantities', function() {
            var item1 = {
                    quantity: 1
                },
                item2 = {
                    quantity: 2
                };
            that.vm.addedItems = [item1, item2];

            spyOn(that.deferred, 'resolve');

            that.vm.confirm();

            expect(that.deferred.resolve).toHaveBeenCalled();
        });

        it('should NOT confirm add products if some items have no quantity', function() {
            var item1 = {
                quantity: 1
            };
            var item2 = {
                quantity: undefined
            };
            that.vm.addedItems = [item1, item2];

            spyOn(that.deferred, 'resolve');

            that.vm.confirm();

            expect(that.deferred.resolve).not.toHaveBeenCalled();
        });
    });

    describe('orderableSelectionChanged', function() {

        it('should unselect lot', function() {
            that.vm.selectedLot = that.vm.availableItems[0].lot;

            that.vm.orderableSelectionChanged();

            expect(that.vm.selectedLot).toBe(null);
        });

        it('should clear new lot code', function() {
            that.vm.newLot.lotCode = 'NewLot001';
            that.vm.orderableSelectionChanged();

            expect(that.vm.newLot.lotCode).not.toBeDefined(null);
        });

        it('should clear new lot expiration date', function() {
            that.vm.newLot.expirationDate = '2019-08-06';
            that.vm.orderableSelectionChanged();

            expect(that.vm.newLot.expirationDate).not.toBeDefined();
        });

        it('should set canAddNewLot as false', function() {
            that.vm.canAddNewLot = true;
            that.vm.orderableSelectionChanged();

            expect(that.vm.canAddNewLot).toBeFalsy();
        });

        it('should clear form', function() {
            that.vm.selectedLot = that.vm.availableItems[0].lot;

            that.vm.orderableSelectionChanged();

            expect(that.scope.productForm.$setPristine).toHaveBeenCalled();
            expect(that.scope.productForm.$setUntouched).toHaveBeenCalled();
        });
    });

    describe('lotChanged', function() {

        it('should clear new lot code', function() {
            that.vm.newLot.lotCode = 'NewLot001';
            that.vm.lotChanged();

            expect(that.vm.newLot.lotCode).not.toBeDefined();
        });

        it('should clear new lot expiration date', function() {
            that.vm.newLot.expirationDate = '2019-08-06';
            that.vm.lotChanged();

            expect(that.vm.newLot.expirationDate).not.toBeDefined();
        });

        it('should set canAddNewLot as true', function() {
            that.vm.selectedLot = that.vm.availableItems[0].lot;
            that.vm.selectedLot.lotCode = 'orderableGroupService.addMissingLot';
            that.vm.lotChanged();

            expect(that.vm.canAddNewLot).toBeTruthy();
        });

        it('should set canAddNewLot as false', function() {
            that.vm.selectedLot = that.vm.availableItems[0].lot;
            that.vm.lotChanged();

            expect(that.vm.canAddNewLot).toBeFalsy();
        });
        // COV-149: ends here
    });
});