// https://docs.mapbox.com/api/search/geocoding/#forward-geocoding-with-search-text-input

import ky from "ky";

import { GeocoderUnifiedResult } from "../types";
import { Feature, MapboxResponse } from "./types";
import { createURLSearchParams, getError } from "../utils";

type MapboxForwardRequestOptions = {
	permanent?: boolean;
	autocomplete?: boolean;
	bbox?: number;
	country?: string;
	format?: string;
	language?: string;
	proximity?: string;
	types?: string;
	worldview?: string;
};

const baseUrl = "https://api.mapbox.com/search/geocode/v6";

export async function forward(
	apiKey: string,
	query: string,
	options: MapboxForwardRequestOptions = {}
) {
	const params = { q: query, ...options, access_token: apiKey };
	const response = await ky<MapboxResponse>(`${baseUrl}/forward`, {
		searchParams: createURLSearchParams(params),
	}).json();

	return response.features.map((feature) => formatResult(feature));
}

function formatResult(result: Feature) {
	const { properties, id } = result;
	const { context } = properties;

	const formatted: GeocoderUnifiedResult = {
		formattedAddress: properties.full_address,
		latitude: properties.coordinates.latitude,
		longitude: properties.coordinates.longitude,
		country: context.country?.name,
		countryCode: context.country?.country_code,
		state: context.region?.name,
		city: context.place?.name,
		zipcode: context.postcode?.name,
		district: context.district?.name,
		streetName:
			properties.feature_type === "address"
				? context.address?.street_name
				: undefined,
		streetNumber:
			properties.feature_type === "address"
				? context.address?.address_number
				: undefined,
		neighbourhood: context.neighborhood?.name || context.locality?.name,
		extra: {
			id,
			bbox: properties.bbox ?? undefined,
			match: properties.match_code,
		},
	};

	return formatted;
}
