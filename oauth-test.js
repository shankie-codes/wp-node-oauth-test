describe('OAuth1.0',function(){
  var OAuth = require('oauth');

  it('tests trends Twitter API v1.1',function(done){
    var oauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      'Ta26wBQIKpyCVz4AuJFKTvVru',
      'qConvyCnrS3hi22Whxm9uRi4QVoV5YSFB8JZH6RuT4POAVjAS6',
      '1.0A',
      null,
      'HMAC-SHA1'
    );
    oauth.get(
      'https://api.twitter.com/1.1/trends/place.json?id=23424977',
      '152577656-V521zbnNHmcP4vtytDcyiM7TP6J7admer1ZUHUiJ', //test user token
      'DHAhfESWYvGtLbhdwAhgRvKg9qcuZaAAeOkT6zWq11UPb', //test user secret            
      function (e, data, res){
        if (e) console.error(e);        
        console.log(require('util').inspect(data));
        done();      
      });    
  });
});