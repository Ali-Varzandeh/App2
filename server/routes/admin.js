const { v4: uuidv4 } = require("uuid");

// middleware for authorization
// checks if the user can access ("is authorized") a certain route
const adminIsAuthorized = (req, res, next) => {
  //https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_client_errors
  //403 -> Forbidden (unAuthorized)
  // && -> AND
  // if user loggedIn AND user is admin, then pass
  console.log("ADMIN AUTH");
  console.log(req.user?.IS_ADMIN);
  console.log("/ADMIN AUTH");
  if (req.user && req.user?.IS_ADMIN === 1) {
    next();
  } else {
    req.flash("error", "You are not authorized to access this page.");
    return res.status(403).redirect(301, "/");
  }
};

const adminRootRoute = (app, connection) => {
  app.get("/admin", adminIsAuthorized, (req, res) => {
    console.log("ADMIN route");
    connection.query(
      "SELECT * FROM PRODUCTS",
      function (error, results, fields) {
        if (error) throw error;
        // console.log(results);
        res.render("admin/index", {
          message: req.flash("error"),
          user: req.user,
          products: results,
        });
      }
    );
  });
};

// EDIT A PRODUCT IN THE DB
const adminEditProductRoute = (app, connection) => {
  app.post("/admin/product/edit/:id", adminIsAuthorized, (req, res) => {
    const {
      id,
      name,
      brand,
      size,
      colour,
      quantity,
      pro_description,
      image,
    } = req.params;
    const query = `
    UPDATE PRODUCTS
    SET NAME = ${name}, BRAND = ${brand}, SIZE = ${size}, COLOUR = ${colour}, QUANTITY = ${quantity}, PRO_DESCRIPTION = ${pro_description}, IMAGE = ${image}
    WHERE ID=${id}`;
    connection.query(query, (err, results, fields) => {
      if (err) throw err;
      res.status(201).redirect(301, "/admin");
    });
  });
};

// DELETE A PRODUCT IN THE DB
const adminRemoveProductRoute = (app, connection) => {
  app.post("/admin/product/delete/:id", adminIsAuthorized, (req, res) => {
    connection.query(
      `DELETE FROM PRODUCTS WHERE ID=${req.params.id}`,
      (err, results, fields) => {
        if (err) throw err;
        res.status(201).redirect(301, "/admin");
      }
    );
  });
};

// add a new product
const adminAddProductRoute = (app, connection) => {
  app.post("/admin/product/add", adminIsAuthorized, (req, res) => {
    console.log(`adminAddProductRoute BODY: ${req.body}`);

    // prepare the new product
    // || means OR (a logical operator)
    // this is a trick to have default data for a product
    // const {var_name} = {var_name: value} <<< JS Destructuring
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const {
      category_id,
      name,
      brand,
      size,
      colour,
      quantity,
      pro_description,
      image,
      uuid,
    } = {
      category_id: req.body.category_id || 1,
      name: req.body.name || "Test product",
      brand: req.body.brand || "Test brand",
      size: req.body.size || 44,
      colour: req.body.colour || "Test colour",
      quantity: req.body.quantity || 1,
      pro_description: req.body.pro_description || "Test description",
      image: req.body.image || "/images/test_image.jpg",
      uuid: uuidv4(),
    };
    console.log("-------------");
    console.log(pro_description);
    console.log(typeof pro_description);
    console.log("-------------");
    const query = `
        INSERT INTO PRODUCTS ( CATEGORY_ID, NAME, BRAND, SIZE, COLOUR, QUANTITY, PRO_DESCRIPTION, IMAGE, UUID)
        VALUES (${category_id}, '${name}', '${brand}', ${size}, '${colour}', ${quantity}, '${pro_description}', '${image}', '${uuid}')
        `;
    connection.query(query, (err, results, fields) => {
      if (err) throw err;
      res.status(201).redirect(301, "/admin");
    });
  });
};

const routes = [
  adminRootRoute,
  adminEditProductRoute,
  adminRemoveProductRoute,
  adminAddProductRoute,
];

module.exports = routes;
