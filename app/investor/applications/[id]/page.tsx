import { ApplicationDetail } from "@/components/application-detail";
export default function InvestorReviewPage({ params }: { params: { id: string } }) {
  return <ApplicationDetail id={params.id} mode="investor" backHref="/investor" />;
}
