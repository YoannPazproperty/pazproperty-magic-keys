
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
    
    // Create the correct formatted columnValues for Monday.com
    // Monday.com is very specific about the format
    const mondayFormatted = {};
    
    // Simplify formatting - use direct string values for text fields
    Object.entries(columnValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        mondayFormatted[key] = value;
      }
    });
    
    console.log("Simplified format for Monday.com:", mondayFormatted);
    
    // Make the actual API call to Monday.com
    const query = `mutation ($boardId: Int!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: parseInt(boardId),
      itemName,
      columnValues: JSON.stringify(mondayFormatted)
    };
    
    console.log("Sending query to Monday.com with variables:", {
      boardId: variables.boardId,
      itemName: variables.itemName,
      columnValuesJSON: variables.columnValues
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
    
    const responseData = responseText ? JSON.parse(responseText) : null;
    console.log("Monday.com API parsed response:", responseData);
    
    if (responseData && responseData.errors) {
      console.error("Monday.com GraphQL errors:", responseData.errors);
      return null;
    }
    
    if (responseData && responseData.data && responseData.data.create_item) {
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
