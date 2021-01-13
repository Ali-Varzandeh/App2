// Require to import the modules
const { query } = require('express');
const express = require('express')
const app = express()
const port = 3000
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '202022',
  database : 'app_dev' 

});


// Connect to the databasers
connection.connect();
  



// Configuration
app.set('view engine', 'ejs') 

app.set('views', './views')

app.use(express.static('public'))

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

// Middleware
app.use((req,res,next) => {


 // console.log(req)
  next()
})


// Root Routes 

app.get('/', (req, res) => {

  const query = `SELECT PRODUCTS.ID, PRODUCTS.NAME,PRODUCTS.SIZE,PRODUCTS.BRAND, CATEGORIES.CATEGORY_TITLE, CATEGORIES.CATEGORY_SUB, CATEGORIES.CATEGORY_DESCRIPTION 
  FROM PRODUCTS
  INNER JOIN CATEGORIES ON PRODUCTS.CATEGORY_ID=CATEGORIES.ID;`
  connection.query (query, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.render('index', { products: results})
  
  
  });
 
})



// the first argument is the name of the route
// the second argument is the callback function that takes two arguments is req & res
// the res.render takes atlist one arguments the name of the template and the secend argument is data (object literal)

app.get('/about', function (req, res) {
  res.render('about', { about_page: 'about' })
})



app.get('/products', (req, res) => {



connection.query('SELECT * from products', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
  res.render('products', { products: results})


});

})   


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

  //select products for specefic sub category
  //the route is the part of rest API of the application
  app.get('/products/:category_id/:sub_category',(req, res) => {
    console.log(req.params);
    const query = `SELECT PRODUCTS.ID, PRODUCTS.NAME, PRODUCTS.PRO_DESCRIPTION, PRODUCTS.SIZE,PRODUCTS.BRAND, PRODUCTS.COLOUR, CATEGORIES.CATEGORY_TITLE, CATEGORIES.CATEGORY_SUB, CATEGORIES.CATEGORY_DESCRIPTION,PRODUCTS.QUANTITY
    FROM PRODUCTS
    INNER JOIN CATEGORIES ON PRODUCTS.CATEGORY_ID=CATEGORIES.ID
    WHERE CATEGORIES.CATEGORY_SUB='${req.params.sub_category}' AND CATEGORIES.ID=${req.params.category_id};`
    console.log(query);
    connection.query(query,(error, results, fields)  => {
      console.log(error);
      if (error) throw error;
      console.log(results);
      res.render('products',{products: results})
    
    })
   
    
  })
  



app.get('/product/:id', (req, res) => {
 
  connection.query(`SELECT * FROM PRODUCTS WHERE PRODUCTS.ID = ${req.params.id};`,(error, results, fields)   => {
    console.log(error);
    if (error) throw error;
    console.log(results);
    res.render('product',{product: results[0]})
  })
})


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

// adding to the basket
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

// DELETING FROM THE BASKET
app.post('/product/delete/:id', (req, res) => {
  connection.query(`DELETE FROM PRODUCTS_BASKETS WHERE BASKET_ID=1 AND PRODUCT_ID=${req.params.id};`, (err, results, fields) => {
    if (err) throw err;
    res.status(201).redirect(301, '/basket')
;  })
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

