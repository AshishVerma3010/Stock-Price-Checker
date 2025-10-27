"use strict";
const { Stock } = require("./models");
const fetch = require("node-fetch");
const crypto = require("crypto");

module.exports = function (app) {
  async function fetchStockPrice(symbol) {
    try {
      const response = await fetch(
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
      );
      const data = await response.json();
      return data && data.latestPrice ? Number(data.latestPrice) : null;
    } catch (err) {
      console.error("Error fetching stock price:", err);
      return null;
    }
  }

  async function updateLikes(symbol, like, hashedIp) {
    let stock = await Stock.findOne({ symbol });
    if (!stock) {
      stock = new Stock({ symbol, likes: like ? [hashedIp] : [] });
    } else if (like && !stock.likes.includes(hashedIp)) {
      stock.likes.push(hashedIp);
    }
    await stock.save();
    return stock;
  }

  app.route("/api/stock-prices").get(async (req, res) => {
    try {
      let { stock, like } = req.query;
      like = like === "true";
      const isMultiple = Array.isArray(stock);
      const userIp = req.ip || req.headers["x-forwarded-for"] || "0.0.0.0";
      const hashedIp = crypto.createHash("sha256").update(userIp).digest("hex");

      if (isMultiple) {
        const stockSymbols = stock.map((s) => s.toUpperCase());
        const stockData = await Promise.all(
          stockSymbols.map(async (sym) => {
            const price = await fetchStockPrice(sym);
            const record = await updateLikes(sym, like, hashedIp);
            return {
              stock: sym,
              price: Number(price),
              likes: Number(record.likes.length),
            };
          })
        );
        const relLikes = stockData[0].likes - stockData[1].likes;
        return res.json({
          stockData: [
            {
              stock: stockData[0].stock,
              price: stockData[0].price,
              rel_likes: relLikes,
            },
            {
              stock: stockData[1].stock,
              price: stockData[1].price,
              rel_likes: -relLikes,
            },
          ],
        });
      } else {
        const symbol = stock.toUpperCase();
        const price = await fetchStockPrice(symbol);
        const record = await updateLikes(symbol, like, hashedIp);
        return res.json({
          stockData: {
            stock: symbol,
            price: Number(price),
            likes: Number(record.likes.length),
          },
        });
      }
    } catch (error) {
      console.error("Error in API route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

// 'use strict';
// const { Stock } = require('./models');
// const fetch = require('node-fetch');
// const crypto = require('crypto');

// module.exports = function (app) {

//   async function fetchStockPrice(symbol) {
//     try {
//       const response = await fetch(
//         `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
//       );
//       const data = await response.json();
//       return data && data.latestPrice ? data.latestPrice : null;
//     } catch (err) {
//       console.error('Error fetching stock price:', err);
//       return null;
//     }
//   }

//   async function updateLikes(symbol, like, hashedIp) {
//     let stock = await Stock.findOne({ symbol });
//     if (!stock) {
//       stock = new Stock({ symbol, likes: like ? [hashedIp] : [] });
//     } else if (like && !stock.likes.includes(hashedIp)) {
//       stock.likes.push(hashedIp);
//     }
//     await stock.save();
//     return stock;
//   }

//   app.route('/api/stock-prices')
//     .get(async (req, res) => {
//       try {
//         let { stock, like } = req.query;
//         like = like === 'true';
//         const isMultiple = Array.isArray(stock);
//         const userIp = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
//         const hashedIp = crypto.createHash('sha256').update(userIp).digest('hex');

//         if (isMultiple) {
//           const stockSymbols = stock.map((s) => s.toUpperCase());
//           const stockData = await Promise.all(
//             stockSymbols.map(async (sym) => {
//               const price = await fetchStockPrice(sym);
//               const record = await updateLikes(sym, like, hashedIp);
//               return { stock: sym, price, likes: record.likes.length };
//             })
//           );

//           const relLikes = stockData[0].likes - stockData[1].likes;
//           return res.json({
//             stockData: [
//               { stock: stockData[0].stock, price: stockData[0].price, rel_likes: relLikes },
//               { stock: stockData[1].stock, price: stockData[1].price, rel_likes: -relLikes },
//             ],
//           });
//         } else {
//           const symbol = stock.toUpperCase();
//           const price = await fetchStockPrice(symbol);
//           const record = await updateLikes(symbol, like, hashedIp);
//           return res.json({
//             stockData: {
//               stock: symbol,
//               price,
//               likes: record.likes.length
//             },
//           });
//         }
//       } catch (error) {
//         console.error('Error in API route:', error);
//         res.status(500).json({ error: 'Internal server error' });
//       }
//     });
// };




// 'use strict';
// const StockModel = require("../models").Stock;
// const fetch = require("node-fetch");

// async function createStock(stock, like, ip)
// {
//   const newStock = new StockModel({
//     symbol: stock,
//     likes: like ? [ip] : []
//   });
//   //const savedNew = await newStock.save();
//   return await newStock.save();
// }

// async function findStock(stock)
// {
//   return await StockModel.findOne({symbol: stock}).exec();
// }

// async function saveStock(stock, like, ip)
// {
//   let saved = {};
//   const foundStock = await findStock(stock);
//   if (!foundStock)
//   {
//     const createSaved = await createStock(stock, like, ip);
//     saved = createSaved;
//     //return saved;
//   }
//   else
//   {
//     if (like && foundStock.likes.indexOf(ip) === -1)
//     {
//       foundStock.likes.push(ip);
//       saved = await foundStock.save();
//     }
//     else
//     {
//       saved = foundStock;
//     }
//    // return saved;
//   }
//   return saved;
// }

// async function getStock(stock) {
//   console.log("Clicked button");
//   const response = await fetch(
//     `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
//   );
//   console.log(response.ok);
//   if (!response.ok) {
//     throw new Error(`Error fetching stock data for ${stock}`);
//   }
//   const { symbol, latestPrice } = await response.json();
//   if (!symbol) {
//     throw new Error(`invalid symbol`);
//   }
//   return { symbol, latestPrice };
// }

// module.exports = function (app) {
//   app.route('/api/stock-prices').get(async function (req, res) {
//     const { stock, like } = req.query;
//     console.log("Like: "+like);

//     if (Array.isArray(stock))
//     {
//       console.log("stocks:", stock);

//       const {symbol, latestPrice} = await getStock(stock[0]);
//       const {symbol: symbol2, latestPrice: latestPrice2} = await getStock(stock[1]);

//       const firstStock = await saveStock(stock[0], like === "true", req.ip);
//       const secondStock = await saveStock(stock[1], like === "true", req.ip);

//       let stockData = [];

//       if(symbol) {
//         stockData.push({
//           stock: symbol,
//           price: latestPrice,
//           rel_likes: firstStock.likes.length - secondStock.likes.length,
//         });
//       } else {
//         console.log("Error fetching stock data:", error.message);
//         stockData.push({
//           rel_likes: firstStock.likes.length - secondStock.likes.length,
//         });
//       }

//       if(symbol2) {
//         stockData.push({
//           stock: symbol2,
//           price: latestPrice2,
//           rel_likes: secondStock.likes.length - firstStock.likes.length,
//         });
//       } else {
//         console.log("Error fetching stock data:", error.message);
//         stockData.push({
//           rel_likes: secondStock.likes.length - firstStock.likes.length,
//         });
//       }

//       res.json({
//         stockData,
//       });
//       return;

//     }

//     console.log("Betweeeeeeen");

//     try {
//       const { symbol, latestPrice } = await getStock(stock);
//       const stockData = { stock: symbol, price: latestPrice };
//       const oneStockData = await saveStock(symbol, like === "true", req.ip);
//       console.log("One Stock Data", oneStockData);

//       res.json({
//           stockData: {
//             stock: symbol,
//             price: latestPrice,
//             likes: oneStockData.likes.length,
//           },
//         })

//     } catch (error) {
//       console.log("Error fetching stock data:", error.message);
//       const likes = like === "true" ? 1 : 0; // Ensure accurate comparison
//       res.status(400).json({ stockData: { error: error.message, likes } });
//       return;
//     }

//   });
// };
