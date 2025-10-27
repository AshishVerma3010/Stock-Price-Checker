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
