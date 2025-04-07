
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from 'lucide-react';

interface CertificatesTabProps {
  certificates: any[];
  setActiveTab: (tab: string) => void;
}

const CertificatesTab = ({ certificates, setActiveTab }: CertificatesTabProps) => {
  return (
    <>
      {certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map(certificate => (
            <Card key={certificate.id}>
              <CardHeader className="text-center border-b pb-6">
                <Award className="h-16 w-16 text-[#ea384c] mx-auto mb-2" />
                <CardTitle>{certificate.title}</CardTitle>
                <CardDescription>Issued for completion of {certificate.course}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Issued Date:</span>
                    <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expiry Date:</span>
                    <span>{new Date(certificate.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>
                  Download Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Certificates Yet</CardTitle>
            <CardDescription className="text-center">
              Complete training courses to earn certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Award className="h-16 w-16 text-gray-300" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setActiveTab("training")}>
              Start Training
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default CertificatesTab;
