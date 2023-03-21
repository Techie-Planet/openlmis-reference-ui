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
     * @name stock-event.StockEventRepositoryImpl
     *
     * @description
     * Implementation of the StockEventRepository interface. Communicates with the REST API of the OpenLMIS server.
     */
    angular
        .module('stock-event')
        .factory('StockEventRepositoryImpl', StockEventRepositoryImpl);

    StockEventRepositoryImpl.inject = ['$http', 'accessTokenFactory', 'stockmanagementUrlFactory','StockEventResource', 'StockIssuePrint', 'stockEventCacheService',
        'offlineService', 'currentUserService'];

    function StockEventRepositoryImpl($http, accessTokenFactory, stockmanagementUrlFactory, StockEventResource, StockIssuePrint, stockEventCacheService, offlineService, currentUserService) {

        StockEventRepositoryImpl.prototype.create = create;
        StockEventRepositoryImpl.prototype.printIssue = printIssue;

        return StockEventRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventRepositoryImpl
         * @name StockEventRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the StockEventRepositoryImpl class.
         */
        function StockEventRepositoryImpl() {
            this.stockEventResource = new StockEventResource();
            this.stockIssuePrint = new StockIssuePrint();
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventRepositoryImpl
         * @name create
         *
         * @description
         * Creates stock event on the OpenLMIS server.
         *
         * @param  {Object}  event the JSON representation of the stock event
         * @return {Promise} the promise resolving to JSON representation of the created event
         */
        function create(event) {
            if (offlineService.isOffline()) {
                return currentUserService.getUserInfo()
                    .then(function(user) {
                        stockEventCacheService.cacheStockEvent(event, user.id);
                        return event;
                    });
            }
            return this.stockEventResource.create(event);
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventRepositoryImpl
         * @name printIssue
         *
         * @description
         * Prints stock issue event on the OpenLMIS server.
         *
         * @param  {Object}  event the JSON representation of the stock issue event
         * @return {Promise} the promise resolving to JSON representation of the created event
         */
        function printIssue(event) {
            if (offlineService.isOffline()) {
                return currentUserService.getUserInfo()
                    .then(function(user) {
                        stockEventCacheService.cacheStockEvent(event, user.id);
                        return event;
                    });
            }
            return this.stockIssuePrint.create(event);
        }
    }
})();
