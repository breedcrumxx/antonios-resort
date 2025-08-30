'use client';

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function UserInformation({ user }: { user: UserSession }) {

  return (
    <>
      <div>
        <Label>Full name</Label>
        <Input placeholder="Full name" className="w-full sm:max-w-[50%]"
          value={user.name}
          disabled={true}
          required
        />
      </div>
      <div>
        <Label>Email address</Label>
        <Input placeholder="Email address" className="w-full sm:max-w-[50%]"
          value={user.email}
          disabled={true}
          required
        />
      </div>
    </>
  )
}