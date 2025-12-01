-- migrations.sql
-- Create chocolates table
CREATE TABLE IF NOT EXISTS chocolates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  img TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create cart table (simple: stores chocolate_id and quantity)
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chocolate_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chocolate_id) REFERENCES chocolates(id) ON DELETE CASCADE
);

-- seed data (a few chocolates)
INSERT INTO chocolates (name, price, img) VALUES
  ('Milk Chocolate', '₹50', 'images/chocolate1.jpg'),
  ('Dark Chocolate', '₹60', 'images/chocolate2.jpg'),
  ('White Chocolate', '₹55', 'images/chocolate3.jpg'),
  ('Hazelnut Chocolate', '₹70', 'images/chocolate4.jpg'),
  ('Caramel Chocolate', '₹65', 'images/chocolate5.jpg');

