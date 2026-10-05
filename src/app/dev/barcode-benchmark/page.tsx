import { notFound } from 'next/navigation';
import BarcodeBenchmark from './benchmark';

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <BarcodeBenchmark />;
}
