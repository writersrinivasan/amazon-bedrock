import { notFound } from "next/navigation";
import { USE_CASES, getUseCase } from "@/lib/content/usecases";
import UseCaseView from "@/components/usecase/UseCaseView";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getUseCase(slug)) notFound();
  return <UseCaseView slug={slug} />;
}
