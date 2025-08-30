'use client';

import { EdgeStoreRouter } from '@/app/api/edgestore/[...edgestore]/edgestore-options';
import { createEdgeStoreProvider } from '@edgestore/react';

const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };