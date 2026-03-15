const db = require("./db_conn");


async function getOrCreateInterest(name) {

  const [rows] = await db.execute(
    `SELECT interest_id FROM interests WHERE name = ?`,
    [name]
  );

  if (rows.length > 0) return rows[0].interest_id;

  const [result] = await db.execute(
    `INSERT INTO interests (name) VALUES (?)`,
    [name]
  );

  return result.insertId;
}


async function getOrCreateLocation(name) {

  const [rows] = await db.execute(
    `SELECT location_id FROM locations WHERE name = ?`,
    [name]
  );

  if (rows.length > 0) return rows[0].location_id;

  const [result] = await db.execute(
    `INSERT INTO locations (name) VALUES (?)`,
    [name]
  );

  return result.insertId;
}


/*
Create User
*/
async function createUser(user) {

  if (user.interests && user.interests.length > 3)
    throw new Error("Maximum 3 interests allowed");

  if (user.locations && user.locations.length > 3)
    throw new Error("Maximum 3 locations allowed");


  const sql = `
    INSERT INTO users
    (first_name, last_name, email, address, city, postal_code, country, stripe_customer_id, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user.firstName,
    user.lastName,
    user.email,
    user.address,
    user.city,
    user.postalCode,
    user.country,
    user.stripeCustomerId,
    user.password
  ];

  const [result] = await db.execute(sql, values);

  const userId = result.insertId;


  if (user.interests) {

    for (const interest of user.interests) {

      const interestId = await getOrCreateInterest(interest);

      await db.execute(
        `INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)`,
        [userId, interestId]
      );
    }
  }


  if (user.locations) {

    for (const location of user.locations) {

      const locationId = await getOrCreateLocation(location);

      await db.execute(
        `INSERT INTO user_locations (user_id, location_id) VALUES (?, ?)`,
        [userId, locationId]
      );
    }
  }

  return userId;
}


/*
Retrieve user
*/
async function getUserByEmail(email) {

  const [rows] = await db.execute(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) return null;

  const user = rows[0];


  const [interests] = await db.execute(
    `
    SELECT i.name
    FROM interests i
    JOIN user_interests ui ON i.interest_id = ui.interest_id
    WHERE ui.user_id = ?
    `,
    [user.user_id]
  );


  const [locations] = await db.execute(
    `
    SELECT l.name
    FROM locations l
    JOIN user_locations ul ON l.location_id = ul.location_id
    WHERE ul.user_id = ?
    `,
    [user.user_id]
  );


  user.interests = interests.map(i => i.name);
  user.locations = locations.map(l => l.name);

  return user;
}


/*
Update user
*/
async function updateUser(email, updatedUser) {

  const [rows] = await db.execute(
    `SELECT user_id FROM users WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) return 0;

  const userId = rows[0].user_id;


  await db.execute(
    `
    UPDATE users
    SET
      first_name = ?,
      last_name = ?,
      address = ?,
      city = ?,
      postal_code = ?,
      country = ?,
      stripe_customer_id = ?
    WHERE user_id = ?
    `,
    [
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.address,
      updatedUser.city,
      updatedUser.postalCode,
      updatedUser.country,
      updatedUser.stripeCustomerId,
      userId
    ]
  );


  if (updatedUser.interests) {

    if (updatedUser.interests.length > 3)
      throw new Error("Maximum 3 interests allowed");

    await db.execute(
      `DELETE FROM user_interests WHERE user_id = ?`,
      [userId]
    );

    for (const interest of updatedUser.interests) {

      const interestId = await getOrCreateInterest(interest);

      await db.execute(
        `INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)`,
        [userId, interestId]
      );
    }
  }


  if (updatedUser.locations) {

    if (updatedUser.locations.length > 3)
      throw new Error("Maximum 3 locations allowed");

    await db.execute(
      `DELETE FROM user_locations WHERE user_id = ?`,
      [userId]
    );

    for (const location of updatedUser.locations) {

      const locationId = await getOrCreateLocation(location);

      await db.execute(
        `INSERT INTO user_locations (user_id, location_id) VALUES (?, ?)`,
        [userId, locationId]
      );
    }
  }

  return 1;
}


/*
Delete user
*/
async function deleteUser(email) {

  const [result] = await db.execute(
    `DELETE FROM users WHERE email = ?`,
    [email]
  );

  return result.affectedRows;
}

/*
Login to system
*/
async function login(email, password) {

  const [result] = await db.execute(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password]
  );

  return result.affectedRows;
}

module.exports = {
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  login
};
