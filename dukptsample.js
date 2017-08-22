"use strict";

(function (root) {
    var BigInt = require('big-integer');
    var crypto = require('crypto');
    var crc = require('crc');
    /*Constants*/
    const Reg3Mask = BigInt("1FFFFF", 16);
    const ShiftRegMask = BigInt("100000", 16);
    const Reg8Mask = BigInt("FFFFFFFFFFE00000", 16);
    const Ls16Mask = BigInt("FFFFFFFFFFFFFFFF", 16);
    const Ms16Mask = BigInt("FFFFFFFFFFFFFFFF0000000000000000", 16);
    const KeyMask = BigInt("C0C0C0C000000000C0C0C0C000000000", 16);
    const PekMask = BigInt("FF00000000000000FF", 16);
    const KsnMask = BigInt("FFFFFFFFFFFFFFE00000", 16);
    const DekMask = BigInt("0000000000FF00000000000000FF0000", 16); // Used by IDTECH

    const bdk = "0123456789ABCDEFFEDCBA9876543210";

    var CreateIPEK = function (ksn) {
        var trans = Transform("TripleDES", true, BigInt(bdk, 16), BigInt(ksn, 16).and(KsnMask).shiftRight(16));
        var transrt = Transform("TripleDES", true, BigInt(bdk, 16).xor(KeyMask), BigInt(ksn, 16).and(KsnMask).shiftRight(16));
        return BigInt(trans, 16).shiftLeft(64).or(BigInt(transrt, 16));
    }

    var CreateFutureKey = function (ipek, ksn) {
        return DeriveKey(ipek, BigInt(ksn, 16));
    }

    var Transform = function (name, encrypt, key, message) {
        if (encrypt) {
            var cipher = crypto.createCipher("aes-256-ctr", key.toString())
            var crypted = cipher.update(message.toString(), 'utf8', 'hex')
            crypted += cipher.final('hex');
            return crypted;
        }
        else {
            var decipher = crypto.createDecipher("aes-256-ctr", key.toString())
            var dec = decipher.update(message, 'hex', 'utf8')
            dec += decipher.final('utf8');
            return dec;
        }
    }

    var DeriveKey = function (ipek, ksn) {
        var ksnReg = BigInt(ksn, 16).and(Ls16Mask).and(Reg8Mask);
        //console.log("ksnReg"+ ksnReg.toString());
        var curKey = ipek;
        for (var shiftReg = parseInt(ShiftRegMask.toString()); shiftReg > 0; shiftReg >>= 1)
            if (BigInt(shiftReg).and(ksn).and(Reg3Mask) > 0)
                curKey = GenerateKey(curKey, ksnReg = BigInt(ksnReg).or(shiftReg));
        return curKey;
    }

    var GenerateKey = function (key, ksn) {
        return BigInt(EncryptRegister(BigInt(key).xor(KeyMask), ksn)).shiftLeft(64).or(BigInt(EncryptRegister(key, ksn)));
    }

    var EncryptRegister = function (curKey, reg8) {
        var reg1 = BigInt(curKey).and(Ls16Mask);
        var reg2 = Transform("DES", true, BigInt(curKey).and(Ms16Mask).shiftRight(64), BigInt(curKey).and(Ls16Mask).xor(reg8));
        return BigInt(reg1).xor(BigInt(reg2, 16));
    }

    var Decrypt = function (ksn, message) {
        return Transform("TripleDES", false, CreateFutureKey(CreateIPEK(ksn), ksn), message);
    }

    function pkcs7pad() {
        return "test";
    }
    function randomksn(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    // The block cipher
    var dukptsample = {
        dukptfunctions: {
            pkcs7pad: pkcs7pad,
            randomksn:randomksn
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
