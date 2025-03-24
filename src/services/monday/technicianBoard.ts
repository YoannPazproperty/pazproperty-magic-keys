
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
    console.log("Column values before JSON conversion:", columnValues);
    
    // Convert column values to Monday.com format with the correct column IDs
    const mondayFormattedValues: Record<string, any> = {};
    
    // Map each column with the proper format based on column type
    Object.entries(columnValues).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      switch(key) {
        case "Cliente":
        case "Email":
        case "Telefone":
        case "Endereço":
        case "Diagnóstico":
        case "Trabalhos a realizar":
        case "ID Intervenção":
        case "Valor estimado":
          // Text columns - simple text
          mondayFormattedValues[key] = { text: String(value) };
          break;
          
        case "Categoria do problema":
          // Dropdown column - needs the exact label that exists in Monday
          mondayFormattedValues[key] = { label: String(value) };
          break;
          
        case "Necessita de intervenção":
          // Status column - needs the exact label that exists in Monday
          mondayFormattedValues[key] = { label: String(value) };
          break;
          
        default:
          // For any other columns, try as text by default
          mondayFormattedValues[key] = { text: String(value) };
      }
    });
    
    console.log("Monday.com formatted column values:", mondayFormattedValues);
    
    // Make the actual API call to Monday.com
    const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: techBoardId,
      itemName,
      columnValues: JSON.stringify(mondayFormattedValues)
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
