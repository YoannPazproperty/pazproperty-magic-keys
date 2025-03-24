
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
    console.log("Column values before JSON stringify:", columnValues);
    
    // Monday.com expects column values as a JSON string
    // Important: For the API, we need to directly stringify the columnValues object
    // WITHOUT wrapping each value in nested objects like {text: value}
    const mondayColumnValues = JSON.stringify(columnValues);
    
    console.log("Monday.com column values after stringify:", mondayColumnValues);
    
    // Make the actual API call to Monday.com
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: boardId,
      itemName,
      columnValues: mondayColumnValues
    };
    
    console.log("Sending query to Monday.com with variables:", {
      boardId: variables.boardId,
      itemName: variables.itemName,
      // Log a preview of the column values for debugging
      columnValues: mondayColumnValues.substring(0, 500) + "..."
    });
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Monday.com API error:", errorText);
      return null;
    }
    
    const responseData = await response.json();
    
    if (responseData.errors) {
      console.error("Monday.com GraphQL errors:", responseData.errors);
      return null;
    }
    
    console.log("Monday.com API response:", responseData);
    
    if (responseData.data && responseData.data.create_item) {
      return responseData.data.create_item.id;
    } else {
      console.error("Unexpected response structure from Monday.com");
      return null;
    }
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    return null;
  }
};
