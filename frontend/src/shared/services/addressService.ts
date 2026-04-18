import api from "../../lib/axios";

export const searchCities = async (query: string): Promise<string[]> => {
  try {
    const response = await api.get("/address/cities", {
      params: { query },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("City search error:", error);
    return [];
  }
};

export const searchStreets = async (
  query: string,
  city?: string
): Promise<string[]> => {
  try {
    const response = await api.get("/address/streets", {
      params: { query, city },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Street search error:", error);
    return [];
  }
};

export const lookupPostalCode = async (street: string, city: string) => {
  const response = await api.get("/address/postal-code", {
    params: { street, city },
  });
  return response.data;
};
