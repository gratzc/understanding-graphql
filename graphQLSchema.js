
const { gql } = require('apollo-server-express');

const graphQLDefs = `
	type Query {
		categories: [Category]
		category(slug: ID!): Category
		listings: [Listing]
		listing(listingID: ID!): Listing
		photos(listingID: ID!): [Photo]
		photo(listingID: ID!, photoID: ID!): Photo
	}

	type Mutation {
		updateCategory(category: EditCategory) : Category!
		deleteCategory(slug: String!): String!
		updateListing(listing: EditListing) : Listing!
		deleteListing(listingID: String!): String!
		updatePhoto(listingID: String!, photo: EditPhoto) : Photo!
		deletePhoto(listingID: String!, photoID: String!): String!
	}
`

const categoryDefs = `
	type Category {
		slug: ID!
		name: String!
		description: String
		listings: [Listing]
	}

	input EditCategory {
		slug: ID!
		name: String!
		description: String
	}
`;

const listingDef = `
	type Listing {
		listingID: ID!
		name: String!
		description: String
		serialNumber: String
		location: String
		listPrice: Float!
		category: Category!
		photos: [Photo]
	}

	input EditListing {
		listingID: ID!
		name: String!
		description: String
		serialNumber: String
		location: String
		listPrice: Float!
		category: String!
	}
`;


const photosDef = `
	type Photo {
		photoID: ID!
		title: String!
		description: String
		URL: String!
	}

	input EditPhoto {
		photoID: ID!
		title: String!
		description: String
		URL: String!
	}
`;

const typeDefs = gql`
	${graphQLDefs}
	${listingDef}
	${categoryDefs}
	${photosDef}
`;


/*
	EXPORTS --------------------------------------------------------------------------------------------------
*/

module.exports = typeDefs;