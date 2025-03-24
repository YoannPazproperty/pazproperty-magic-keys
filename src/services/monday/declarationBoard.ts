
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
    console.log("Column values before JSON conversion:", columnValues);
    
    // Convert column values to Monday.com format with the correct column IDs
    // Monday.com expects column values in a specific format with text/dropdown values mapped to their IDs
    const mondayFormattedValues: Record<string, any> = {};
    
    // Map each column with the proper format based on column type
    Object.entries(columnValues).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      switch(key) {
        case "Nome do Inquilino":
        case "Email":
        case "Telefone":
        case "Endereço":
        case "Cidade":
        case "Codigo Postal":
        case "Descrição":
        case "ID Declaração":
        case "NIF":
          // Text columns - simple text
          mondayFormattedValues[key] = { text: String(value) };
          break;
          
        case "Tipo de problema":
          // Dropdown column - needs the exact label that exists in Monday
          mondayFormattedValues[key] = { label: String(value) };
          break;
          
        case "Urgência":
          // Status column - needs the exact label that exists in Monday
          mondayFormattedValues[key] = { label: String(value) };
          break;
          
        case "Status":
          // Status column - needs the exact label that exists in Monday
          // Map our status values to Monday.com status column values
          let statusLabel = "Nouveau"; // Default
          if (value === "pending") statusLabel = "Nouveau";
          else if (value === "in_progress") statusLabel = "En cours";
          else if (value === "resolved") statusLabel = "Fait";
          
          mondayFormattedValues[key] = { label: statusLabel };
          break;
          
        case "Data de submissão":
          // Date column
          if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              mondayFormattedValues[key] = { date: date.toISOString().split('T')[0] };
            }
          }
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
      boardId: boardId,
      itemName,
      columnValues: JSON.stringify(mondayFormattedValues)
    };
    
    console.log("Sending query to Monday.com with variables:", variables);
    
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
