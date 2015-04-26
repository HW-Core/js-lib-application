/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

'use strict';

hw2.define([
    "hw2!{PATH_JS_LIB}application/include.js",
    "hw2!{PATH_JS_LIB}event/EventHandler.js"
], function () {
    var $ = this;

    return $.Component = $.public.abstract.class.extends($.Object)(
        $.protected({
            // component tree
            parent: null,
            childs: null,
            eventHandler: null,
            opt: null
        }),
        $.public({
            /**
             * childs: { module: m, opt: o } 
             */
            __construct: function (parent, childs, opt) {
                this.i.childs = childs || [];
                this.i.parent = parent;
                this.i.opt = opt || {};
                this.i.eventHandler = new $.EventHandler();
            },
            init: function () {
                var that = this;

                if (Array.isArray(that.i.childs)) {
                    var promises = [];
                    for (var key in that.i.childs) {
                        var child = that.i.childs[key];
                        promises.push(that.s.load(child.module, that.i, null, child.opt));
                    }

                    return $.Async.all(promises).then(function () {
                        return true;
                    });
                }

                this.i.build();

                return true;
            },
            update: function () {
                this.i.eventHandler.trigger("update", arguments);

                this.i.build();
            },
            build: function () {

            },
            __destruct: function () {
                this.i.eventHandler.trigger("__destruct");

                delete this.i.eventHandler;

                this.__super();
            },
            bindChild: function (child) {
                if (!child instanceof $.Component)
                    throw new Error("child is not an instance of Component");

                this.i.eventHandler.bind(child);
            }
        }),
        $.public.static({
            /**
             * 
             * @param {String|Object} component : the path of component or the object to initialize
             * @param {type} parent
             * @param {type} childs
             * @param {type} opt
             * @returns {Boolean}
             */
            load: function (component, parent, childs, opt) {
                function init (M) {
                    if (M.__isClass && M.__isChildOf($.Component)) {
                        var m = new M(parent, childs, opt);

                        if (parent)
                            parent.bindChild(m);

                        return m.init();
                    }

                    return false;
                }

                if (typeof component === "string") {
                    return $.Browser.Loader.load(component)
                            .then(function (M) {
                                var res = init(M, parent, childs, opt);
                                if (res === false)
                                    throw new Error("Passed object is not a Component");

                                return res;
                            });
                } else {
                    return init(component);
                }
            }
        })
    );
});