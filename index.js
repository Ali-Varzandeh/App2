// Require to import the modules
const { query } = require('express');
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const session = require('express-session')
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '202022',
  database : 'app_dev' 

});
const routes = require('./server/routes.js')

// Connect to the databasers
connection.connect();
  
// Configuration STARTS--------
app.set('view engine', 'ejs') 
app.set('views', './views')
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use(bodyParser.urlencoded({ extended: true }));
// session
const sess = {
  secret: '48rh8es9hffhs94h89rhsfisdhh498h4hfskhkfh4h49h4hsk.,',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))
// ------configuration ENDS

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

// EXECUTE ALL ROUTES 
routes.forEach(routesGroup => {
  routesGroup.forEach(route => route(app, connection))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

