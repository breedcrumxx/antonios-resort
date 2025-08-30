'use client'

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useState } from "react";
import AcceptedAgreements from "./accepted-agreements";
import ChangeEmailForm from "./change-email-form";
import ChangePasswordForm from "./change-password";

export default function PersonalInformationForm({ user }: { user: UserSession }) {

  // states
  const [changeEmail, setChangeEmail] = useState<boolean>(false)
  const [changePassword, setChangePassword] = useState<boolean>(false)

  return (
    <>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input className="w-full sm:max-w-[50%]" value={user.name} readOnly />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input className="w-full sm:max-w-[50%]" value={user.email} readOnly />
      </div>
      {
        user.role.role != "Client" && (
          <div className="w-full sm:max-w-[50%] space-y-2">
            <Label>Role</Label>
            <Input value={user.role.role} readOnly />
          </div>
        )
      }
      <br />

      <AcceptedAgreements userid={user.id} />


      <p className="font-semibold underline text-sm whitespace-nowrap cursor-pointer" onClick={() => setChangeEmail(true)}>Change email</p>
      <p className="text-sm text-gray-500">Before changing your email address, be sure that the new email address is active and able to receive emails to keep updated from your bookings.</p>
      <p className="font-semibold underline text-sm whitespace-nowrap cursor-pointer" onClick={() => setChangePassword(true)}>Change password</p>
      <ChangeEmailForm
        className="bg-prm"
        open={changeEmail}
        close={() => setChangeEmail(false)}
        prevemail={user.email}
      />

      <ChangePasswordForm
        className="bg-prm"
        open={changePassword}
        close={() => setChangePassword(false)}
        email={user.email} />
    </>
  )
}