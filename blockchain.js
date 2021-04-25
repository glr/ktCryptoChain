const Block = require("./block")
const cryptoHash = require("./crypto-hash")

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        })
        this.chain.push(newBlock)
    }

    replaceChain(chain) {
        if (chain.length > this.chain.length && Blockchain.isValidChain(chain)) this.chain = chain
    }

    static isValidChain(chain) {
        let validChain = true
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) validChain = false

        for (let i = 1; i < chain.length; i++){
            const {timestamp, lastHash, hash, data} = chain[i]
            const actualLastHash = chain[i-1].hash
            const validatedHash = cryptoHash(timestamp, lastHash, data)

            if (lastHash !== actualLastHash || hash !== validatedHash) validChain = false
        }
        return validChain
    }
}

module.exports = Blockchain