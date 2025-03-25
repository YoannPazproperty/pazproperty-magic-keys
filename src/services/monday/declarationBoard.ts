
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
    
    // Create the correctly formatted columnValues for Monday.com
    const mondayFormatted: Record<string, any> = {};
    
    // Format each column value properly
    Object.entries(columnValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Format different column types according to Monday.com requirements
        if (key === "mediaFiles" && Array.isArray(value)) {
          // Format media files as a list of links
          const formattedLinks = value.map((url, idx) => {
            const fileType = url.includes('image') ? 'Photo' : url.includes('video') ? 'Vidéo' : 'Fichier';
            return { url, text: `${fileType} ${idx + 1}` };
          });
          mondayFormatted[key] = JSON.stringify(formattedLinks);
        } else if (key === "status" && typeof value === 'object' && value.label) {
          // Status is already formatted correctly
          mondayFormatted[key] = JSON.stringify(value);
        } else if (key === "priority" && typeof value === 'object' && value.label) {
          // Priority is already formatted correctly
          mondayFormatted[key] = JSON.stringify(value);
        } else if (key === "status" && typeof value === 'string') {
          // Format status as a status column value
          mondayFormatted[key] = JSON.stringify({ label: value });
        } else if (key === "priority" && typeof value === 'string') {
          // Format priority as a dropdown column value
          mondayFormatted[key] = JSON.stringify({ label: value });
        } else {
          // For regular text/number/etc columns
          mondayFormatted[key] = value;
        }
      }
    });
    
    console.log("Formatted for Monday.com:", mondayFormatted);
    
    // Make the actual API call to Monday.com with corrected types
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: boardId,
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
