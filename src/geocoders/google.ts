// https://developers.google.com/maps/documentation/geocoding/requests-geocoding?hl=fr

import ky from "ky";
import { createURLSearchParams, snakeToCamel } from "../utils";
import { Feature, GoogleResponse } from "../types/google";
import { GeocoderUnifiedResult } from "../types/common";

type GoogleForwardRequestOptions = {
  bounds?: string;
  language?: string;
  region?: string;
  components?: string;
  extra_computations?: string;
};

type Components = {
  country?: string;
  countryCode?: string;
  administrativeAreaLevel1?: string;
  administrativeAreaLevel2?: string;
  administrativeAreaLevel3?: string;
  locality?: string;
  postalTown?: string;
  postalCode?: string;
  route?: string;
  streetNumber?: string;
  [key: string]: unknown;
};

const baseUrl = "https://maps.googleapis.com/maps/api";

export async function GoogleForwardGeocode(
  apiKey: string,
  query: string,
  language?: string,
  country?: string,
  limit?: number,
  options?: GoogleForwardRequestOptions,
) {
  const { url, searchParams } = getUrlAndSearchParams(
		apiKey,
		query,
		language,
		country,
		limit,
		options
  );

  const response = await ky<GoogleResponse>(url, {
    searchParams
  }).json();

  return response.results.map((feature) => formatResult(feature));
}

function getUrlAndSearchParams(
	apiKey: string,
	query: string,
	language?: string,
	country?: string,
	limit?: number,
	options?: GoogleForwardRequestOptions
) {
	options = options || {};
	let params = { address: query, ...options, key: apiKey };

	if (language) {
		params = { ...params, language };
	}

	if (country) {
		params = { ...params, region: country };
  }
  
  return {
		url: `${baseUrl}/geocode/json`,
		searchParams: createURLSearchParams(params),
  };
}

function formatResult(feature: Feature) {
  const {
    address_components = [],
    formatted_address,
    geometry,
    partial_match,
  } = feature || {};

  const components: Components = address_components.reduce((acc, item) => {
    const { long_name, short_name, types } = item;

    types.forEach((_type) => {
      const type = snakeToCamel(_type);

      // if type is already found
      if (acc[type] || type === "political") {
        return;
      }

      if (type === "country") {
        acc[type] = long_name;
        acc["countryCode"] = short_name;
      }

      acc[type] = long_name;
    });

    return acc;
  }, {});

  const {
    country,
    countryCode,
    administrativeAreaLevel1,
    administrativeAreaLevel2,
    administrativeAreaLevel3,
    locality,
    postalTown,
    postalCode,
    route,
    streetNumber,
    ...extra
  } = components;

  extra.confidence = Number(!partial_match);

  const formatted: GeocoderUnifiedResult = {
    formattedAddress: formatted_address,
    latitude: geometry?.location?.lat,
    longitude: geometry?.location?.lng,
    country,
    countryCode,
    state: administrativeAreaLevel1,
    region: administrativeAreaLevel2,
    district: administrativeAreaLevel3,
    city: locality || postalTown,
    zipcode: postalCode,
    streetName: route,
    streetNumber,
    extra,
  };

  return formatted;
}
