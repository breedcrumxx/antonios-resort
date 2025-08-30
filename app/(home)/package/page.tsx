import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import PackageRenderer from './package-components/package-renderer';
import PaginationProvider from './package-components/pagination-provider';

export default async function PackagePage() {

  const session = await getServerSession(options)
  await new Promise(resolve => setTimeout(resolve, 2000))

  return (
    <PaginationProvider>
      <div className="min-w-screen h-auto bg-muted/30">
        <div className="w-full flex justify-center">
          <div className="w-[1000px] min-h-screen my-10">
            <PackageRenderer
              user={session ? session.user as UserSession : null}
            />
          </div>
        </div>
      </div>
    </PaginationProvider>
  )
}