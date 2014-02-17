var chai = require('chai');
var should = chai.should();
var Debug = require('visionmedia-debug');

Debug.enable('*');

var Vimeo = require('vimeo');
Vimeo.listen();

describe('Vimeo', function(){

  this.timeout(5000);

  var demoSrc = '//player.vimeo.com/video/7100569?api=1&player_id=player_1';
  beforeEach(function(){
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'test';
    this.iframe.src = demoSrc;
    document.body.appendChild(this.iframe);
    this.vimeo = new Vimeo('test');
  });

  afterEach(function(){
    document.body.removeChild(this.iframe);
    this.vimeo.destroy();
  });

  it('should exist', function(){
    should.exist(Vimeo);
  });

  it('should grab el when id is passed to constructor', function(){
    this.vimeo.should.have.a.property('el', this.iframe);
  });
  
  it('should grab a player domain', function(){
    this.vimeo.should.have.a.property('playerDomain');
    this.vimeo.playerDomain.should.equal('http://player.vimeo.com');
  });

  it('should trigger ready when ready', function(done){
    this.vimeo.on('ready', function(){
      done();
    });
  });

  describe('API', function(){

    beforeEach(function(next){
      this.vimeo.on('ready', function(){
        next();
      });
    });

    it('should have api/postMessage method', function(){
      this.vimeo.should.have.a.property('api');
      this.vimeo.should.have.a.property('postMessage');
    });

    describe('Getters', function(){
      
      it('should get currentTime', function(done){
        this.vimeo.api('getCurrentTime', function(e){
          e.value.should.be.number;
          done();
        });
      });

      it('should get video width', function(done){
        this.vimeo.api('getVideoHeight', function(e){
          e.value.should.be.number;
          done();
        });
      });

      it('should get video height', function(done){
        this.vimeo.api('getVideoWidth', function(e){
          e.value.should.be.number;
          done();
        });
      });

      it('should get duration', function(done){
        this.vimeo.api('getDuration', function(e){
          e.value.should.be.number;
          done();
        });
      });
      
      it('should get color', function(done){
        this.vimeo.api('getColor', function(e){
          var color = '#' + e.value;
          color.should.match(/^#[0-9A-F]{6}$/i);
          done();
        });
      });
      
      it('should get url', function(done){
        this.vimeo.api('getVideoUrl', function(e){
          e.value.should.match(/^http/);
          done();
        });
      });
      
      it('should get embed code', function(done){
        this.vimeo.api('getVideoEmbedCode', function(e){
          e.value.should.match(/iframe/g);
          done();
        });
      });
      
      it('should get paused or not', function(done){
        this.vimeo.api('paused', function(e){
          e.value.should.be.ok;
          done();
        });
      });
      
      it('should get volume', function(done){
        this.vimeo.api('getVolume', function(e){
          e.value.should.not.be.number;
          done();
        });
      });


    });
    
    describe('Setters', function(){
      it('should set volume', function(done){
        var self = this;
        var volume = 0.1;
        this.vimeo.api('setVolume', volume);
        setTimeout(function(){
          self.vimeo.api('getVolume', function(e){
            e.value.should.equal(volume);
            done();
          });
        }, 1000);
      });

      it('should set loop', function(done){
        var self = this;
        this.vimeo.api('setLoop', 10);
        done();
      });
      
      it('should set color', function(done){
        var self = this;
        var hex = '#000000'.replace(/#/, '');
        this.vimeo.api('setColor', hex);

        setTimeout(function(){
          self.vimeo.api('getColor', function(e){
            e.value.should.equal(hex);
            done();
          });
        }, 500);
      });
    });

    describe('Methods', function(){

      it('should play', function(done){

        this.vimeo.on('play', function(){
          true.should.be.okay;
          done();
        });
        this.vimeo.api('play');
      });
      
      it('should pause', function(done){
        var self = this;
        this.vimeo.on('pause', function(){
          true.should.be.okay;
          done();
        });

        this.vimeo.api('play');
        setTimeout(function(){
          self.vimeo.api('pause');
        }, 1000);
      });
      
      it('should seek', function(done){
        var sec = 10;
        this.vimeo.on('seek', function(e){
          e.data.seconds.should.equal(sec);
          done();
        });
        this.vimeo.api('seekTo', sec);
      });
      
      it('should unload', function(done){
        var self = this;
        this.vimeo.api('play');
        setTimeout(function(){
          self.vimeo.api('unload');
          done();
        }, 3000);
      });

      it('should notify when video finishes', function(done){
          var self = this;
          this.timeout(10000);
          this.vimeo.api('getDuration', function(e){
            var duration = e.value;
            self.vimeo.api('seekTo', duration - 2);
            self.vimeo.on('finish', function(){
              done();
            });
          });
      });
    });
  });
});
