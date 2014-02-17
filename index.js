/**
 * Module dependencies
 */

var events = require('event');
var Emitter = require('emitter');
var url = require('url');
var qs = require('querystring');
var debug = require('debug')('vimeo');
var find = require('find');
var type = require('type');

/**
 * Expose `Vimeo`
 */

module.exports = Vimeo;


function Vimeo(iframe) {

  if(typeof iframe === 'string') iframe = document.getElementById(iframe);

  this.el = iframe;
  this.ready = false;
  this.src = this.el.getAttribute('src');
  var u = url.parse(this.src);
  this.playerDomain = u.protocol + '//' + u.host;
  this.id = qs.parse(u.query.replace(/&amp;/g, '&')).player_id;

  if(!this.id) {
    throw new Error('player_id is required for player src');
  }

  Vimeo.Collection.push(this);

}

Vimeo.Collection = [];

/**
 * Emitter
 */

Emitter(Vimeo.prototype);

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
 * Actual event handling
 */

Vimeo.prototype._on = function(){
  return Emitter.prototype.on.apply(this, arguments);
};

/**
 * Higher level api
 */

Vimeo.prototype.api = function(method, val){
  if('function' === type(val)){
    this._on(method, val); 
    val = null;
  }
  this.postMessage(method, val);
};

Vimeo.prototype.postMessage = function(method, params){

  if(!this.el.contentWindow.postMessage) return false;
  
  var u = url.parse(this.src);
  var _url = u.protocol + '//' + u.hostname + u.pathname;
  var payload = { method: method, value: params };
  var data = JSON.stringify(payload);

  debug('postMessage payload: %s', data);
  debug('postMessage target url: %s', _url);
  
  this.el.contentWindow.postMessage(data, _url);

};

Vimeo.prototype.destroy = function(){
  this.off();
  var idx = Vimeo.Collection.indexOf(this);
  if(idx > -1) Vimeo.Collection.splice(idx, 1);
};

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


Vimeo.listen = function(){
  events.bind(window, 'message', Vimeo.onMessageRecieved);
};

Vimeo.unlisten = function(){
  events.unbind(window, 'message', Vimeo.onMessageRecieved);
};

