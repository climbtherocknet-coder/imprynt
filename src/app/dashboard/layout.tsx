import { auth } from '@/lib/auth';
import FeedbackButton from '@/components/FeedbackButton';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email || undefined;

  const bannerText = process.env.ANNOUNCEMENT_BANNER || '';
  const bannerLink = process.env.ANNOUNCEMENT_BANNER_LINK || undefined;
  const bannerType = (process.env.ANNOUNCEMENT_BANNER_TYPE || 'info') as 'info' | 'warning' | 'success';

  return (
    <>
      {bannerText && (
        <AnnouncementBanner text={bannerText} link={bannerLink} type={bannerType} />
      )}
      {children}
      <FeedbackButton userEmail={email} />
    </>
  );
}
