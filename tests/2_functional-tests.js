const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(10000); // allow API time to respond
  let likes; // Variable to store like count

  suite('GET /api/stock-prices', function () {
    test('Viewing one stock: GET /api/stock-prices', function (done) {
      chai.request(server)
        .get('/api/stock-prices?stock=GOOG')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
    });

    test('Viewing one stock and liking it', function (done) {
      chai.request(server)
        .get('/api/stock-prices?stock=MSFT&like=true') // Use a different stock
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.isAbove(res.body.stockData.likes, 0); // Assert it has at least 1 like
          likes = res.body.stockData.likes; // Store the like count
          done();
        });
    });

    test('Viewing the same stock and liking again (should not increase likes)', function (done) {
      chai.request(server)
        .get('/api/stock-prices?stock=MSFT&like=true') // Request SAME stock
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.equal(res.body.stockData.likes, likes); // Assert likes are unchanged
          done();
        });
    });

    test('Viewing two stocks', function (done) {
      chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=AMZN')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.oneOf(res.body.stockData[0].stock, ['GOOG', 'AMZN']);
          assert.oneOf(res.body.stockData[1].stock, ['GOOG', 'AMZN']);
          done();
        });
    });

    test('Viewing two stocks and liking them', function (done) {
      chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=AMZN&like=true')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.oneOf(res.body.stockData[0].stock, ['GOOG', 'AMZN']);
          assert.oneOf(res.body.stockData[1].stock, ['GOOG', 'AMZN']);
          // Assert that rel_likes are opposites
          assert.equal(res.body.stockData[0].rel_likes, -res.body.stockData[1].rel_likes);
          done();
        });
    });
  });
});
