// https://www.here.com/docs/bundle/geocoding-and-search-api-v7-api-reference/page/index.html#/paths/~1geocode/get

import ky from "ky";
import countries from "i18n-iso-countries";

import { GeocoderUnifiedResult } from "../types";
import { Feature, HereResponse } from "./types";
import { createURLSearchParams, getError } from "../utils";

type HereForwardRequestOptions = {
	at?: string;
	in?: string;
	qq?: string;
	types?: string;
	lang?: string;
	limit?: string;
	politicalView?: string;
	show?: string;
	showMapReferences?: string;
	showNavAttributes?: string;
};

const baseUrl = "search.hereapi.com/v1";

export async function forward(
	apiKey: string,
	query: string,
	options: HereForwardRequestOptions = {}
) {
	const params = { q: query, ...options, access_token: apiKey };
	const response = await ky<HereResponse>(
		`https://geocode.${baseUrl}/geocode`,
		{
			searchParams: createURLSearchParams(params),
		}
	).json();

	return response.items.map((feature) => formatResult(feature));
}

function formatResult(feature: Feature) {
	const { address, position, scoring, id } = feature;

	const formatted: GeocoderUnifiedResult = {
		formattedAddress: address.label,
		latitude: position.lat,
		longitude: position.lng,
		country: address.countryName,
		countryCode: countries.alpha3ToAlpha2(address.countryCode),
		state: address.state,
		county: address.county,
		city: address.city,
		zipcode: address.postalCode,
		district: address.district,
		streetName: address.street,
		streetNumber: address.houseNumber,
		building: address.building,
		extra: {
			id,
			confidence:
				"queryScore" in scoring
					? Number.parseFloat(scoring.queryScore.toFixed(2))
					: 0,
		},
	};

	return formatted;
}
