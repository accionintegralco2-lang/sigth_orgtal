import { PersonProfileView } from "@/components/person-profile-view";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonProfileView personId={id} />;
}
