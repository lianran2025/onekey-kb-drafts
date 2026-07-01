import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const email = await getSessionEmail();
  redirect(email ? '/admin' : '/login');
}
