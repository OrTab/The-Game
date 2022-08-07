const hostname = '127.0.0.1';
const port = 4000;
const { app, server } = require('@or-tab/my-server');
app.enableCorsForOrigins(['http://localhost:4001']);

app.get('/', (req, res) => {
    console.log(req.params);
    res.send('hey')
})


app.get('/api/:profileId', (req, res) => {
    console.log(req.query);
    res.send({ massage: `This is coming from server ${JSON.stringify(req.params)}` })
})



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
