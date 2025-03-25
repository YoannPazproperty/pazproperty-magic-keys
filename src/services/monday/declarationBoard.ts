
import { getMondayConfig } from "./mondayConfig";

// Create Monday.com item based on the actual board structure
export const createMondayItem = async (
  itemName: string, 
  columnValues: Record<string, any>,
  groupId?: string
): Promise<string | null> => {
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
    console.log("Group ID:", groupId || "Not specified (using default group)");
    console.log("API Key available:", apiKey ? "Yes" : "No");
    console.log("Column values (original):", columnValues);
    
    // Monday.com requires the column values to be sent as a JSON string
    const columnValuesString = JSON.stringify(columnValues);
    console.log("Column values after JSON.stringify:", columnValuesString);
    
    // Make the actual API call to Monday.com
    // Include group_id in the mutation if it's provided
    const query = groupId 
      ? `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!, $groupId: String!) {
          create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues, group_id: $groupId) {
            id
          }
        }`
      : `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
          create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
          }
        }`;
    
    const variables: Record<string, any> = {
      boardId: boardId,
      itemName,
      columnValues: columnValuesString
    };
    
    // Add groupId to variables if provided
    if (groupId) {
      variables.groupId = groupId;
    }
    
    console.log("Sending API request to Monday.com with variables:", JSON.stringify(variables, null, 2));
    console.log("Complete query:", query);
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    // Log response status
    console.log("Monday.com API response status:", response.status, response.statusText);
    
    // Get response as text for debugging
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
        // Log each error in detail
        responseData.errors.forEach((error: any, index: number) => {
          console.error(`Error ${index + 1}:`, error.message);
        });
        return null;
      }
      
      if (responseData.data && responseData.data.create_item) {
        console.log("Successfully created item with ID:", responseData.data.create_item.id);
        return responseData.data.create_item.id;
      } else {
        console.error("Unexpected response structure from Monday.com:", responseData);
        return null;
      }
    } catch (parseError) {
      console.error("Error parsing Monday.com response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return null;
  }
};
