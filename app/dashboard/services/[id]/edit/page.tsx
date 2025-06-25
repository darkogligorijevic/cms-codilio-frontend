import { useParams } from "next/navigation";
import { ServiceForm } from "../../create/page";

export function EditServicePage() {
  const params = useParams();
  const serviceId = params?.id as string;

  return <ServiceForm mode="edit" serviceId={serviceId} />;
}