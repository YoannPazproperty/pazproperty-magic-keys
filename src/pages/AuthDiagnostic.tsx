
import AuthDiagnosticTool from "@/components/auth/AuthDiagnosticTool";

export default function AuthDiagnosticPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 py-16">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Diagnostic d'authentification</h1>
        <AuthDiagnosticTool />
      </div>
    </div>
  );
}
