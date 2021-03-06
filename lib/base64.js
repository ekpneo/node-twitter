/* base64.js
 *
 * Base64 encoding/decoding functions for use within node.js
 *
 * Code was borrowed from phpjs.org.  Modified to work with the CommonJS
 * framework.  Also removed the utf8 dependency.  This may break encoding
 * utf8 encoded charaters.
 *
 * Ted Morse <tmorse@gmail.com>
 * 12/22/2009
 */

var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

exports.encode = function(data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Bayron Guevara
  // +   improved by: Thunder.m
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    changed by: Ted Morse
  // -    depends on: utf8_encode
  // *     example 1: base64_encode('Kevin van Zonneveld');
  // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];
  
  if (!data) {
    return data;
  }

  // Convert to a string
  data = data + '';
    
  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1<<16 | o2<<8 | o3;

    h1 = bits>>18 & 0x3f;
    h2 = bits>>12 & 0x3f;
    h3 = bits>>6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);
    
  enc = tmp_arr.join('');
    
  switch (data.length % 3) {
  case 1:
    enc = enc.slice(0, -2) + '==';
    break;
  case 2:
    enc = enc.slice(0, -1) + '=';
    break;
  }

  return enc;
};

exports.decode = function(data) {
  // Decodes string using MIME base64 algorithm  
  // 
  // version: 909.322
  // discuss at: http://phpjs.org/functions/base64_decode
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Thunder.m
  // +      input by: Aman Gupta
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    changed by: Ted Morse
  // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
  // *     returns 1: 'Kevin van Zonneveld'
  // mozilla has this native
  // - but breaks in 2.0.0.12!
  //if (typeof this.window['btoa'] == 'function') {
  //    return btoa(data);
  //}
 
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
 
  if (!data) {
    return data;
  }
 
  data += '';
 
  do {  // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));
    
    bits = h1<<18 | h2<<12 | h3<<6 | h4;
    
    o1 = bits>>16 & 0xff;
    o2 = bits>>8 & 0xff;
    o3 = bits & 0xff;
 
    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);
 
  dec = tmp_arr.join('');
  //dec = this.utf8_decode(dec);
 
  return dec;
}
