/**
 * Module dependencies
 */

var events = require('event');
var Emitter = require('emitter');
var url = require('url');
var qs = require('querystring');
var debug = require('debug')('vimeo');
var find = require('find');

/**
 * Expose `Vimeo`
 */

module.exports = Vimeo;

/**
 * Instantiate `Vimeo`
 *
 * @param {Element/String} iframe
 */

function Vimeo(iframe) {

  if(typeof iframe === 'string') iframe = document.getElementById(iframe);

  this.el = iframe;
  this.ready = false;
  this.src = this.el.getAttribute('src');
  var u = url.parse(this.src);
  this.playerDomain = u.protocol + '//' + u.host;
  this.id = qs.parse(u.query.replace(/&amp;/g, '&')).player_id;

  if(!this.id) {
    this.id = Vimeo.randomPlayerId();
    this.src += '&amp;player_id=' + this.id;
    this.el.setAttribute('src', this.src);
  }

  Vimeo.Collection.push(this);

}

/**
 * Collection of instance
 * @api private
 */

Vimeo.Collection = [];

/**
 * Installs Emitter
 */

Emitter(Vimeo.prototype);


/**
 * Add event listeners and tells iFrame to emit the event.
 *
 * @param {String} eventName
 * @param {Function} fn
 * @api public
 */

Vimeo.prototype.on = function(eventName, fn){

  var rtn = this._on.apply(this, arguments);

  if(eventName === 'ready'){
    if(this.ready) fn.call(this, { event: 'ready', 'player_id': this.id });
  } else {
    this.postMessage('addEventListener', eventName);
  }

  return rtn;
};


/**
 * Manages events, Inherits from `Emitter`'s `on`
 *
 * @api private
 */

Vimeo.prototype._on = function(){
  return Emitter.prototype.on.apply(this, arguments);
};

/**
 * API
 *
 * Usage: 
 * ```
 *  // Getters
 *  vimeo.api('currentTime', function(d){
 *    console.log(d.value);
 *  });
 *
 *  // Setters
 *  vimeo.api('setLoop', 10);
 *
 *  // Methods
 *  vimeo.api('seekTo', 10);
 *
 * ```
 *  - *Getters*
 *      - `currentTime`
 *      - `getVideoHeight`
 *      - `getVideoWidth`
 *      - `getDuration`
 *      - `getColor`
 *      - `getVideoUrl`
 *      - `getVideoEmbedCode`
 *      - `getVolume`
 *      - `paused`
 *
 *  - *Setters*
 *      - `setLoop`
 *      - `setColor`
 *      - `setVolume`
 *
 *  - *Methods*
 *      - `play`
 *      - `pause`
 *      - `unload`
 *      - `seekTo`
 *
 * @param {String} method
 * @param {Function/String} val
 * @api public
 */

Vimeo.prototype.api = function(method, val){
  if('function' === typeof val){
    this._on(method, val); 
    val = null;
  }
  this.postMessage(method, val);
};


/**
 * Post message to iframe
 *
 * @param {String} method
 * @param {String} val
 * @api private
 */

Vimeo.prototype.postMessage = function(method, val){

  if(!this.el.contentWindow.postMessage) return false;
  
  var u = url.parse(this.src);
  var _url = u.protocol + '//' + u.hostname + u.pathname;
  var payload = { method: method, value: val };
  var data = JSON.stringify(payload);

  debug('postMessage payload: %s', data);
  debug('postMessage target url: %s', _url);
  
  this.el.contentWindow.postMessage(data, _url);

};


/**
 * Destroys instance
 *
 * @param {Boolean} remove
 * @api public
 */

Vimeo.prototype.destroy = function(remove){
  this.off();
  var idx = Vimeo.Collection.indexOf(this);
  if(idx > -1) Vimeo.Collection.splice(idx, 1);
  if(remove) this.el.parentElement.removeChild(this.el);
};


/**
 * Callback for `message` event from vimeo iframe
 * @param {Event} e
 *
 * @api private
 */

Vimeo.onMessageRecieved = function(e){

  debug('recieveMessage payload: %s', e.data);

  var data = JSON.parse(e.data);
  var eventName = data.event || data.method;
  
  if(data.ready) this.ready = true;
  if(!data.player_id) return;

  var instance = find(Vimeo.Collection, function(d){
    return d.id === data.player_id;
  });
  
  if(e.origin !== instance.playerDomain) return false;
  instance.emit(eventName, data);

};

/**
 * Start listening for message event from iframe
 *
 * @api public
 */

Vimeo.listen = function(){
  events.bind(window, 'message', Vimeo.onMessageRecieved);
};

/**
 * Stop listening for message event from iframe
 *
 * @api public
 */

Vimeo.unlisten = function(){
  events.unbind(window, 'message', Vimeo.onMessageRecieved);
};

Vimeo.randomPlayerId = function(){
  return 'player-' + Math.random().toString(36).substring(7);
};
