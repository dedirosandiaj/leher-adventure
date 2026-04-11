import { getEquipmentItems, getMemberEquipment, toggleEquipment } from './actions';
import EquipmentClient from './EquipmentClient';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerlengkapanPage() {
  unstable_noStore();
  const equipmentItems = await getEquipmentItems();
  const memberEquipment = await getMemberEquipment();

  return (
    <EquipmentClient 
      equipmentItems={equipmentItems} 
      memberEquipment={memberEquipment}
      toggleEquipment={toggleEquipment}
    />
  );
}
