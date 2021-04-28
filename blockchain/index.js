const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain.js')
const PubSub = require('../app/pubsub')
const { response } = require('express')

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const {data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

const syncChains = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with ', rootChain);
            blockchain.replaceChain(rootChain);
        } else {
            console.error(`ERROR: unable to replace chain on a sync`, error)
        }
    })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT) {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
    syncChains();
});