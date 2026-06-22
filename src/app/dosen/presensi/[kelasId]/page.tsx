import { getPresensiData } from '@/app/actions/presensi';
import PresensiClient from '@/app/components/dosen/PresensiClient';
import { redirect } from 'next/navigation';

export default async function KelasPresensiPage({ params }: { params: Promise<{ kelasId: string }> }) {
  const resolvedParams = await params;
  const data = await getPresensiData(resolvedParams.kelasId);

  if (!data) {
    redirect('/dosen/presensi');
  }

  return <PresensiClient data={data} />;
}
