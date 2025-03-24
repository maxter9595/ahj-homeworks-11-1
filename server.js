const express = require("express");
const cors = require("cors");
const { faker } = require("@faker-js/faker");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/messages/unread", (req, res) => {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  const messages = Array.from(
    { length: faker.number.int({ min: 1, max: 3 }) },
    () => ({
      id: faker.string.uuid(),
      from: faker.internet.email(),
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      received: Math.floor(
        faker.date.between({ from: startDate, to: endDate }).getTime() / 1000,
      ),
    }),
  );

  res.json({
    status: "ok",
    timestamp: Math.floor(Date.now() / 1000),
    messages,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
