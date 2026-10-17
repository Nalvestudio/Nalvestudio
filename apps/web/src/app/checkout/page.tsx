import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { BackHeader } from '@/components/site/BackHeader';
import { ChatBot } from '@/components/site/ChatBot';
import { checkoutCss } from './styles';

export const metadata: Metadata = { title: 'Finalizar pedido | nalv.estudio' };

// Ported from legacy checkout.html.
export default function CheckoutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: checkoutCss }} />
      <BackHeader label="← Seguir eligiendo" />
      <CheckoutForm />
      <ChatBot />
    </>
  );
}
