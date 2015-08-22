/* global -Misago */
/* exported Misago */
(function () {
  'use strict';

  window.Misago = function() {

    var ns = Object.getPrototypeOf(this);
    var self = this;

    // Preloaded data
    this.preloaded_data = {
      // Empty settings
      SETTINGS: {}
    };

    // Services
    this._services = [];
    this.addService = function(name, factory, order) {
      this._services.push({
        name: name,
        item: factory,
        after: this.get(order, 'after'),
        before: this.get(order, 'before')
      });
    };

    this._initServices = function(services) {
      var ordered_services = new ns.OrderedList(services).order(false);
      ordered_services.forEach(function (item) {
        var factory = null;
        if (item.item.factory !== undefined) {
          factory = item.item.factory;
        } else {
          factory = item.item;
        }

        var service_instance = factory(self);
        if (service_instance) {
          self[item.name] = service_instance;
        }
      });
    };

    this._destroyServices = function(services) {
      var ordered_services = new ns.OrderedList(services).order();
      ordered_services.reverse();
      ordered_services.forEach(function (item) {
        if (item.destroy !== undefined) {
          item.destroy(self);
        }
      });
    };

    this.registerCoreServices = function() {
      this.addService('Conf', ns.Conf);
    };

    // Component factory
    this.component = function() {
      var arguments_array = [];
      for (var i = 0; i < arguments.length; i += 1) {
        arguments_array.push(arguments[i]);
      }

      if (arguments_array[arguments_array.length - 1] !== this) {
        arguments_array.push(this);
      }

      return m.component.apply(undefined, arguments_array);
    };

    // App ini/destory
    this._outlet = null;
    this.init = function(outlet) {
      this._initServices(this._services);
      if (outlet) {
        this._outlet = outlet;
        m.mount(outlet, this.component(ns.ForumLayout));
      }
    };

    this.destroy = function() {
      // run destructors for services
      this._destroyServices()

      // unmount components if they are mounted
      if (this._outlet) {
        m.mount(this._outlet, null);
      }
    };
  };
}());
