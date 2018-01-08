let server = require('../server.js');

var chai = require('chai');  
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var nodeServer = 'localhost:1337';

var assert = require('assert');

describe('Server status', function(){
    it("should get a response from the server", function(){
        chai.request(nodeServer)
        .get('/')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            done();
        });
    });

});
describe('Configs', function(){
    this.timeout(100);
    it('should find a config.json file', function(done){
        if((server.config!=null)&&(server.config!="{}")){
            done();
        };
    });
    it('should find a bricks.json file', function(done){
        if((server.bricks!=null)&&(server.bricks!="{}")){
            done();
        };
    });
    it('should find a theme.json file', function(done){
        if((server.theme!=null)&&(server.theme!="")){
            done();
        };
    });
});
describe('Bookmarks', function() {
    this.timeout(3000);
    it('should create a bookmark', function(done){
        var startAmount = server.bricks.bricks.length;
        var brick = { name: "Test", url: "http://www.google.com", color: "red", size: "small" };
        chai.request(nodeServer)
        .post('/bookmark')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ "brick": brick })
        .end(function(err, res){
            assert.equal(res.body.bricks.bricks.length, startAmount+1);
            done();
        });
    });
    it('should delete a bookmark', function(done){
        var startAmount = server.bricks.bricks.length;
        var brick = { name: "Test", url: "http://www.google.com", color: "red", size: "small" };
        chai.request(nodeServer)
        .post('/removeBrick')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ "index": startAmount-1 })
        .end(function(err, res){
            assert.equal(res.body.bricks.bricks.length, startAmount-1);
            done();
        });
    })
});

describe('Redirection', function(){
    this.slow(1000); //1000ms test time considered slow
    this.timeout(15000);

    //server responds with a valid url if it finds one, else it will respond with url of null

    beforeEach(function(done) {
        this.timeout(500); 
        setTimeout(done, 50);
      });
        it('should correctly redirect google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should correctly redirect www.google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'www.google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should correctly redirect http://google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'http://google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should correctly redirect https://google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'https://google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should correctly redirect http://www.google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'http://www.google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should correctly redirect https://www.google.com', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'https://google.com'})
            .end(function(err, res){
                if(res.body.url!=null){
                    done();
                }
            });
        });
        it('should produce a redirection error', function(done){
            chai.request(nodeServer)
            .post('/redirect')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({url: 'error'})
            .end(function(err, res){
                if((res.body.url===null) || (res.body.url==="")){
                    done();
                }
            });
        });

});