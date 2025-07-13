// app/loading.tsx - Global Loading UI
import React from 'react';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingAnimation size="lg" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading MINTOONS...
        </p>
      </div>
    </div>
  );
}
