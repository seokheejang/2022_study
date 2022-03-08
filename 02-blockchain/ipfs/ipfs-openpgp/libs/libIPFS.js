const { create } = require('ipfs-http-client');
const all = require('it-all');
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const config = require('../config/config.json');


const network = 'main';
let client = undefined;

if (network === 'main') {
    client = create({
        host: config.main.host,
        port: config.main.port,
        protocol: config.main.protocol
    })
} else if (network === 'private') {
    client = create({
        host: config.private.host,
        port: config.private.port,
        protocol: config.private.protocol
    })
}

const ipfsAdd = async (obj) => {
    try {
        const cid = await client.add(obj);
        return cid;
    } catch (err) {
        console.log(`ipfsAdd error: ${err}`);
        return null;
    }
}

const ipfsCat = async (cid) => {
    try {
        const res = uint8ArrayConcat(await all(client.cat(cid)));
        return uint8ArrayToString(res);
    } catch (err) {
        console.log(`ipfsCat error: ${err}`);
        return null;
    }
}

module.exports = {
    ipfsAdd,
    ipfsCat
}