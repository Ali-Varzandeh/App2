const passport = require('passport')

// middleware for authorization
// checks if the user can access ("is authorized") a certain route
const userIsAuthorized = (req,res,next) => { 
  //https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_client_errors
  //403 -> Forbidden (unAuthorized)
  if (!req.user) { 
    req.flash("error", "You are not authorized to access this page.")
    return res.status(403).redirect(301, '/')
  }
  next();
}
// passport.authorize('local', { failureRedirect: '/' }, (req, res, msg) => { 
//   console.log(msg)
// })

const basketRoute = (app, connection) => {
    app.get('/basket', userIsAuthorized, (req, res) => {
        //send the query to the database
        const basket_id = req.user.ID;
          const query = `SELECT PRODUCTS.NAME,PRODUCTS.ID,PRODUCTS.SIZE,PRODUCTS.BRAND,PRODUCTS.COLOUR,PRODUCTS.QUANTITY,
                                        PRODUCTS.PRO_DESCRIPTION, PRODUCTS_BASKETS.ID AS PRODUCTS_BASKETS_ID
                          FROM PRODUCTS
                          INNER JOIN PRODUCTS_BASKETS ON PRODUCTS.ID= PRODUCTS_BASKETS.PRODUCT_ID
                          WHERE PRODUCTS_BASKETS.BASKET_ID= ${basket_id};`
          connection.query(query, function (error, results, fields) {
            if (error) throw error; //if ther is an error ther stop excution of the callback function.
            console.log(results);
            res.render('basket', { message: req.flash("error"), user: req.user,basket: results}) // it take the result of the query and insert to the basket template and generate HTML and send it to the browser 
          });  
        })
}



const userRoute = (app, connection) => {
    app.get('/user', userIsAuthorized, (req, res) => {
      const user_id = req.user.ID;
      const queryUser = `SELECT USERS.USER_NAME, USERS.FIRST_NAME, USERS.LAST_NAME, USERS.TEL, USERS.EMAIL FROM USERS WHERE USERS.ID=${user_id};` 
      const queryOrders = `
      SELECT ORDERS.ID AS ORDER_ID, ORDERS.SHIPPING_DATE, ORDERS.ORDER_DATE
      FROM USERS
      INNER JOIN ORDERS ON ORDERS.USER_ID=USERS.ID
      WHERE USERS.ID= ${user_id};
      `
      connection.query(queryUser,  (err, userResults, fields) =>{
        if (err) throw err;
        if (userResults[0] == undefined) throw new Error("No user in the DB");
        // console.log('userResults: ', userResults);

        connection.query(queryOrders, (err, ordersResults, fields) =>{
          if (err) throw err;
          // console.log('ordersResults: ', ordersResults);

          res.render('user' , { message: req.flash("error"), user: req.user, orders: ordersResults })

        })
        })
      }) 
      
    
}

// make an order
// transaction (all or nothing)
// 1. Create an order 
// 2. Copy products from ProductsBaskets to ProductsOrders
// 3. Clean (empty) the user's Basket
const createOrderRoute = (app, connection) => {
  app.post('/order', userIsAuthorized, (req, res) => {
    const user_id = req.user.ID;
    const queryMakeOrder = `INSERT INTO ORDERS (SHIPPING_DATE, USER_ID) VALUES ('${req.body.shipping_date}', ${user_id})`

    const basket_id = user_id;
    const queryEmptyBasket = `DELETE FROM PRODUCTS_BASKETS WHERE BASKET_ID = ${basket_id};`
    
    // transaction starts and either succeeds fully or fails
    connection.beginTransaction((err) => {
      if (err) { throw err; }

      // THE FIRST QUERY
      connection.query(queryMakeOrder, (error, results, fields) => {
        if (error) {
          // on error, just rollback to the previous state (the query won't get executed)
          return connection.rollback(() => {
            throw error;
          });
        }

        // get the newly created order id (insertId)
        const order_id = results.insertId
        const queryAddProductsToOrder = `
        INSERT INTO PRODUCTS_ORDERS (PRODUCT_ID, ORDER_ID)
        SELECT PRODUCTS_BASKETS.PRODUCT_ID, ${order_id}
        FROM PRODUCTS_BASKETS
        WHERE PRODUCTS_BASKETS.BASKET_ID=${basket_id};
        `
     
        // THE SECOND QUERY
        connection.query(queryAddProductsToOrder, (error, results, fields) => {
          if (error) {
            return connection.rollback(() => {
              throw error;
            });
          }
      
          // THE THIRD QUERY
          connection.query(queryEmptyBasket, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                throw error;
              });
            }

            // IF OK, THEN COMMIT QUERIES
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  throw err;
                });
              }

              // FINAL RESPONSE
              res.status(201).redirect(301, '/')  // 201 -> resource created; 301 -> redirect
            });
          });
        });
      });
    });
  })
}

// adding to the basket
const addToBasketRoute = (app, connection) => {
    app.post('/product/:id', userIsAuthorized, (req, res) => { 
        console.log ( req.params.id ) 
        const basket_id = req.user.ID;
        const query= `insert into PRODUCTS_BASKETS (BASKET_ID, PRODUCT_ID) VALUES (${basket_id}, ${req.params.id})` 
        connection.query( query ,  (err, results, fields) =>{
        if (err) throw err;
        console.log('err: ', err); 
        console.log('results: ', results);
        //status 201 means resors created (put the product into the basket) redirect to rute raot 301 means redirctions 
        res.status(201).redirect(301, `/product/${req.params.id}`);
        
        }) 
    }) 
}
  
// DELETING FROM THE BASKET
const deleteFromBasketRoute = (app, connection) => {
    app.post('/product/delete/:products_baskets_id', userIsAuthorized, (req, res) => {
        const basket_id = req.user.ID;
        const query = `DELETE FROM PRODUCTS_BASKETS WHERE BASKET_ID=${basket_id} AND ID=${req.params.products_baskets_id};`
        connection.query(query, (err, results, fields) => {
          if (err) throw err;
          res.status(201).redirect(301, '/basket');
      })
    })
}


const loginRoute = (app, connection) => {
  app.get('/login', (req, res) => {
    res.render('login', { user: req.user, message: req.flash('error')})
  })
}

// logs in the user
const loginPostRoute = (app, connection) => {
  app.post('/login', passport.authenticate('local', { successRedirect: '/user',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }))
}

// logs out the loggedIn user
const logoutRoute = (app, connection) => {
  app.post('/logout', userIsAuthorized, (req, res) => {
    req.logout();
    res.status(200).redirect(301, '/');
  })
}

// shows the form to sign up
const signupRoute = (app, connection) => {
  app.get('/signup', (req, res) => {
    res.render('signup', { user: req.user, message: req.flash('error')})
  })
}

// signs a new user up
const signupPostRoute = (app, connection) => {
  app.post('/signup', (req, res) => {
    const queryNewUser = `INSERT INTO USERS (USER_NAME, PASSWORD) 
                               VALUES ('${req.body.username}', '${req.body.password}');`
    connection.query(queryNewUser, (err, results, fields) => {
      if (err) throw err;
      const user_id = results.insertId;
      const queryNewBasket = `INSERT INTO BASKETS (USER_ID) VALUES (${user_id});`
      connection.query(queryNewBasket, (err, results2, fields) => {
        if (err) throw err;
        res.status(201).redirect(301, '/login');
      })
    })
  })
}




const routes = [
  basketRoute, userRoute, createOrderRoute, addToBasketRoute, deleteFromBasketRoute,
  loginRoute, loginPostRoute, logoutRoute, signupPostRoute, signupRoute
]

module.exports = routes;