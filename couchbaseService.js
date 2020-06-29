/*
	DEPENDENCIES ------------------------------------------------------------------------------------
*/

const CouchbaseService = require('couchbase-service');
const apiSettings = {
    "couchbase": {
        "IPAddress": "localhost",
        "portNumber": "8091",
        "bucket": "default",
        "credentials": {
            "username": "username",
            "password": "password"
        }
    }
};

function getCouchbaseConnection () {
	const couchbaseSettings = apiSettings.couchbase;
	return `couchbase://${couchbaseSettings.IPAddress}:${couchbaseSettings.portNumber}`;
}

function getCouchbaseAuth () {
	const couchbaseSettings = apiSettings.couchbase;
	return couchbaseSettings.credentials;
}

function getCouchbaseBucket () {
	const couchbaseSettings = apiSettings.couchbase;
	return couchbaseSettings.bucket;
}

const couchbaseConfig = getCouchbaseConnection();
const couchbaseAuth = getCouchbaseAuth();
const bucketName = getCouchbaseBucket();

const options = {
	cluster: couchbaseConfig,
	auth: couchbaseAuth,
	atomicCounter: 'enterpriseAtomicCounter',
	operationTimeout: 10000,
	onConnectCallback: (error) => {
		if (error) {
			console.error(`Error occurred during bucket connection: ${error.message}`);
			process.exit(1); // Kill node if this happens, we can't work without
		} else {
			console.info(`Connected to ${bucketName} Bucket`);
		}
	},
	onReconnectCallback: (error, message) => {
		if (error) {
			throw error;
		}
		console.info(message);
	},
};

let couchbaseService;
// Error handling for CouchbaseService instantiation failure
try {
	couchbaseService = new CouchbaseService(bucketName, options);
} catch (e) {
	console.error(e);
	process.exit(1);
}


/*
	FUNCTIONS ---------------------------------------------------------------------------------------
*/

const DataService = {
	get: (documentName, callback) => couchbaseService.getCallback(documentName, callback),
	getPromise: async (documentName) => couchbaseService.getPromise(documentName),
	getMultiPromise: async (documentNames) => couchbaseService.getMultiPromise(documentNames),
	insert: (documentName, data, callback) => couchbaseService.insertCallback(documentName, data, callback),
	insertPromise: (documentName, data) => couchbaseService.insertPromise(documentName, data),
	upsert: (documentName, data, callback) => couchbaseService.upsertCallback(documentName, data, callback),
	upsertPromise: (documentName, data) => couchbaseService.upsertPromise(documentName, data),
	remove: (documentName, callback) => couchbaseService.removeCallback(documentName, callback),
	removePromise: (documentName) => couchbaseService.removePromise(documentName),
	query: (ddoc, name, queryOptions, callback) => couchbaseService.viewQueryCallback(ddoc, name, preProcessQueryOptions(queryOptions), callback),
	queryPromise: (ddoc, name, queryOptions) => couchbaseService.viewQueryPromise(ddoc, name, preProcessQueryOptions(queryOptions)),
	n1qlQueryPromise: (qry) => couchbaseService.n1qlQueryPromise(qry)
};


function upsertDesignDocumentPromise(ddocName, ddocData, publish) {
	couchbaseService.upsertDesignDocumentPromise(ddocName, ddocData, publish);
}


function preProcessQueryOptions(queryOptions) {
	if(queryOptions && !queryOptions.hasOwnProperty('stale')) {
		queryOptions.stale = 'before';
	}
	return queryOptions;
}

function getUsersByType(params) {
	const n1ql = buildN1QL(params);
	return couchbaseService.n1qlQueryPromise(n1ql);
}

function buildN1QL(params) {
	let n1ql = '';
	if(params.hasOwnProperty('role')) {
		n1ql += `(ANY x in roles SATISFIES x = '${params.role}' END)`;
	}
	if(params.hasOwnProperty('institution')) {
		if(n1ql.length) {
			n1ql += ' AND ';
		}
		n1ql += `(ANY x in institutions SATISFIES x = '${params.institution}' END)`;
	}
	n1ql = `SELECT firstName, lastName, email from ${bucketName} WHERE ` + n1ql;

	return n1ql;
}


/*
	EXPORTS -----------------------------------------------------------------------------------------
*/

module.exports = {
	DataService,
	upsertDesignDocumentPromise,
	getUsersByType
};