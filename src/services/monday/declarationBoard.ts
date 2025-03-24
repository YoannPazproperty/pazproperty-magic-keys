import { getMondayConfig } from "./mondayConfig";

// Create Monday.com item based on the actual board structure
export const createMondayItem = async (itemName: string, columnValues: Record<string, any>): Promise<string | null> => {
  try {
    // Get the API key and board ID from localStorage
    const apiKey = localStorage.getItem('mondayApiKey');
    const boardId = localStorage.getItem('mondayBoardId');
    
    if (!apiKey || !boardId) {
      console.error("Monday.com API key or board ID not configured");
      return null;
    }
    
    console.log("Creating Monday.com item with the following data:");
    console.log("Item Name:", itemName);
    console.log("Board ID:", boardId);
    console.log("API Key available:", apiKey ? "Yes" : "No");
    
    // Log column values in a way that matches the actual Monday.com board structure
    const mondayColumnMap = {
      // Map our internal field names to the actual Monday.com column IDs
      nome_do_cliente: "Nome do Inquilino",    // client name
      email: "Email",                          // client email
      telefone: "Telefone",                    // client phone
      nif: "NIF",                              // fiscal number
      endereco: "Endereço",                    // property address
      cidade: "Cidade",                        // city
      codigo_postal: "Codigo Postal",          // postal code
      tipo_de_problema: "Tipo de problema",    // issue type
      descricao: "Descrição",                  // description
      urgencia: "Urgência",                    // urgency
      status: "Status",                        // status
      id_declaracao: "ID Declaração",          // declaration ID
      upload_inquilino: "Upload do Inquilino", // uploaded files
      data_submissao: "Data de submissão"      // submission date
    };
    
    // Transform the column values to match Monday.com column IDs
    const mondayFormatValues: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(columnValues)) {
      if (mondayColumnMap[key]) {
        mondayFormatValues[mondayColumnMap[key]] = value;
      } else {
        // For fields not in our map, keep them as is
        mondayFormatValues[key] = value;
      }
    }
    
    console.log("Monday.com formatted column values:", mondayFormatValues);
    
    // In a real implementation, we would make an API call to Monday.com here
    // For now, we're just simulating it with a log
    
    // The real Monday.com API call would look something like this:
    /*
    const query = `mutation ($boardId: Int!, $itemName: String!, $columnValues: JSON!) {
      create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }`;
    
    const variables = {
      boardId: parseInt(boardId),
      itemName,
      columnValues: JSON.stringify(mondayFormatValues)
    };
    
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    const responseData = await response.json();
    return responseData.data.create_item.id;
    */
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a fake item ID
    return `${Date.now()}`;
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    return null;
  }
};
