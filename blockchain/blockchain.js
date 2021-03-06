const Block = require("./block")
const { cryptoHash } = require("../util")

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
        if (chain.length <= this.chain.length){
            console.error('The incoming chain must be longer.')
            return
        }    

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid.')
            return
        }
        console.log('replacing chain with ', chain)
        this.chain = chain
    }

    static isValidChain(chain) {
        let validChain = true
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) validChain = false

        for (let i = 1; i < chain.length; i++){
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i]
            
            const lastDifficulty = chain[i-1].difficulty

            const actualLastHash = chain[i-1].hash
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)

            if (lastHash !== actualLastHash || 
                hash !== validatedHash || 
                Math.abs(lastDifficulty - difficulty) > 1) {
                    validChain = false
                }
        }
        return validChain
    }
}

module.exports = Blockchain