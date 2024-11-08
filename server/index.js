const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    fetchUserProducts,
    deleteUserProduct,
} = require('./db');

const express = require('express');
const app = express();

app.get('/api/users', async(req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (error) {
        next(error);
    }
});

app.get('/api/products', async(req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch (error) {
        next(error);
    }
});

app.get('/api/users/:id/userProducts', async (req, res, next) => {
    try {
        res.send(await fetchUserProducts(req.params.id));
    } catch (error) {
        next (error);
    }
});

app.post('/api/users/:id/userProducts', async(req, res, next) => {
    try {
        res.status(201).send(await createUserProduct({ user_id: req.params.id, product_id: req.body.product_id}));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/users/:userId/userProducts/:id', async(req, res, next) => {
    try {
        await deleteUserProduct({ id: req.params.id, user_id: req.params.userId });
        res.sendStatus(204);
    } catch (error) {
        next (error);
    }
})

const init = async() => {
    await client.connect();
    console.log('Connected to database');
    await createTables();
    console.log('Tables created');

    const [moe, lucy, ethyl, clothing, furniture, food] = await Promise.all([
        createUser({ username: 'lucy', password: 's3cr3t' }),
        createUser({ username: 'moe', password: 's3cr3t!!' }),
        createUser({ username: 'ethyl', password: 'shhh' }),
        createProduct({ name: 'clothing' }),
        createProduct({ name: 'furniture' }),
        createProduct({ name: 'food' }),
    ]);
    const users = await fetchUsers();
    console.log(users);

    const products = await fetchProducts();
    console.log(products);

    const userProducts = await Promise.all([
        createUserProduct({ user_id: moe.id, product_id: clothing.id }),
        createUserProduct({ user_id: moe.id, product_id: food.id }),
        createUserProduct({ user_id: lucy.id, product_id: furniture.id }),
        createUserProduct({ user_id: ethyl.id, product_id: food.id }),
    ]);
    
    console.log(await fetchUserProducts(moe.id));
    await deleteUserProduct(userProducts[0].id);
    console.log(await fetchUserProducts(moe.id));

    console.log(`curl localhost:3000/api/users/${lucy.id}/userProducts`);

    console.log(`CURL -X POST localhost:3000/api/users/${lucy.id}/userProducts -d '{"product_id":"${clothing.id}"}' -H 'Content-Type:application/json'`);

    console.log(`curl -X DELETE localhost:3000/api/users/${lucy.id}/userProducts/${userProducts[3].id}`);
  
    console.log('data seeded');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
}

init();