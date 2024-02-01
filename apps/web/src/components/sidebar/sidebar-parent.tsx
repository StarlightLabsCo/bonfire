import { Suspense } from 'react';
import { SidebarServer } from './sidebar-server';
import { SidebarSkeleton } from './sidebar-skeleton';

export function SidebarParent() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarServer />
    </Suspense>
  );
}
