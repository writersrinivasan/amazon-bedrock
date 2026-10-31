import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/lib/content/modules";
import LessonView from "@/components/lesson/LessonView";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();
  return <LessonView slug={mod.slug} />;
}
