import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeclarationsTable from "@/components/admin/DeclarationsTable";

const AdminPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Administração de Declarações</h1>
          <DeclarationsTable />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage; 