# vimeo.js

Rewrite of `froogaloop.js` from vimeo.
Since it seems not maintained and no tests, I re-wrote it so it's more reliable.

## Installation

For [component(1)](http://github.com/component/component)
```
$ component install mnmly-vimeo
```

For simple script tag

```
<script src='/vimeo.js'></script>
<script type="text/javascript">
  console.log(Vimeo);
</script>
```

## Usage

```javascript
var Vimeo = require('vimeo');

// Start listening for message event from vimeo iframe
Vimeo.listen();

var vimeo = new Vimeo('vimeo-iframe-id');

// Instead of id of iframe, you can pass element as well
// vimeo = new Vimeo(iframeElement);

vimeo.on('ready', function(){
  console.log('ready to use api');

  vimeo.api('getDuration', function(d){
    console.log(d.value); // -> duration in seconds
  });
});
```


## API

  - [Vimeo()](#vimeo)
  - [Vimeo::on()](#vimeooneventnamestringfnfunction)
  - [Vimeo::api()](#vimeoapimethodstringvalfunctionstring)
  - [Vimeo::destroy()](#vimeodestroyremoveboolean)
  - [Vimeo.listen()](#vimeolisten)
  - [Vimeo.unlisten()](#vimeounlisten)

### Vimeo()

  Instantiate `Vimeo`

### Vimeo::on(eventName:String, fn:Function)

  Add event listeners and tells iFrame to emit the event.

### Vimeo::api(method:String, val:Function|String)
  
  API call.

### Vimeo::destroy(remove:Boolean)

  Destroys instance

### Vimeo::listen()

  Start listening for message event from iframe

### Vimeo.unlisten()

  Stop listening for message event from iframe

## API list

- *Getters*
     - `currentTime`
     - `getVideoHeight`
     - `getVideoWidth`
     - `getDuration`
     - `getColor`
     - `getVideoUrl`
     - `getVideoEmbedCode`
     - `getVolume`
     - `paused`

- *Setters*
     - `setLoop`
     - `setColor`
     - `setVolume`

- *Methods*
     - `play`
     - `pause`
     - `unload`
     - `seekTo`

## Events
  
  - `ready`
  - `play`
  - `pause`
  - `finish`
  - `seek`
  - `loadProgress`
  - `playProgress`

## TODO:

- examples


## License

  MIT
