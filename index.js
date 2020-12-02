// Require to import the modules
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

// Middleware
app.use((req,res,next) => {

 // console.log(req)
  next()
})


// Root Routes 

app.get('/', (req, res) => {
  res.render('index')
})



// this will render the template as html and send it to browser

app.get('/welcome', function (req, res) {
 res.render('index', { name: 'Welcome' })
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
  connection.query('SELECT * from basket', function (error, results, fields) {
    if (error) throw error; //if ther is an error ther stop excution of the callback function.
    console.log(results);
    res.render('basket', { basket: results}) // it take the result of the query and insert to the basket template and generate HTML and send it to the browser 
  });
  
  }) 



app.get('/product/:uuid', (req, res) => {
  res.render('product' , { category: { brand_name:'Canada Gose', colour: 'Black',  name:'Bomber Jacket', size: req.params.size , quantity: req.params.quantity , uuid: req.params.uuid }})
})






app.get('/basket', (req, res) => {
   res.render('basket' , { basket: [{  brand_name:'Canada Gose', order_summary: 'Order summary' , size: req.params.size , quantity: req.params.qty , item_subtotal: req.params.item_subtotal },{  brand_name:'Canada Gose', order_summary: 'Order summary' , size: req.params.size , qty: req.params.qty , item_subtotal: req.params.item_subtotal }]})
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
app.post('/product/:uuid', (req, res) => { 
  console.log ( req.params.uuid ) 
}) 



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

