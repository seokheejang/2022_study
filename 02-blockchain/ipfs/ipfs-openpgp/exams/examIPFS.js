const { ipfsAdd, ipfsCat } = require('../libs/libIPFS.js');
const { exportFile, importFile } = require('../libs/libOpenPGPKeyFile.js');

const proc_ipfsAdd = async () => {
    try {
        if (process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        console.log(`.................file: [${process.argv[3]}]`);
        const file = process.argv[3];  // test data : ../data/hello.txt.pgp
        const obj = await importFile(file);
        const result = await ipfsAdd(obj);
        console.log(result);
        return true;
    } catch (err) {
        console.log(`proc_ipfsAdd error: ${err}`);
        return false;
    }
}

const proc_ipfsCat = async () => {
    try {
        if (process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        console.log(`...................cid: [${process.argv[3]}]`);
        const cid = process.argv[3];  // test data : QmRJzMS1arCycWd2Gs1CjK2ZoUzJxzAEir4BY88kskWqjM
        const result = await ipfsCat(cid);
        console.log(result);
        return true;
    } catch (err) {
        console.log(`proc_ipfsCat error: ${err}`);
        return false;
    }
}

(async () => {
    try {
        if (process.argv.length < 3) {
            throw new Error("Invalid Parameters");
        }
        category = process.argv[2];
        switch (category) {
            case "add": {await proc_ipfsAdd(process.argv[3]);break;}
            case "cat": {await proc_ipfsCat(process.argv[3]);break;}
        }
        process.exit(0);
    } catch (err) {
        console.log(`main error: ${err}`);
        process.exit(1);
    }
})();