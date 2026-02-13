import FeedbackButton from '@/components/FeedbackButton';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FeedbackButton />
    </>
  );
}
