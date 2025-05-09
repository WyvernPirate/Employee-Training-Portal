import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateData {
  id: string;
  title: string;
  employeeId: string;
  employeeName?: string;
  issuedDate: Date;
  issuingBody: string;
  quizTitle?: string;
  relatedTrainingContentId?: string;
}

const CertificateViewer = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certificateId) {
      toast.error("Certificate ID is missing.");
      navigate(-1); // Go back to the previous page
      return;
    }

    const fetchCertificateDetails = async () => {
      setIsLoading(true);
      try {
        const certDocRef = doc(db, "certificates", certificateId);
        const certDocSnap = await getDoc(certDocRef);

        if (certDocSnap.exists()) {
          const data = certDocSnap.data();
          let certData: CertificateData = {
            id: certDocSnap.id,
            title: data.title,
            employeeId: data.employeeId,
            issuedDate: data.issuedDate?.toDate ? data.issuedDate.toDate() : new Date(data.issuedDate),
            issuingBody: data.issuingBody || "Spare Parts Classroom",
            relatedTrainingContentId: data.relatedTrainingContentId,
          };

          // Fetch employee name
          if (data.employeeId) {
            const empDocRef = doc(db, "employees", data.employeeId);
            const empDocSnap = await getDoc(empDocRef);
            if (empDocSnap.exists()) {
              const empData = empDocSnap.data();
              certData.employeeName = `${empData.firstName} ${empData.surname}`.trim() || "Valued Employee";
            }
          }

          // Fetch related quiz title if quizId is stored
          if (data.quizId) {
            const quizDocRef = doc(db, "assessments", data.quizId);
            const quizDocSnap = await getDoc(quizDocRef);
            if (quizDocSnap.exists()) {
              certData.quizTitle = quizDocSnap.data()?.title;
            }
          }
          setCertificate(certData);
        } else {
          toast.error("Certificate not found.");
          navigate('/employee-dashboard');
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
        toast.error("Failed to load certificate details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificateDetails();
  }, [certificateId, navigate]);

  const handleDownloadPdf = async () => {
    if (!certificateTemplateRef.current || !certificate) {
      toast.error("Certificate template not ready for download.");
      return;
    }
    setIsDownloading(true);
    toast.info("Generating PDF, please wait...", { duration: 4000 });

    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Short delay for rendering

      const canvas = await html2canvas(certificateTemplateRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.employeeName?.replace(/\s+/g, '_')}_${certificate.title.replace(/\s+/g, '_')}.pdf`);
      toast.success("Certificate PDF downloaded!");
    } catch (err) {
      console.error("Error generating PDF: ", err);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#ea384c]" /> <p className="ml-4 text-xl">Loading Certificate...</p></div>;
  if (!certificate) return <div className="min-h-screen flex items-center justify-center"><p>Certificate not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </div>

        {/* Certificate Template */}
        <div ref={certificateTemplateRef} className="bg-white p-10 shadow-xl rounded-lg border-4 border-yellow-500 aspect-[1.414/1] max-w-[800px] mx-auto printable-certificate-styles">
           {/* Basic A4-ish aspect ratio. You'll need to style this div to look like a certificate. */}
          <style>{`
            .printable-certificate-styles { font-family: 'Georgia', serif; color: #333; }
            .printable-certificate-styles h1, .printable-certificate-styles h2, .printable-certificate-styles h3 { font-family: 'Times New Roman', Times, serif; }
          `}</style>
          <div className="text-center mb-8">
            <Award className="h-24 w-24 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">{certificate.issuingBody}</h1>
            <p className="text-xl text-gray-600 mt-2">Certificate of Achievement</p>
          </div>

          <div className="text-center my-10">
            <p className="text-lg mb-2">This certificate is proudly presented to</p>
            <h2 className="text-3xl font-semibold text-[#ea384c] my-3">{certificate.employeeName || "Valued Employee"}</h2>
            <p className="text-lg">for successfully completing the requirements for</p>
            <h3 className="text-2xl font-medium text-gray-700 mt-2">{certificate.title}</h3>
            {certificate.quizTitle && certificate.quizTitle !== certificate.title && <p className="text-sm text-gray-500">(Assessment: {certificate.quizTitle})</p>}
          </div>

          <div className="mt-12 flex justify-between items-end text-sm">
            <div><p className="font-semibold">Issued Date:</p><p>{certificate.issuedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div><p className="font-semibold">Certificate ID:</p><p className="text-xs">{certificate.id}</p></div>
          </div>
           <div className="mt-8 border-t-2 border-dashed border-yellow-500 pt-4 text-center text-xs text-gray-500">
            This certificate acknowledges the recipient's dedication and successful completion of the requirements set forth by {certificate.issuingBody}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;