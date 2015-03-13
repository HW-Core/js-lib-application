/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
hw2.define([
    'hw2!PATH_JS_LIB:application/include.js'
], function () {
    $ = this;

    return $.System = $.public.class.extends($.Component)([
        $.public({
            /**
             * 
             * @param {String} name
             * @param {String|Object} module
             * @param {Object} opt
             *  autoStart -> define if this component can be started at boot
             *  
             * @returns boolean
             */
            register: function (name, module, opt) {
                opt.rootComponent = this;
                if (this.i.childs[name]) {
                    throw new Error("A component with same name ( " + name + " ) already exists!");
                }

                this.i.childs[name] = {module: module, opt: opt};
            },
            unregister: function (name) {
                delete this.i.childs[name];
            },
            loadServices: function () {
                var that = this;

                if (typeof that.i.childs === "object") {
                    var promises = [];
                    for (var key in that.i.childs) {
                        var child = that.i.childs[key];
                        if (child.opt.autoStart) {
                            promises.push(that.s.load(child.module, that, child.opt));
                        }
                    }

                    if (promises.length > 0) {
                        return $.Q.all(promises).then(function () {
                            return true;
                        });
                    }
                }

                return true;
            },
            init: function () {
                this.i.loadServices();
            }
        })
    ]);
});