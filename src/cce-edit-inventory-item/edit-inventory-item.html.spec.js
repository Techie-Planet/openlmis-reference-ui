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

describe('edit-inventory-item.html template', function() {

    var vm, $compile, $rootScope, $templateRequest, $timeout, template, messages, messageService, inventoryItem,
        FacilityProgramInventoryItemDataBuilder, $scope;

    beforeEach(prepareSuite);

    describe('modal title', function() {

        it('should be "Edit equipment details" if inventory item has ID', function() {
            vm.inventoryItem = new FacilityProgramInventoryItemDataBuilder().build();
            $rootScope.$apply();

            expect(
                template.find('.modal-title').html()
                    .indexOf('Edit equipment details')
            ).toBeGreaterThan(-1);
        });

        it('should be "Add New Cold Chain Equipment" if inventory item has no ID', function() {
            vm.inventoryItem = new FacilityProgramInventoryItemDataBuilder().withoutId()
                .build();
            $rootScope.$apply();

            expect(
                template.find('.modal-title').html()
                    .indexOf('Add New Cold Chain Equipment')
            ).toBeGreaterThan(-1);
        });

    });

    describe('Serial number input', function() {

        it('should be required', function() {
            expect(
                template.find('#serial-number').prop('required')
            ).toBe(true);
        });

    });

    describe('Reference Name input', function() {

        it('should be required', function() {
            expect(
                template.find('#reference-name').prop('required')
            ).toBe(true);
        });

    });

    describe('Year of Installation/Commission input', function() {

        var input;

        beforeEach(function() {
            input = template.find('#year-of-installation');
        });

        it('should be required', function() {
            expect(input.prop('required')).toBe(true);
        });

        it('should allow only year to be entered', function() {
            vm.inventoryItem = new FacilityProgramInventoryItemDataBuilder().withYearOfInstallation(42443)
                .build();

            $rootScope.$apply();

            expect($scope.editInventoryItemForm.yearOfInstallation.$valid).toBe(false);
        });

        it('should be valid for four-digit year', function() {
            $rootScope.$apply();

            expect($scope.editInventoryItemForm.yearOfInstallation.$valid).toBe(true);
        });

    });

    describe('Year of Warranty Expiry', function() {

        it('should allow only year to be entered', function() {
            vm.inventoryItem = new FacilityProgramInventoryItemDataBuilder().withYearOfWarrantyExpiry(42443)
                .build();

            $rootScope.$apply();

            expect($scope.editInventoryItemForm.yearOfWarrantyExpiry.$valid).toBe(false);
        });

        it('should be valid for four-digit year', function() {
            $rootScope.$apply();

            expect($scope.editInventoryItemForm.yearOfWarrantyExpiry.$valid).toBe(true);

        });

    });

    describe('Utilization radio buttons', function() {

        it('should be required', function() {
            vm.utilizationStatuses = [
                'status one',
                'status two'
            ];

            $rootScope.$apply();

            var buttons = template.find('#utilization').find('input');

            expect(angular.element(buttons[0]).prop('required')).toBe(true);
            expect(angular.element(buttons[1]).prop('required')).toBe(true);
        });

    });

    describe('edit-inventory-item-form submit', function() {

        var form;

        beforeEach(function() {
            form = template.find('#edit-inventory-item-form');
        });

        it('should call vm.add', function() {
            vm.inventoryItem = new FacilityProgramInventoryItemDataBuilder()
                .withId('9c704186-6191-4434-b39f-71be7ca87304')
                .build();

            $rootScope.$apply();
            form.triggerHandler('submit');
            $rootScope.$apply();

            expect(vm.add).toHaveBeenCalled();
        });

    });

    describe('Add button', function() {

        var button;

        beforeEach(function() {
            button = template.find('#add');
        });

        it('should point to the edit-inventory-item-form', function() {
            expect(button.attr('form')).toEqual('edit-inventory-item-form');
        });

        it('should be a submit type', function() {
            expect(button.attr('type')).toEqual('submit');
        });

    });

    describe('Cancel button', function() {

        it('should call vm.cancel method', function() {
            template.find('#cancel').click();
            $timeout.flush();

            expect(vm.cancel).toHaveBeenCalled();
        });

    });

    function prepareSuite() {
        module('openlmis-templates');
        module('openlmis-form');
        module('cce-edit-inventory-item');

        inject(function($injector) {
            $compile = $injector.get('$compile');
            $rootScope = $injector.get('$rootScope');
            $templateRequest = $injector.get('$templateRequest');
            $timeout = $injector.get('$timeout');
            messageService = $injector.get('messageService');
            FacilityProgramInventoryItemDataBuilder = $injector.get('FacilityProgramInventoryItemDataBuilder');
        });

        inventoryItem = new FacilityProgramInventoryItemDataBuilder().build();

        messages = {
            'cceEditInventoryItem.addNewColdChainEquipment': 'Add New Cold Chain Equipment',
            'cceEditInventoryItem.editEquipmentDetails': 'Edit equipment details'
        };

        spyOn(messageService, 'get').andCallFake(function(key) {
            return messages[key];
        });

        prepareView();

        spyOn(vm, 'add');
    }

    function prepareView() {
        $scope = $rootScope.$new();
        vm = jasmine.createSpyObj('EditInventoryItemController', ['cancel']);
        vm.inventoryItem = inventoryItem;
        $scope.vm = vm;

        $templateRequest(
            'cce-edit-inventory-item/edit-inventory-item.html'
        ).then(function(requested) {
            template = $compile(requested)($scope);
        });
        $rootScope.$apply();
    }

});
