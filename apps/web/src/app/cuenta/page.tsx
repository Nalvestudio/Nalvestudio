import type { Metadata } from 'next';
import { AccountScreen } from '@/components/account/AccountScreen';
import { BackHeader } from '@/components/site/BackHeader';
import { ChatBot } from '@/components/site/ChatBot';

export const metadata: Metadata = { title: 'Mi cuenta | nalv.estudio' };

// Ported from legacy cuenta.html.
export default function AccountPage() {
  return (
    <>
      <BackHeader label="← Volver a la tienda" />
      <AccountScreen />
      <ChatBot />
    </>
  );
}
