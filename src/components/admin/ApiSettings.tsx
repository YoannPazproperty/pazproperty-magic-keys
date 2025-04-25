
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ApiSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration API</CardTitle>
        <CardDescription>
          Configurez les intégrations externes ici.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Aucune intégration externe n'est actuellement configurée.
        </p>
      </CardContent>
    </Card>
  );
};
