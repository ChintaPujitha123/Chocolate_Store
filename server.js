// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

// ---------------------------------------------
//  SERVE FRONTEND FILES
// ---------------------------------------------
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve Images Folder Also
app.use("/images", express.static(path.join(__dirname, "../frontend/images")));


// ---------------------------------------------
//  DATABASE HELPERS
// ---------------------------------------------
function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}


// ---------------------------------------------
//  API ROUTES
// ---------------------------------------------

// Get chocolates
app.get("/api/chocolates", async (req, res) => {
    try {
        const rows = await allAsync("SELECT * FROM chocolates ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add chocolate
app.post("/api/chocolates", async (req, res) => {
    try {
        const { name, price, img } = req.body;
        if (!name || !price || !img)
            return res.status(400).json({ error: "Missing fields" });

        const result = await runAsync(
            "INSERT INTO chocolates (name, price, img) VALUES (?, ?, ?)",
            [name, price, img]
        );

        const created = await getAsync("SELECT * FROM chocolates WHERE id = ?", [
            result.id,
        ]);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete chocolate
app.delete("/api/chocolates/:id", async (req, res) => {
    try {
        await runAsync("DELETE FROM chocolates WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get cart
app.get("/api/cart", async (req, res) => {
    try {
        const rows = await allAsync(`
            SELECT cart.id AS cart_id, cart.quantity, chocolates.*
            FROM cart
            JOIN chocolates ON cart.chocolate_id = chocolates.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add to cart
app.post("/api/cart", async (req, res) => {
    try {
        const { chocolate_id, quantity = 1 } = req.body;

        const existing = await getAsync(
            "SELECT * FROM cart WHERE chocolate_id = ?",
            [chocolate_id]
        );

        if (existing) {
            await runAsync(
                "UPDATE cart SET quantity = quantity + ? WHERE chocolate_id = ?",
                [quantity, chocolate_id]
            );

            const updated = await getAsync(
                "SELECT * FROM cart WHERE chocolate_id = ?",
                [chocolate_id]
            );
            return res.status(200).json(updated);
        }

        const result = await runAsync(
            "INSERT INTO cart (chocolate_id, quantity) VALUES (?, ?)",
            [chocolate_id, quantity]
        );

        const created = await getAsync("SELECT * FROM cart WHERE id = ?", [
            result.id,
        ]);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove item from cart
app.delete("/api/cart/:id", async (req, res) => {
    try {
        await runAsync("DELETE FROM cart WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ---------------------------------------------
//  DEFAULT ROUTE (Catch-All → Serve index.html)
// ---------------------------------------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// ---------------------------------------------
//  START SERVER
// ---------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
