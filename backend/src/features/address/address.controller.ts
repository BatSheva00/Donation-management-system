import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { AppError } from "../../shared/utils/AppError";

/**
 * Search for Israeli cities
 */
export const searchCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return next(new AppError("Query parameter is required", 400));
    }

    // Clean the query - trim and replace spaces with +
    const cleanQuery = query.trim().replace(/\s+/g, "+");

    // Don't search for very short queries
    if (cleanQuery.length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Call Israeli government API using GET (works better with Hebrew)
    const response = await axios.get(
      "https://data.gov.il/api/3/action/datastore_search",
      {
        params: {
          resource_id: "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba",
          limit: 20,
          offset: 0,
          fields: "שם_ישוב",
          distinct: true,
          sort: "שם_ישוב",
          include_total: false,
          plain: false,
          q: JSON.stringify({
            שם_ישוב: `*${cleanQuery}:*`,
          }),
        },
      }
    );

    // Extract city names from response
    const cities = response.data.result.records.map((record: any) =>
      record.שם_ישוב.trim()
    );

    res.json({
      success: true,
      data: cities,
    });
  } catch (error: any) {
    // Return empty array on error instead of failing
    res.json({
      success: true,
      data: [],
    });
  }
};

/**
 * Search for Israeli streets
 */
export const searchStreets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, city } = req.query;

    if (!query || typeof query !== "string") {
      return next(new AppError("Query parameter is required", 400));
    }

    // Clean the query - trim and replace spaces with +
    const cleanQuery = query.trim().replace(/\s+/g, "+");

    // Don't search for very short queries
    if (cleanQuery.length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Build query object for streets
    const queryObj: any = {
      שם_רחוב: `${cleanQuery}:*`,
    };
    if (city) {
      queryObj["שם_ישוב"] = city;
    }

    // Call Israeli government API for streets using GET (works better with Hebrew)
    const response = await axios.get(
      "https://data.gov.il/api/3/action/datastore_search",
      {
        params: {
          resource_id: "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3",
          limit: 20,
          offset: 0,
          fields: "שם_רחוב",
          distinct: true,
          sort: "שם_רחוב",
          include_total: false,
          plain: false,
          q: JSON.stringify(queryObj),
        },
      }
    );

    // Extract street names from response
    const streets = response.data.result.records.map((record: any) =>
      record.שם_רחוב.trim()
    );

    res.json({
      success: true,
      data: streets,
    });
  } catch (error: any) {
    console.error("Street search error:", error.message);
    // Return empty array on error instead of failing
    res.json({
      success: true,
      data: [],
    });
  }
};

/**
 * Lookup postal code from OpenStreetMap Nominatim API
 * If no result, retry by removing first word from street after 2 seconds
 */
export const lookupPostalCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { street, city } = req.query;

    if (!street || !city) {
      return next(new AppError("Street and city are required", 400));
    }

    // Clean street - replace spaces with +
    const cleanStreet = (street as string).trim().replace(/\s+/g, "+");
    const cleanCity = (city as string).trim().replace(/\s+/g, "+");

    // Helper function to lookup with specific street
    const lookup = async (streetToSearch: string) => {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            street: streetToSearch,
            city: cleanCity,
            country: "Israel",
            format: "json",
            addressdetails: 1,
          },
          headers: {
            "User-Agent": "FoodDonationApp/1.0", // Nominatim requires a User-Agent
          },
        }
      );
      return response.data;
    };

    // Try with full street name first
    let results = await lookup(cleanStreet);

    // If no results and street has multiple words, try once more without the first word
    if ((!results || results.length === 0) && cleanStreet.includes("+")) {
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const streetWords = cleanStreet.split("+");
      const shortenedStreet = streetWords.slice(1).join("+");

      if (shortenedStreet) {
        results = await lookup(shortenedStreet);
      }
    }

    if (results && results.length > 0) {
      const result = results[0];
      const postcode = result.address?.postcode || null;

      res.json({
        success: true,
        data: {
          postcode,
          fullAddress: result.display_name,
          coordinates: {
            lat: result.lat,
            lon: result.lon,
          },
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          postcode: null,
          message: "No results found for this address",
        },
      });
    }
  } catch (error: any) {
    console.error("Postal code lookup error:", error.message);
    res.json({
      success: false,
      message: "Failed to lookup postal code",
    });
  }
};
