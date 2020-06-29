/*
	DEPENDENCIES ------------------------------------------------------------------------------------------------------
*/

const { getPromise, n1qlQueryPromise, upsertPromise, removePromise } = require('./couchbaseService').DataService;
const bucketName = `default`
var cachecategories = {};
/*
	CATEGORY QUERIES --------------------------------------------------------------------------------------------------
*/

async function categories() {
	const categoriesQuery = `SELECT ${bucketName}.*
		FROM ${bucketName} WHERE doctype = 'category'`;
	try {
		return await n1qlQueryPromise(categoriesQuery);
	} catch (e) {
		throw new Error(`Could not return data with ${categoriesQuery}`);
	}
}


async function category(parent, data) {
	try {
		return await getPromise(`category::${data.slug}`);
	} catch (e) {
		throw new Error(`Category not found named ${data.slug}`);
	}
}


/*
	CATEGORY MUTATIONS --------------------------------------------------------------------------------------------------
*/

async function updateCategory(parent, data) {
	try {
		data.category.doctype = 'category';
		await upsertPromise(`category::${data.category.slug}`, data.category);
		return data.category;
	} catch (e) {
		throw new Error(`Error editing category ${data.category.slug}: ${e.message}`);
	}
}


async function deleteCategory(parent, data) {
	try {
		const categoryDocName = `category::${data.slug}`;
		await removePromise(`category::${data.slug}`);
		return `Successfully removed ${categoryDocName}`;
	} catch (e) {
		throw new Error(`Error deleting category ${data.slug}: ${e.message}`);
	}
}


/*
	LISTING QUERIES --------------------------------------------------------------------------------------------------
*/

async function listings(parent,data) {
	let listingsQuery = `SELECT ${bucketName}.*
		FROM ${bucketName} WHERE doctype = 'listing'`;
	if(data.category) {
		listingsQuery += ` AND category = '${data.category}'`
	}
	try {
		return await n1qlQueryPromise(listingsQuery);
	} catch (e) {
		throw new Error(`Could not return data with ${listingsQuery}`);
	}
}


async function listing(parent, data) {
	try {
		return await getPromise(`listing::${data.listingID}`);
	} catch (e) {
		throw new Error(`Listing not found named ${data.listingID}`);
	}
}


/*
	LISTING MUTATIONS --------------------------------------------------------------------------------------------------
*/

async function updateListing(parent, data) {
	try {
		data.listing.doctype = 'listing';
		await upsertPromise(`listing::${data.listing.listingID}`, data.listing);
		return data.listing;
	} catch (e) {
		throw new Error(`Error editing listing ${data.listing.listingID}: ${e.message}`);
	}
}


async function deleteListing(parent, data) {
	try {
		const listingDocName = `listing::${data.listingID}`;
		await removePromise(`listing::${data.listingID}`);
		return `Successfully removed ${listingDocName}`;
	} catch (e) {
		throw new Error(`Error deleting listing ${data.listingID}: ${e.message}`);
	}
}


/*
	PHOTOS QUERIES --------------------------------------------------------------------------------------------------
*/

async function photos(parent, data) {
	try {
		const listing = await getPromise(`listing::${data.listingID}`);
		return await listing.photos;
	} catch (e) {
		throw new Error(`Could not return photos data for listing ${data.listingID}: ${e.message}`);
	}
}


async function photo(parent, data) {
	try {
		const listing = await getPromise(`listing::${data.listingID}`);
		const cls = listing.photos.find(c => c.photoID === data.photoID);

		if (!cls) {
			throw new Error(`Photo ${data.photoID} not found on Listing ${data.listingID}`);
		} else {
			return cls;
		}
	} catch (e) {
		throw new Error(`Could not return Photo data for listing ${data.listingID}, Photo ${data.photoID}: ${e.message}`);
	}
}


/*
	PHOTOS MUTATIONS --------------------------------------------------------------------------------------------------
*/

async function updatePhoto(parent, data) {
	try {
		const listingDocName = `listing::${data.listingID}`;
		const listing = await getPromise(listingDocName);

		if (!listing.photos) listing.photos = [];

		const index = listing.photos.findIndex(c => c.photoID === data.photo.photoID);

		if (index === -1) {
			listing.photos.push(data.photo);
		} else {
			listing.photos[index] = data.photo;
		}

		await upsertPromise(listingDocName, listing);

		return data.photo;
	} catch (e) {
		throw new Error(`Could not update Photo ${data.photo.photoID.toLowerCase()} to listing ${data.listingID}: ${e.message}`);
	}
}


async function deletePhoto(parent, data) {
	try {
		const listingDocName = `listing::${data.listingID}`;
		const listing = await getPromise(listingDocName);

		const index = listing.photos.findIndex(c => c.photoID === data.photoID);

		if (index === -1) {
			throw new Error(`Photo ${data.photoID} not found on Listing ${data.listingID}`);
		}

		listing.photos.splice(index, 1);

		await upsertPromise(listingDocName, listing);

		return `Photo ${data.photoID} removed from Listing ${data.listingID}`;
	} catch (e) {
		throw new Error(`Could not delete Photo ${data.photoID.toLowerCase()} to listing ${data.listingID}: ${e.message}`);
	}
}


/*
	EXPORTS --------------------------------------------------------------------------------------------------
*/

module.exports = {
	Query: {
		category,
		categories,
		listing,
		listings,
		photo,
		photos,
	},
	Mutation: {
		updateCategory,
		deleteCategory,
		updateListing,
		deleteListing,
		updatePhoto,
		deletePhoto,
	},
	Category: {
		listings: parent => listings(parent, { category: parent.slug })
	},
	Listing: {
		async category(parent) {return await category(parent, { slug: parent.category });},
		photos: parent => photos(parent, { listingID: parent.listingID })
	},
};