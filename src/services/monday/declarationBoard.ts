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
    
    // For Monday.com API, column values need to be properly formatted based on column type
    const transformedColumnValues: Record<string, any> = {};
    
    // Process each column value based on its column ID prefix
    for (const [columnId, value] of Object.entries(columnValues)) {
      // Skip null or undefined values
      if (value === null || value === undefined) continue;
      
      // If it's already an object with the correct structure, use it directly
      if (typeof value === 'object' && 
          (value.hasOwnProperty('text') || 
           value.hasOwnProperty('email') || 
           value.hasOwnProperty('phone') || 
           value.hasOwnProperty('number') || 
           value.hasOwnProperty('date') || 
           value.hasOwnProperty('url') || 
           value.hasOwnProperty('label'))) {
        transformedColumnValues[columnId] = value;
        continue;
      }
      
      // Handle specific column types based on their ID prefix
      if (columnId.startsWith('text_')) {
        // Text columns
        transformedColumnValues[columnId] = { "text": String(value) };
      }
      else if (columnId.startsWith('email_')) {
        // Email columns
        transformedColumnValues[columnId] = { "email": String(value) };
      }
      else if (columnId.startsWith('phone_')) {
        // Phone columns
        transformedColumnValues[columnId] = { "phone": String(value) };
      }
      else if (columnId.startsWith('numeric_')) {
        // Numeric columns
        transformedColumnValues[columnId] = { "number": Number(value) || 0 };
      }
      else if (columnId.startsWith('date')) {
        // Date columns
        transformedColumnValues[columnId] = { "date": String(value) };
      }
      else if (columnId.startsWith('link_')) {
        // Link columns
        transformedColumnValues[columnId] = { "url": String(value) };
      }
      else if (columnId === 'status') {
        // Status column - requires label format
        transformedColumnValues[columnId] = typeof value === 'string' 
          ? { "label": value } 
          : value;
      }
      else if (columnId.startsWith('dropdown_')) {
        // Dropdown columns - requires label format
        transformedColumnValues[columnId] = typeof value === 'string' 
          ? { "label": value } 
          : value;
      }
      // Default case: treat as text column
      else {
        transformedColumnValues[columnId] = { "text": String(value) };
      }
    }
    
    // Monday.com requires the column values to be sent as a JSON string
    const columnValuesString = JSON.stringify(transformedColumnValues);
    console.log("Column values after transformation:", transformedColumnValues);
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
