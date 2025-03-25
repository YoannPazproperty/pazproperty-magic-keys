
import { getMondayConfig } from "./mondayConfig";

// Create Monday.com item based on the actual board structure
export const createMondayItem = async (itemName: string, columnValues: Record<string, any>): Promise<string | null> => {
  try {
    // Get the API key and board ID from localStorage
    const { apiKey, boardId } = getMondayConfig();
    
    if (!apiKey || !boardId) {
      console.error("Monday.com API key or board ID not configured");
      return null;
    }
    
    console.log("Creating Monday.com item with the following data:");
    console.log("Item Name:", itemName);
    console.log("Board ID:", boardId);
    console.log("API Key available:", apiKey ? "Yes" : "No");
    console.log("Column values:", columnValues);
    
    // Monday.com requires the column values to be sent as a JSON string
    // We'll convert it to the format Monday.com expects
    const columnValuesString = JSON.stringify(columnValues);
    
    // Make the actual API call to Monday.com
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: boardId,
      itemName,
      columnValues: columnValuesString
    };
    
    console.log("Sending API request to Monday.com:", {
      query,
      variables
    });
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    // Log full response for debugging
    const responseText = await response.text();
    console.log("Monday.com API raw response:", responseText);
    
    if (!responseText) {
      console.error("Empty response from Monday.com API");
      return null;
    }
    
    // Parse the response
    try {
      const responseData = JSON.parse(responseText);
      console.log("Monday.com API parsed response:", responseData);
      
      if (responseData.errors) {
        console.error("Monday.com GraphQL errors:", responseData.errors);
        return null;
      }
      
      if (responseData.data && responseData.data.create_item) {
        return responseData.data.create_item.id;
      } else {
        console.error("Unexpected response structure from Monday.com");
        return null;
      }
    } catch (parseError) {
      console.error("Error parsing Monday.com response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    return null;
  }
};
