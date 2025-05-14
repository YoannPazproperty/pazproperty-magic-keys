
import React from 'react';
import DeploymentTargetSelector from './DeploymentTargetSelector';
import DeployButton from './DeployButton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DeploymentPanel = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deployment Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DeploymentTargetSelector />
        <div className="flex justify-end mt-4">
          <DeployButton />
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentPanel;
