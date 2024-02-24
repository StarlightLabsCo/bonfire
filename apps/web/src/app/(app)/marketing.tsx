import { DesktopMarketing } from './desktop-marketing';
import { MobileMarketing } from './mobile-marketing';

export default function Marketing() {
  return (
    <>
      <MobileMarketing className="md:hidden" />
      <DesktopMarketing className="hidden md:block" />
    </>
  );
}
