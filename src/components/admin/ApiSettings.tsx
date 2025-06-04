
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { InfoIcon } from "lucide-react";

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
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Les intégrations externes ont été désactivées. Si vous souhaitez configurer une nouvelle intégration, 
            veuillez contacter votre administrateur.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
