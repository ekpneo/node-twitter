/* twitter.js
 * 
 * A javascript library for node.js for interacting with twitter's API.
 *
 * Depends base64 encoding/decoding library (base64.js)
 *
 * Ted Morse <tmorse@gmail.com>
 * 12/22/2009
 */

/* Usage:
 * 
 * var twitter = require('twitter'), sys = require('sys');
 * var client = twitter.createClient(username, password);
 * client.update('Hello from twitter.js').addCallback(function() {
 *   sys.puts('twitter status updated');
 * });
 *
 */

/* TODO:
 * - Handle more error conditions nicely
 * - Incorporate more of the REST API URLs
 * - Add support for the Streaming API
 * - Add methods to objects be smart about following users, etc
 *   eg: user.follow() which calls client.follow(user.user_id)...
 */

var sys = require('sys'),
   http = require('http');
 base64 = require('./base64');

var API_HOST = 'twitter.com';
var HEADERS = { 'Host': API_HOST };

function TwitterClient (options) {
  process.EventEmitter.call(this);
  this.init(options);
}
sys.inherits(TwitterClient, process.EventEmitter);
exports.TwitterClient = TwitterClient;

TwitterClient.prototype.init = function(options) {
  this.port = options['port'] || 80;
  this.host = options['host'] || API_HOST;
  this.headers = options['headers'] || process.mixin({}, HEADERS);
  this.headers['Host'] = this.host;

  this.client = http.createClient(this.port, this.host);

  if ('username' in options && 'password' in options) {
    this.authenticate(options.username, options.password);
  }
};

TwitterClient.prototype.authenticate = function(username, password) {
  // Generate authentication header if possible
  this.authenticated = false;
  if(typeof(username) === 'string' &&
     typeof(password) === 'string') {
    this.headers['Authorization'] = 'Basic ' +
      base64.encode(username + ':' + password);
    this.authenticated = true;
  }
};

TwitterClient.prototype._doRequest = function(path, data, post) {
  var promise = new process.Promise();
  var headers = process.mixin({}, this.headers);
  var method = 'GET';

  var encoded_data = '';
  if(typeof(data) === 'string') {
    encoded_data = data;
  } else if(typeof(data) === 'object') {
    var s = [];
    // Assume simple objects.
    for (property in data) {
      s[s.length] = encodeURIComponent(property) + '=' + encodeURIComponent(data[property]);
    }
    encoded_data = s.join('&').replace(/%20/g, '+');
  }

  if (post == true) {
    method = 'POST';
    headers['Content-type'] = 'application/x-www-form-urlencoded';
    headers['Content-length'] = encoded_data.length;
  } else {
    path += '?' + encoded_data;
  }

  var txt_data = '';

  var request = this.client.request(method, path, headers);

  if (post == true) {
    request.sendBody(encoded_data);
  }

  request.finish(function(response) {
    response.addListener('body', function(chunk) { txt_data += chunk; });
    response.addListener('complete', function() {
      sys.debug(response.statusCode);
      switch (response.statusCode) {
      case 200:
        promise.emitSuccess(JSON.parse(txt_data));
        break;
      case 304:
        promise.emitSuccess({});
        break;
      case 401:
        this.authenticated = false;
        promise.emitError('unauthorized');
        break;
      };

      promise.emitError(response.statusCode, txt_data);
    });
  });

  return promise;
};

TwitterClient.prototype._doAuthenticatedRequest = function(path, data, post) {
  if(!this.authenticated) {
    throw new Error("TwitterError: This API call requires authentication");
  }

  return this._doRequest(path, data, post);
};

TwitterClient.prototype.update = function(text) {
  if (text.length > 140)
    throw new Error('TwitterError: update too long');

  return this._doAuthenticatedRequest('/statuses/update.json', { 'status': text }, true);
}

TwitterClient.prototype.publicTimeline = function() {
  return this._doRequest('/statuses/public_timeline.json');
};

exports.createClient = function (username, password) {
  return new TwitterClient({
    'username': username,
    'password': password 
  });
};
