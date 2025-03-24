
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
    
    // Prepare column values for Monday.com API
    // This step is critical - Monday.com requires properly formatted JSON for its column values
    const formattedColumnValues = {};
    
    // Process each value to ensure proper formatting based on column type
    Object.entries(columnValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Monday.com expects a specifically formatted JSON string
        switch (key) {
          case 'email':
            formattedColumnValues[key] = JSON.stringify({ "email": value, "text": value });
            break;
          case 'phone':
            formattedColumnValues[key] = JSON.stringify({ "phone": value, "countryShortName": "PT" });
            break;
          case 'status':
            formattedColumnValues[key] = JSON.stringify({ "label": value });
            break;
          case 'priority':
            formattedColumnValues[key] = JSON.stringify({ "label": value });
            break;
          case 'date4':
            formattedColumnValues[key] = JSON.stringify({ "date": value });
            break;
          case 'dropdown':
          case 'dropdown5':
            formattedColumnValues[key] = JSON.stringify({ "label": value });
            break;
          case 'numbers8':
            // Convert to number if possible
            const numValue = isNaN(Number(value)) ? 0 : Number(value);
            formattedColumnValues[key] = JSON.stringify(numValue);
            break;
          default:
            // Text columns just need their values as strings
            formattedColumnValues[key] = JSON.stringify(value);
        }
      }
    });
    
    console.log("Formatted column values for Monday.com API:", formattedColumnValues);
    
    // Make the actual API call to Monday.com
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: boardId,
      itemName,
      columnValues: formattedColumnValues
    };
    
    console.log("Sending query to Monday.com with variables:", {
      boardId: variables.boardId,
      itemName: variables.itemName,
      columnValues: variables.columnValues
    });
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    const responseData = await response.json();
    
    // Log the full response for better debugging
    console.log("Monday.com API full response:", responseData);
    
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
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    return null;
  }
};
