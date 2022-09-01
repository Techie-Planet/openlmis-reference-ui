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
     * @name shipment-view.ShipmentViewLineItemGroup
     *
     * @description
     * Represents a group of line items or line item groups.
     */
    angular
        .module('shipment-view')
        .factory('ShipmentViewLineItemGroup', ShipmentViewLineItemGroup);

    ShipmentViewLineItemGroup.inject = ['ShipmentViewLineItem', 'classExtender'];

    function ShipmentViewLineItemGroup(ShipmentViewLineItem, classExtender) {

        classExtender.extend(ShipmentViewLineItemGroup, ShipmentViewLineItem);

        ShipmentViewLineItemGroup.prototype.getAvailableSoh = getAvailableSoh;
        ShipmentViewLineItemGroup.prototype.getFillQuantity = getFillQuantity;
        ShipmentViewLineItemGroup.prototype.getOrderQuantity = getOrderQuantity;
        ShipmentViewLineItemGroup.prototype.setGroupShipmentLinesShippedQuantities = setGroupShipmentLinesShippedQuantities;

        return ShipmentViewLineItemGroup;

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name ShipmentViewLineItemGroup
         * @constructor
         *
         * @description
         * Creates an instance of the ShipmentViewLineItemGroup.
         *
         * @param {Object} config configuration object used when creating new instance of the class
         */
        function ShipmentViewLineItemGroup(config) {
            this.super(config);
            this.orderQuantity = config.orderQuantity;
            this.lineItems = config.lineItems;
            this.isMainGroup = config.isMainGroup;
            this.noStockAvailable = this.getAvailableSoh() === 0;
            this.isLot = false;
            this.groupQuantityShipped = this.getFillQuantity();
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getAvailableSoh
         *
         * @description
         * Returns a sum of all stock available for the children line items/line item groups.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the sum of all available stock on hand for the whole group
         */
        function getAvailableSoh(inDoses) {
            return this.lineItems.reduce(function(availableSoh, lineItem) {
                return availableSoh + lineItem.getAvailableSoh(inDoses);
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getFillQuantity
         *
         * @description
         * Returns a sum of all fill quantities for the children line items/line item groups.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the sum of all fill quantities for the whole group
         */
        function getFillQuantity() {
            return this.lineItems.reduce(function(fillQuantity, lineItem) {
                return fillQuantity + lineItem.getFillQuantity();
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getOrderQuantity
         *
         * @description
         * Returns an ordered quantity for the commodity type related with the line item.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the ordered quantity for the commodity type related with the
         *                           line item
         */
        function getOrderQuantity(inDoses) {
            if (this.orderQuantity === undefined || this.orderQuantity === null) {
                return;
            }
            return this.recalculateQuantity(this.orderQuantity, inDoses);
        }


        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name setGroupShipmentLinesShippedQuantities
         *
         * @description
         * Set the quantity shipped for each ShipementLineItem of 
         * a commodity type group: ShipmentViewLineItemGroup
         * 
         * Calculate the fill quantities per batch.
         * This method considers the following (in order):
         * 1. Batch Use By Status - pending implementatin
         * 2. Batch VVM status
         * 3. batch expiry date
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return none          
         */
        function setGroupShipmentLinesShippedQuantities(inDoses) {
            var quantityToFill = this.groupQuantityShipped;

            if (!this.isMainGroup) return;

            var lineItems = getLineItemsHavingShipments(this.lineItems);
            lineItems = decorateVVM(lineItems);
            
            if (lineItems.length > 0) {
                quantityToFill = fillByVVMStatus(lineItems, quantityToFill);
                quantityToFill = fillByExpiryDate(lineItems, quantityToFill);
            }
        }
    }

    function getLineItemsHavingShipments(items) {
        var lineItems = items[0].hasOwnProperty('lineItems') ? items[0].lineItems : items;

        return lineItems.map(function(lineItem) {
            if (lineItem.shipmentLineItem === undefined || lineItem.shipmentLineItem === null) {
                return;
            }
 
            if (lineItem.shipmentLineItem.quantityShipped === undefined || 
                lineItem.shipmentLineItem.quantityShipped === null) {
                return;
            }

            return lineItem;
        });
    }

    function fillByVVMStatus(lineItems, quantityToFill) {
        var sortedLineItems = lineItems.sort((a,b) => {
            a.vvmStatus > b.vvmStatus ? 1 : -1
        });

        for(var i = 0; i < sortedLineItems.length; i++) {
            var lineItem = sortedLineItems[i];

            if (quantityToFill <= 0) break;
            if (!lineItem.vvmStatus) continue;
            
            var stockOnHand = lineItem.shipmentLineItem.stockOnHand;
            if (stockOnHand == 0) continue;

            if (stockOnHand >= quantityToFill) {
                lineItem.shipmentLineItem.quantityShipped = quantityToFill;
                quantityToFill = 0;
            } else {
                lineItem.shipmentLineItem.quantityShipped = stockOnHand;
                quantityToFill = quantityToFill - stockOnHand;
            }
        }

        return quantityToFill;
    }

    function fillByExpiryDate(lineItems, quantityToFill) {
        var sortedLineItems = lineItems.sort((a,b) => {
            a.expirationDate > b.expirationDate ? 1 : -1
        });

        for(var i = 0; i < sortedLineItems.length; i++) {
            var lineItem = sortedLineItems[i];

            if (quantityToFill <= 0) break;
            if (!lineItem.isLot) continue;
            
            var stockOnHand = lineItem.shipmentLineItem.stockOnHand;
            if (stockOnHand == 0) continue;

            if (stockOnHand >= quantityToFill) {
                lineItem.shipmentLineItem.quantityShipped = quantityToFill;
                quantityToFill = 0;
            } else {
                lineItem.shipmentLineItem.quantityShipped = stockOnHand;
                quantityToFill = quantityToFill - stockOnHand;
            }
        }

        return quantityToFill;
    }

    function decorateVVM(lineItems) {
        return lineItems.map(function(lineItem) {
            if (!lineItem.vvmStatus) return lineItem;
            var vvm = lineItem.vvmStatus.split('_')[1];

            switch(vvm) {
                case 1:
                    lineItem.vvmStatus = "I"; 
                    break;
                case 2:
                    lineItem.vvmStatus = "II"; 
                    break;
                case 3:
                    lineItem.vvmStatus = "III"; 
                    break;
                case 4:
                    lineItem.vvmStatus = "IV"; 
                    break;
                default:
                    break;
            }

            return lineItem;
        });
    }

})();