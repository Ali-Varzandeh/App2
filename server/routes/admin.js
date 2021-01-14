const { v4: uuidv4 }  = require('uuid')

const adminRootRoute = (app, connection) => {
        app.get('/admin', (req, res) => {
            connection.query('SELECT * FROM PRODUCTS', function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                res.render('admin/index', {products: results})
        });
    })
}

const adminRemoveProductRoute = (app, connection) => {
    app.post('/admin/product/delete/:id', (req, res) => {
        connection.query(`DELETE FROM PRODUCTS WHERE ID=${req.params.id}`, (err, results, fields) => {
            if(err) throw err;
            res.status(201).redirect(301, '/admin')
        })
    })
}

// add a new product
const adminAddProductRoute = (app, connection) => {
    app.post('/admin/product/add', (req, res) => {

        console.log(`adminAddProductRoute BODY: ${req.body}`)

        // prepare the new product
        // || means OR (a logical operator)
        // this is a trick to have default data for a product
        // const {var_name} = {var_name: value} <<< JS Destructuring
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        const {category_id, name, brand, size, colour, quantity, pro_description, image, uuid} = {
            category_id: req.body.category_id || 1, 
            name: req.body.name || "Test product", 
            brand: req.body.brand || "Test brand", 
            size: req.body.size || 44, 
            colour: req.body.colour || "Test colour", 
            quantity: req.body.quantity || 1, 
            pro_description: req.body.pro_description || "Test description", 
            image: req.body.image || "/images/test_image.jpg", 
            uuid: uuidv4()
        }
        console.log("-------------")
        console.log(pro_description)
        console.log(typeof pro_description)
        console.log("-------------")
        const query = `
        INSERT INTO PRODUCTS ( CATEGORY_ID, NAME, BRAND, SIZE, COLOUR, QUANTITY, PRO_DESCRIPTION, IMAGE, UUID)
        VALUES (${category_id}, '${name}', '${brand}', ${size}, '${colour}', ${quantity}, '${pro_description}', '${image}', '${uuid}');
        `
        connection.query(query, (err, results, fields) => {
            if(err) throw err;
            res.status(201).redirect(301, '/admin')
        })
    })
}

const routes = [adminRootRoute, adminRemoveProductRoute, adminAddProductRoute]

module.exports = routes;