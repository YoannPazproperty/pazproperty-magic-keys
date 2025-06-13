import DeclarationsTable from "@/components/admin/DeclarationsTable";
import { useLanguage } from "@/contexts/LanguageContext";

const DeclarationsTab = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{t('admin.declarations.title')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('admin.declarations.description')}
      </p>
      <DeclarationsTable />
    </div>
  );
};

export default DeclarationsTab;
