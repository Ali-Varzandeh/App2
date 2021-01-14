
const basketRoute = (app, connection) => {
    app.get('/basket', (req, res) => {
        //send the query to the database
          const query = `SELECT PRODUCTS.NAME,PRODUCTS.ID,PRODUCTS.SIZE,PRODUCTS.BRAND,PRODUCTS.COLOUR,PRODUCTS.QUANTITY,PRODUCTS.PRO_DESCRIPTION
                          FROM PRODUCTS
                          INNER JOIN PRODUCTS_BASKETS ON PRODUCTS.ID= PRODUCTS_BASKETS.PRODUCT_ID
                          WHERE PRODUCTS_BASKETS.BASKET_ID= 1;`
          connection.query(query, function (error, results, fields) {
            if (error) throw error; //if ther is an error ther stop excution of the callback function.
            console.log(results);
            res.render('basket', { basket: results}) // it take the result of the query and insert to the basket template and generate HTML and send it to the browser 
          });  
        })
}

const userRoute = (app, connection) => {
    app.get('/user', (req, res) => {
        connection.query( 'SELECT USER_NAME, FIRST_NAME, SURNAME FROM USER WHERE USER_ID = 1'  ,  (err, results, fields) =>{
          if (err) throw err;
          if (results[0] == undefined) throw new Error("No user in the DB");
          // console.log('err: ', err); 
          console.log('results: ', results);
          // console.log('fields: ', fields);
          res.render('user' , { user: results[0]})
        }) 
        
      })
}

// adding to the basket
const addToBasketRoute = (app, connection) => {
    app.post('/product/:id', (req, res) => { 
        console.log ( req.params.id ) 
        const query= `insert into PRODUCTS_BASKETS (BASKET_ID, PRODUCT_ID) VALUES (1,${req.params.id})` 
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
    app.post('/product/delete/:id', (req, res) => {
        connection.query(`DELETE FROM PRODUCTS_BASKETS WHERE BASKET_ID=1 AND PRODUCT_ID=${req.params.id};`, (err, results, fields) => {
        if (err) throw err;
        res.status(201).redirect(301, '/basket');
      })
    })
}

const routes = [basketRoute, userRoute, addToBasketRoute, deleteFromBasketRoute]

module.exports = routes;