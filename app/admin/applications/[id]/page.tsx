import { ApplicationDetail } from "@/components/application-detail";
export default function OfficerReviewPage({ params }: { params: { id: string } }) {
  return <ApplicationDetail id={params.id} mode="officer" backHref="/admin" />;
}
