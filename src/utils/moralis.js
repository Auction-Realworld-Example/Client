import { Moralis } from "moralis";

function makeQueryBuilder(tableName) {
	const Object = Moralis.Object.extend(tableName);

	let queryBuilder = new Moralis.Query(Object);

	return queryBuilder;
}

export { makeQueryBuilder };
