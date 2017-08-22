"use strict";

(function (root) {

    function pkcs7pad() {
        return "test";
    }

    // The block cipher
    var dukptsample = {
        utils: {
            pkcs7pad: pkcs7pad
        }
    };
    // node.js
    if (typeof exports !== 'undefined') {
        module.exports = dukptsample

        // RequireJS/AMD
        // http://www.requirejs.org/docs/api.html
        // https://github.com/amdjs/amdjs-api/wiki/AMD
    } else if (typeof(define) === 'function' && define.amd) {
        define(dukptsample);

        // Web Browsers
    } else {

        // If there was an existing library at "aesjs" make sure it's still available
        if (root.dukptsample) {
            dukptsample._dukptsample = root.dukptsample;
        }

        root.dukptsample = dukptsample;
    }


})(this);
