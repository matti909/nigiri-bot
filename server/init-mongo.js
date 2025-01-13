db = db.getSiblingDB("admin");
db.auth("admin", "password");

db = db.getSiblingDB("customers_db");
db.createCollection("customers");
db.createCollection("orders");
db.createCollection("menu");
