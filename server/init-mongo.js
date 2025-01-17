db = db.getSiblingDB("admin");
db.auth("admin", "password");

db = db.getSiblingDB("customers_db");
db.createCollection("customers");
db.createCollection("orders");
db.createCollection("menu");

db.orders.insertMany([
  {
    id: "o1",
    items: [
      {
        id: "1",
        details: { name: "Roll de Salmón", price: 200 },
        quantity: 2,
      },
      {
        id: "2",
        details: { name: "Nigiri de Atún", price: 150 },
        quantity: 3,
      },
    ],
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: "o2",
    items: [
      {
        id: "3",
        details: { name: "Combo Especial", price: 500 },
        quantity: 1,
      },
    ],
    createdAt: new Date(),
    status: "completed",
  },
]);
