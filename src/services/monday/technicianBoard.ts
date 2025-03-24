
import { getMondayConfig } from "./mondayConfig";

// Create technician report in Monday.com
export const createTechnicianReport = async (
  itemName: string,
  columnValues: Record<string, any>
): Promise<string | null> => {
  try {
    // Get the API key and technician board ID
    const { apiKey, techBoardId } = getMondayConfig();
    
    if (!apiKey || !techBoardId) {
      console.error("Monday.com API key or technician board ID not configured");
      return null;
    }
    
    console.log("Creating Monday.com technician report with the following data:");
    console.log("Item Name:", itemName);
    console.log("Tech Board ID:", techBoardId);
    console.log("API Key available:", apiKey ? "Yes" : "No");
    console.log("Monday.com formatted column values:", columnValues);
    
    // Make the actual API call to Monday.com
    // Fix the GraphQL query to use ID! instead of Int! for boardId
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: techBoardId, // Send as string - will be coerced to ID type
      itemName,
      columnValues: JSON.stringify(columnValues)
    };
    
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
      console.error("Monday.com API error for technician report:", errorText);
      return null;
    }
    
    const responseData = await response.json();
    
    if (responseData.errors) {
      console.error("Monday.com GraphQL errors for technician report:", responseData.errors);
      return null;
    }
    
    console.log("Monday.com API response for technician report:", responseData);
    
    if (responseData.data && responseData.data.create_item) {
      return responseData.data.create_item.id;
    } else {
      console.error("Unexpected response structure from Monday.com for technician report");
      return null;
    }
  } catch (error) {
    console.error("Error creating Monday.com technician report:", error);
    return null;
  }
};
