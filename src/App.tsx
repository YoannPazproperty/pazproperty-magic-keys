
import { QueryClient } from "@tanstack/react-query";
import { AppProviders } from "./components/AppProviders";
import { AppRouter } from "./router/AppRouter";
import { useSupabaseInit } from "./hooks/useSupabaseInit";
import { LanguageProvider } from "./contexts/LanguageContext";

// Configure the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000
    }
  }
});

const App = () => {
  const connectionStatus = useSupabaseInit();
  
  return (
    <AppProviders queryClient={queryClient}>
      <LanguageProvider>
        <AppRouter connectionStatus={connectionStatus} />
      </LanguageProvider>
    </AppProviders>
  );
};

export default App;
